/**
 * Migration script to move inventory images from document ID-based folders to name-based folders
 * This script will:
 * 1. Get all inventory documents from Firestore
 * 2. For each document, check if it has an imagePath
 * 3. If the imagePath uses the old structure (document ID), move it to the new structure (item name)
 * 4. Update the document with the new imagePath
 */

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../src/config/firebase.js";

const INVENTORY_COLLECTION = "inventory";

/**
 * Sanitize item name for use in storage path
 */
function sanitizeItemName(itemName) {
  return itemName
    .replace(/[^a-zA-Z0-9\s-_]/g, "") // Remove special characters except spaces, hyphens, underscores
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .toLowerCase(); // Convert to lowercase
}

/**
 * Check if an imagePath uses the old structure (document ID)
 */
function isOldImagePath(imagePath, documentId) {
  return imagePath.includes(`inventory/${documentId}/`);
}

/**
 * Get the new imagePath based on item name
 */
function getNewImagePath(imagePath, itemName) {
  const fileName = imagePath.split("/").pop(); // Get the filename
  const sanitizedName = sanitizeItemName(itemName);
  return `inventory/${sanitizedName}/${fileName}`;
}

/**
 * Download file from URL and upload to new location
 */
async function moveImageFile(oldPath, newPath) {
  try {
    // Get the file from the old location
    const oldRef = ref(storage, oldPath);
    const downloadURL = await getDownloadURL(oldRef);

    // Download the file
    const response = await fetch(downloadURL);
    const blob = await response.blob();

    // Upload to new location
    const newRef = ref(storage, newPath);
    await uploadBytes(newRef, blob);

    // Get the new download URL
    const newDownloadURL = await getDownloadURL(newRef);

    // Delete the old file
    await deleteObject(oldRef);

    return newDownloadURL;
  } catch (error) {
    console.error(`Error moving file from ${oldPath} to ${newPath}:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function MIGRATE_INVENTORY_IMAGES() {
  try {
    console.log("Starting inventory image migration...");

    // Get all inventory documents
    const inventoryRef = collection(db, INVENTORY_COLLECTION);
    const querySnapshot = await getDocs(inventoryRef);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();
        const documentId = docSnapshot.id;

        // Check if document has an imagePath
        if (!data.imagePath) {
          console.log(`Skipping document ${documentId}: No imagePath`);
          skippedCount++;
          continue;
        }

        // Get item name (handle both name and productName fields)
        const itemName = data.name || data.productName;
        if (!itemName) {
          console.log(`Skipping document ${documentId}: No item name found`);
          skippedCount++;
          continue;
        }

        // Check if imagePath uses old structure
        if (!isOldImagePath(data.imagePath, documentId)) {
          console.log(
            `Skipping document ${documentId}: ImagePath already uses new structure`,
          );
          skippedCount++;
          continue;
        }

        console.log(`Migrating document ${documentId}: "${itemName}"`);

        // Get the old path from the imagePath URL
        const url = new URL(data.imagePath);
        const oldPath = decodeURIComponent(
          url.pathname.split("/o/")[1]?.split("?")[0] || "",
        );

        if (!oldPath) {
          console.log(
            `Skipping document ${documentId}: Could not extract old path from imagePath`,
          );
          skippedCount++;
          continue;
        }

        // Generate new path
        const newPath = getNewImagePath(oldPath, itemName);

        // Move the file
        const newImagePath = await moveImageFile(oldPath, newPath);

        // Update the document with new imagePath
        await updateDoc(doc(db, INVENTORY_COLLECTION, documentId), {
          imagePath: newImagePath,
        });

        console.log(`✓ Migrated: ${oldPath} → ${newPath}`);
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating document ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total documents processed: ${querySnapshot.docs.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log("\n  Some migrations failed. Check the error logs above.");
    } else {
      console.log("\n Migration completed successfully!");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
console.log("Inventory Image Migration Script");
console.log(
  "This script will move inventory images from document ID-based folders to name-based folders.",
);
console.log(
  "Make sure you have backed up your Firebase Storage before running this script.\n",
);

// Uncomment the line below to run the migration
// MIGRATE_INVENTORY_IMAGES();

console.log(
  "Migration script ready. Uncomment the last line to run the migration.",
);
