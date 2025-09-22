/**
 * Migration script to update inventory collection from productName to name field
 * Run this script to migrate existing Firebase documents
 */

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../src/config/firebase.js";

const INVENTORY_COLLECTION = "inventory";

async function migrateInventoryProductName() {
  try {
    console.log("Starting migration of inventory collection...");

    // Get all inventory documents
    const inventoryRef = collection(db, INVENTORY_COLLECTION);
    const querySnapshot = await getDocs(inventoryRef);

    let migratedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();

        // Check if document has productName but no name field
        if (data.productName && !data.name) {
          console.log(
            `Migrating document ${docSnapshot.id}: "${data.productName}"`,
          );

          // Update the document to add name field and remove productName
          await updateDoc(doc(db, INVENTORY_COLLECTION, docSnapshot.id), {
            name: data.productName,
            // Note: We don't remove productName field to avoid breaking existing data
            // You can manually remove it later if needed
          });

          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrating document ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Migration completed!`);
    console.log(`- Documents migrated: ${migratedCount}`);
    console.log(`- Errors: ${errorCount}`);
    console.log(`- Total documents processed: ${querySnapshot.docs.length}`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateInventoryProductName();
