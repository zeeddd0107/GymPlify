import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/config/firebase";

const INVENTORY_COLLECTION = "inventory";

/**
 * Upload image to Firebase Storage
 * @param {File} imageFile - The image file to upload
 * @param {string} itemName - The inventory item name
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadInventoryImage = async (imageFile, itemName) => {
  try {
    // Sanitize the item name for use in storage path
    const sanitizedName = itemName
      .replace(/[^a-zA-Z0-9\s-_]/g, "") // Remove special characters except spaces, hyphens, underscores
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .toLowerCase(); // Convert to lowercase

    // Create a reference to the image in Firebase Storage using item name
    const imageRef = ref(
      storage,
      `inventory/${sanitizedName}/${imageFile.name}`,
    );

    // Upload the image
    const snapshot = await uploadBytes(imageRef, imageFile);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading inventory image:", error);
    throw error;
  }
};

/**
 * Add a new inventory item to Firebase
 * @param {Object} itemData - The inventory item data
 * @param {string} userId - The ID of the user creating the item
 * @param {File} imageFile - Optional image file to upload
 * @returns {Promise<string>} - The document ID of the created item
 */
export const addInventoryItem = async (itemData, userId, imageFile = null) => {
  try {
    const inventoryRef = collection(db, INVENTORY_COLLECTION);

    // Generate SKU based on category and existing count
    const categoryPrefixes = {
      Equipment: "EQ",
      Machines: "MACH",
    };

    // Use counter document for efficient category counting
    const counterRef = doc(db, "counters", "inventory");
    const counterDoc = await getDoc(counterRef);
    const currentCount = counterDoc.data()?.[itemData.category] || 0;
    const categoryCount = currentCount + 1;

    const generatedInventoryCode = `${categoryPrefixes[itemData.category]}-${String(categoryCount).padStart(3, "0")}`;

    // Prepare the item data for Firebase
    const firebaseItemData = {
      name: itemData.name,
      category: itemData.category,
      inventoryCode: generatedInventoryCode,
      quantity: parseInt(itemData.quantity) || 1,
      status: itemData.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
    };

    // If there's an image file, upload it in parallel with document creation
    if (imageFile) {
      try {
        // Start both operations in parallel
        const [docRef, imageUrl] = await Promise.all([
          addDoc(inventoryRef, firebaseItemData),
          uploadInventoryImage(imageFile, itemData.name),
        ]);

        // Update document with image path and counter in a batch
        const batch = writeBatch(db);
        batch.update(docRef, { imagePath: imageUrl });
        batch.set(
          counterRef,
          { [itemData.category]: categoryCount },
          { merge: true },
        );
        await batch.commit();

        return {
          docId: docRef.id,
          inventoryCode: generatedInventoryCode,
          imagePath: imageUrl,
        };
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Still create the item without image
        const docRef = await addDoc(inventoryRef, firebaseItemData);

        // Update counter
        await updateDoc(counterRef, { [itemData.category]: categoryCount });

        return {
          docId: docRef.id,
          inventoryCode: generatedInventoryCode,
          imagePath: null,
        };
      }
    } else {
      // No image - create document and update counter in parallel
      const [docRef] = await Promise.all([
        addDoc(inventoryRef, firebaseItemData),
        updateDoc(counterRef, { [itemData.category]: categoryCount }),
      ]);

      return {
        docId: docRef.id,
        inventoryCode: generatedInventoryCode,
        imagePath: null,
      };
    }
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error;
  }
};

/**
 * Get all inventory items from Firebase
 * @returns {Promise<Array>} - Array of inventory items
 */
export const getInventoryItems = async () => {
  try {
    const inventoryRef = collection(db, INVENTORY_COLLECTION);
    const q = query(inventoryRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const items = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Handle migration from productName to name field
      if (data.productName && !data.name) {
        data.name = data.productName;
      }
      items.push({
        id: doc.id,
        ...data,
      });
    });

    return items;
  } catch (error) {
    console.error("Error getting inventory items:", error);
    throw error;
  }
};

/**
 * Update an inventory item in Firebase
 * @param {string} itemId - The document ID of the item to update
 * @param {Object} updateData - The data to update
 * @param {string} userId - The ID of the user updating the item
 * @param {File} imageFile - Optional new image file to upload
 * @returns {Promise<Object>} - Updated item data with imagePath if applicable
 */
export const updateInventoryItem = async (
  itemId,
  updateData,
  userId,
  imageFile = null,
) => {
  try {
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);

    // Get current item data to determine the name for image upload
    const currentDoc = await getDoc(itemRef);
    const currentData = currentDoc.data();

    // Determine which name to use for image upload
    // If name is being updated, use the new name; otherwise use current name
    const itemNameForUpload =
      updateData.name || currentData.name || currentData.productName;

    // Prepare update data
    const firebaseUpdateData = {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    // If there's a new image file, handle image operations in parallel
    if (imageFile) {
      try {
        // Start image operations in parallel
        const [imageUrl] = await Promise.all([
          uploadInventoryImage(imageFile, itemNameForUpload),
          // Delete old image if it exists
          currentData.imagePath
            ? (async () => {
                try {
                  const url = new URL(currentData.imagePath);
                  const pathMatch = url.pathname.match(/\/o\/(.+)/);

                  if (pathMatch) {
                    const storagePath = decodeURIComponent(pathMatch[1]);
                    const oldImageRef = ref(storage, storagePath);
                    await deleteObject(oldImageRef);
                    console.log("Old image deleted from storage:", storagePath);
                  }
                } catch (deleteError) {
                  console.warn("Error deleting old image:", deleteError);
                }
              })()
            : Promise.resolve(),
        ]);

        firebaseUpdateData.imagePath = imageUrl;
      } catch (imageError) {
        console.error("Error uploading new image:", imageError);
        throw imageError;
      }
    }

    // Update the document
    await updateDoc(itemRef, firebaseUpdateData);

    return firebaseUpdateData;
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

/**
 * Delete an inventory item from Firebase
 * @param {string} itemId - The document ID of the item to delete
 * @param {Object} itemData - The item data (optional, used to get imagePath)
 * @returns {Promise<void>}
 */
export const deleteInventoryItem = async (itemId, itemData = null) => {
  try {
    // Delete the image from Firebase Storage if it exists
    if (itemData && itemData.imagePath) {
      try {
        // Extract the storage path from the download URL
        // Firebase Storage URLs have the format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const url = new URL(itemData.imagePath);
        const pathMatch = url.pathname.match(/\/o\/(.+)/);

        if (pathMatch) {
          // Decode the path (it's URL encoded)
          const storagePath = decodeURIComponent(pathMatch[1]);
          const imageRef = ref(storage, storagePath);
          await deleteObject(imageRef);
          console.log("Image deleted from storage:", storagePath);
        } else {
          console.warn(
            "Could not extract storage path from URL:",
            itemData.imagePath,
          );
        }
      } catch (imageError) {
        console.error("Error deleting image from storage:", imageError);
        // Continue with document deletion even if image deletion fails
      }
    } else if (itemData) {
      // If no imagePath but we have item data, try to construct the path
      // This handles cases where the imagePath might not be stored correctly
      const itemName = itemData.name || itemData.productName;
      if (itemName) {
        try {
          const sanitizedName = itemName
            .replace(/[^a-zA-Z0-9\s-_]/g, "")
            .replace(/\s+/g, "_")
            .toLowerCase();

          // Try to delete the entire folder for this item
          const folderRef = ref(storage, `inventory/${sanitizedName}`);
          await deleteObject(folderRef);
          console.log("Item folder deleted from storage:", sanitizedName);
        } catch (folderError) {
          console.error(
            "Error deleting item folder from storage:",
            folderError,
          );
          // Continue with document deletion even if folder deletion fails
        }
      }
    }

    // Delete the document from Firestore
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    await deleteDoc(itemRef);

    console.log("Item deleted from Firestore:", itemId);
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

/**
 * Get inventory items by category
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} - Array of inventory items in the category
 */
export const getInventoryItemsByCategory = async (category) => {
  try {
    const allItems = await getInventoryItems();
    return allItems.filter((item) => item.category === category);
  } catch (error) {
    console.error("Error getting inventory items by category:", error);
    throw error;
  }
};
