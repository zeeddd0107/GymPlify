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
import { db, storage, auth } from "@/config/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

class GuideService {
  constructor() {
    this.collectionName = "guides";
  }

  async createGuide(guideData, userId, onProgress, createdByName, signal) {
    try {
      console.log("Creating guide with data:", guideData);
      console.log("User ID:", userId);

      // If a video file is provided, upload to Storage first
      let videoUrl = "";
      let videoPath = "";
      if (guideData.videoFile) {
        const file = guideData.videoFile;
        const safeName = `${Date.now()}_${file.name}`;
        const path = `guides/${userId}/${safeName}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type || "video/mp4",
        });
        const cancelUpload = () => {
          try {
            task.cancel();
          } catch (error) {
            console.warn("Failed to cancel upload task:", error);
          }
        };
        // AbortController support
        if (signal) {
          if (signal.aborted) {
            cancelUpload();
            throw new Error("Upload canceled");
          }
          signal.addEventListener("abort", cancelUpload, { once: true });
        }
        await new Promise((resolve, reject) =>
          task.on(
            "state_changed",
            (snap) => {
              if (onProgress) {
                const pct = Math.round(
                  (snap.bytesTransferred / snap.totalBytes) * 100,
                );
                try {
                  onProgress(pct);
                } catch (error) {
                  console.warn("Progress callback error:", error);
                }
              }
            },
            (err) => {
              if (signal) {
                signal.removeEventListener("abort", cancelUpload);
              }
              reject(err);
            },
            resolve,
          ),
        );
        if (signal) {
          signal.removeEventListener("abort", cancelUpload);
        }
        videoUrl = await getDownloadURL(task.snapshot.ref);
        videoPath = path;
      }

      // Allow passing pre-uploaded videoUrl/path when no videoFile
      videoUrl = guideData.videoUrl || videoUrl;
      videoPath = guideData.videoPath || videoPath;

      const guideRef = await addDoc(collection(db, this.collectionName), {
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        instructions: guideData.instructions,
        sets: guideData.sets || "",
        reps: guideData.reps || "",
        status: guideData.status || "Draft",
        videoUrl,
        videoPath,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdByName || userId,
        createdByUid: userId,
      });

      console.log("Guide created with ID:", guideRef.id);

      return {
        id: guideRef.id,
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        instructions: guideData.instructions,
        sets: guideData.sets || "",
        reps: guideData.reps || "",
        status: guideData.status || "Draft",
        videoUrl,
        videoPath,
        videoName: guideData.videoName || "",
        videoSizeMB: guideData.videoSizeMB || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdByName || userId,
        createdByUid: userId,
      };
    } catch (error) {
      console.error("Error creating guide:", error);
      throw new Error(`Failed to create guide: ${error.message}`);
    }
  }

  async updateGuide(
    guideId,
    guideData,
    userId,
    onProgress,
    updatedByName,
    signal,
  ) {
    try {
      const guideRef = doc(db, this.collectionName, guideId);

      // If replacing video, upload the new one and delete the old if provided
      let update = {
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        instructions: guideData.instructions,
        sets: guideData.sets || "",
        reps: guideData.reps || "",
        status: guideData.status,
        updatedAt: new Date(),
        updatedBy: updatedByName || userId,
        updatedByUid: userId,
      };

      if (guideData.videoFile) {
        const file = guideData.videoFile;
        const safeName = `${Date.now()}_${file.name}`;
        const path = `guides/${userId}/${safeName}`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type || "video/mp4",
        });
        const cancelUpload = () => {
          try {
            task.cancel();
          } catch (error) {
            console.warn("Failed to cancel upload task:", error);
          }
        };
        if (signal) {
          if (signal.aborted) {
            cancelUpload();
            throw new Error("Upload canceled");
          }
          signal.addEventListener("abort", cancelUpload, { once: true });
        }
        await new Promise((resolve, reject) =>
          task.on(
            "state_changed",
            (snap) => {
              if (onProgress) {
                const pct = Math.round(
                  (snap.bytesTransferred / snap.totalBytes) * 100,
                );
                try {
                  onProgress(pct);
                } catch (error) {
                  console.warn("Progress callback error:", error);
                }
              }
            },
            (err) => {
              if (signal) {
                signal.removeEventListener("abort", cancelUpload);
              }
              reject(err);
            },
            resolve,
          ),
        );
        if (signal) {
          signal.removeEventListener("abort", cancelUpload);
        }
        const url = await getDownloadURL(task.snapshot.ref);
        update.videoUrl = url;
        update.videoPath = path;

        // delete previous file if path provided on record
        if (guideData.videoPath) {
          try {
            await deleteObject(ref(storage, guideData.videoPath));
          } catch (error) {
            console.warn("Failed to delete old video:", error);
          }
        }
      }

      // If no new upload, but a pre-uploaded videoUrl/path is provided, persist it
      if (!guideData.videoFile && guideData.videoUrl) {
        update.videoUrl = guideData.videoUrl;
        if (guideData.videoPath) update.videoPath = guideData.videoPath;
      }

      await updateDoc(guideRef, update);

      return {
        id: guideId,
        title: guideData.title,
        target: guideData.target,
        category: guideData.category,
        instructions: guideData.instructions,
        sets: guideData.sets || "",
        reps: guideData.reps || "",
        status: guideData.status,
        videoUrl: update.videoUrl ?? guideData.videoUrl,
        videoPath: update.videoPath ?? guideData.videoPath,
        videoName: guideData.videoName || "",
        videoSizeMB: guideData.videoSizeMB || "",
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

  async deleteGuide(guideId, videoPath) {
    try {
      const guideRef = doc(db, this.collectionName, guideId);

      // Determine the path to delete from Storage
      let pathToDelete = videoPath || "";
      if (!pathToDelete) {
        const { getDoc } = await import("firebase/firestore");
        const snap = await getDoc(guideRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.videoPath) pathToDelete = data.videoPath;
        }
      }

      // Attempt Storage deletion first so we don't orphan files
      if (pathToDelete) {
        try {
          // Ensure custom claims (e.g., admin) are present on the token
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              await currentUser.getIdToken(true);
            }
          } catch (error) {
            console.warn("Failed to refresh token:", error);
          }

          await deleteObject(ref(storage, pathToDelete));
        } catch (err) {
          // Ignore not-found; rethrow others so caller can handle (e.g., missing admin permissions)
          const message = err && err.message ? err.message : String(err);
          const code = err && (err.code || err.errorCode);
          if (code !== "storage/object-not-found") {
            console.error("Failed to delete guide video from Storage:", {
              code,
              message,
              pathToDelete,
            });
            throw new Error(
              `Storage delete failed (${code || "unknown"}). Ensure you are an admin.`,
            );
          }
        }
      }

      // Delete the Firestore document afterwards
      await deleteDoc(guideRef);
    } catch (error) {
      console.error("Error deleting guide:", error);
      throw new Error(`Failed to delete guide: ${error.message}`);
    }
  }
}

export default new GuideService();
