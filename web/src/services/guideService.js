import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebase";

class GuideService {
  constructor() {
    this.collectionName = "guides";
  }

  async createGuide(guideData, userId) {
    try {
      console.log("Creating guide with data:", guideData);
      console.log("User ID:", userId);

      const guideRef = await addDoc(collection(db, this.collectionName), {
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        description: guideData.description,
        status: guideData.status || "Draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      });

      console.log("Guide created with ID:", guideRef.id);

      return {
        id: guideRef.id,
        ...guideData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      };
    } catch (error) {
      console.error("Error creating guide:", error);
      throw new Error(`Failed to create guide: ${error.message}`);
    }
  }

  async updateGuide(guideId, guideData, userId) {
    try {
      const guideRef = doc(db, this.collectionName, guideId);

      await updateDoc(guideRef, {
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        description: guideData.description,
        status: guideData.status,
        updatedAt: new Date(),
        updatedBy: userId,
      });

      return {
        id: guideId,
        ...guideData,
        updatedAt: new Date(),
        updatedBy: userId,
      };
    } catch (error) {
      console.error("Error updating guide:", error);
      throw new Error(`Failed to update guide: ${error.message}`);
    }
  }

  async getAllGuides() {
    try {
      console.log("Fetching guides from Firebase...");
      const guidesRef = collection(db, this.collectionName);
      const q = query(guidesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      console.log("Found", querySnapshot.docs.length, "guides");
      const guides = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Guides data:", guides);

      return guides;
    } catch (error) {
      console.error("Error getting guides:", error);
      throw new Error(`Failed to get guides: ${error.message}`);
    }
  }

  async deleteGuide(guideId) {
    try {
      const guideRef = doc(db, this.collectionName, guideId);
      await deleteDoc(guideRef);
    } catch (error) {
      console.error("Error deleting guide:", error);
      throw new Error(`Failed to delete guide: ${error.message}`);
    }
  }
}

export default new GuideService();
