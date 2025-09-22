import { firestore } from "./firebase";

class GuideService {
  constructor() {
    this.collectionName = "guides";
  }

  async getAllGuides() {
    try {
      const snapshot = await firestore.collection(this.collectionName).get();
      const guides = [];

      snapshot.forEach((doc) => {
        guides.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return guides;
    } catch (error) {
      console.error("Error fetching guides:", error);
      throw new Error(`Failed to fetch guides: ${error.message}`);
    }
  }

  async getGuidesByCategory(category) {
    try {
      const snapshot = await firestore
        .collection(this.collectionName)
        .where("category", "==", category)
        .get();

      const guides = [];
      snapshot.forEach((doc) => {
        guides.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return guides;
    } catch (error) {
      console.error("Error fetching guides by category:", error);
      throw new Error(`Failed to fetch guides by category: ${error.message}`);
    }
  }

  async getGuideById(guideId) {
    try {
      const doc = await firestore
        .collection(this.collectionName)
        .doc(guideId)
        .get();

      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data(),
        };
      } else {
        throw new Error("Guide not found");
      }
    } catch (error) {
      console.error("Error fetching guide by ID:", error);
      throw new Error(`Failed to fetch guide: ${error.message}`);
    }
  }
}

export default new GuideService();
