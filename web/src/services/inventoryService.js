import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

const INVENTORY_COLLECTION = "inventory";

/**
 * Add a new inventory item to Firebase
 * @param {Object} itemData - The inventory item data
 * @param {string} userId - The ID of the user creating the item
 * @returns {Promise<string>} - The document ID of the created item
 */
export const addInventoryItem = async (itemData, userId) => {
  try {
    const inventoryRef = collection(db, INVENTORY_COLLECTION);

    // Generate SKU based on category and existing count
    const categoryPrefixes = {
      Products: "PROD",
      Equipment: "EQ",
      Machines: "MACH",
    };

    // Get existing items to count category items
    const existingItems = await getDocs(inventoryRef);
    const categoryCount =
      existingItems.docs.filter(
        (doc) => doc.data().category === itemData.category,
      ).length + 1;

    const generatedSku = `${categoryPrefixes[itemData.category]}-${String(categoryCount).padStart(3, "0")}`;

    // Prepare the item data for Firebase
    const firebaseItemData = {
      productName: itemData.productName,
      category: itemData.category,
      sku: generatedSku,
      status: itemData.status,
      stock: parseInt(itemData.stock),
      minStock: 5, // Default minimum stock
      lastRestocked: serverTimestamp(),
      expiryDate: null, // Default to null
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
    };

    const docRef = await addDoc(inventoryRef, firebaseItemData);
    return { docId: docRef.id, sku: generatedSku };
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
      items.push({
        id: doc.id,
        ...doc.data(),
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
 * @returns {Promise<void>}
 */
export const updateInventoryItem = async (itemId, updateData, userId) => {
  try {
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    await updateDoc(itemRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

/**
 * Delete an inventory item from Firebase
 * @param {string} itemId - The document ID of the item to delete
 * @returns {Promise<void>}
 */
export const deleteInventoryItem = async (itemId) => {
  try {
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    await deleteDoc(itemRef);
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
