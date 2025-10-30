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
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

const ATTENDANCE_COLLECTION = "attendance";

/**
 * Get all attendance records from Firebase
 * @param {number} limitCount - Maximum number of records to fetch (default: 50)
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getAttendanceRecords = async (limitCount = 50) => {
  try {
    const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
    const q = query(
      attendanceRef,
      orderBy("checkInTime", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);

    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        ...data,
      });
    });

    return records;
  } catch (error) {
    console.error("Error getting attendance records:", error);
    throw error;
  }
};

/**
 * Get attendance records for a specific user
 * @param {string} userId - The user ID to filter by
 * @param {number} limitCount - Maximum number of records to fetch (default: 30)
 * @returns {Promise<Array>} - Array of attendance records for the user
 */
export const getAttendanceRecordsByUser = async (userId, limitCount = 30) => {
  try {
    const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
    const q = query(
      attendanceRef,
      where("userId", "==", userId),
      orderBy("checkInTime", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);

    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        ...data,
      });
    });

    return records;
  } catch (error) {
    console.error("Error getting attendance records by user:", error);
    throw error;
  }
};

/**
 * Get attendance records for a specific date range
 * @param {Date} startDate - Start date for the range
 * @param {Date} endDate - End date for the range
 * @returns {Promise<Array>} - Array of attendance records in the date range
 */
export const getAttendanceRecordsByDateRange = async (startDate, endDate) => {
  try {
    const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
    const q = query(
      attendanceRef,
      where("checkInTime", ">=", Timestamp.fromDate(startDate)),
      where("checkInTime", "<", Timestamp.fromDate(endDate)),
      orderBy("checkInTime", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        ...data,
      });
    });

    return records;
  } catch (error) {
    console.error("Error getting attendance records by date range:", error);
    throw error;
  }
};

/**
 * Get a single attendance record by ID
 * @param {string} recordId - The document ID of the attendance record
 * @returns {Promise<Object|null>} - The attendance record or null if not found
 */
export const getAttendanceRecord = async (recordId) => {
  try {
    const recordRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    const recordDoc = await getDoc(recordRef);

    if (recordDoc.exists()) {
      return {
        id: recordDoc.id,
        ...recordDoc.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting attendance record:", error);
    throw error;
  }
};

/**
 * Update an attendance record in Firebase
 * @param {string} recordId - The document ID of the record to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - Updated record data
 */
export const updateAttendanceRecord = async (recordId, updateData) => {
  try {
    const recordRef = doc(db, ATTENDANCE_COLLECTION, recordId);

    // Prepare update data with server timestamp
    const firebaseUpdateData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // Update the document
    await updateDoc(recordRef, firebaseUpdateData);

    return firebaseUpdateData;
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }
};

/**
 * Delete an attendance record from Firebase
 * @param {string} recordId - The document ID of the record to delete
 * @returns {Promise<void>}
 */
export const deleteAttendanceRecord = async (recordId) => {
  try {
    const recordRef = doc(db, ATTENDANCE_COLLECTION, recordId);
    await deleteDoc(recordRef);

    console.log("Attendance record deleted:", recordId);
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw error;
  }
};

/**
 * Add a new attendance record to Firebase
 * @param {Object} attendanceData - The attendance data
 * @returns {Promise<string>} - The document ID of the created record
 */
export const addAttendanceRecord = async (attendanceData) => {
  try {
    const attendanceRef = collection(db, ATTENDANCE_COLLECTION);

    // Prepare the attendance data for Firebase
    const firebaseAttendanceData = {
      ...attendanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add the document
    const docRef = await addDoc(attendanceRef, firebaseAttendanceData);

    return docRef.id;
  } catch (error) {
    console.error("Error adding attendance record:", error);
    throw error;
  }
};

/**
 * Get today's attendance records
 * @returns {Promise<Array>} - Array of today's attendance records
 */
export const getTodaysAttendanceRecords = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    return await getAttendanceRecordsByDateRange(startOfDay, endOfDay);
  } catch (error) {
    console.error("Error getting today's attendance records:", error);
    throw error;
  }
};

/**
 * Get attendance statistics
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} - Attendance statistics
 */
export const getAttendanceStatistics = async (startDate, endDate) => {
  try {
    const records = await getAttendanceRecordsByDateRange(startDate, endDate);

    const stats = {
      totalRecords: records.length,
      uniqueUsers: new Set(records.map((record) => record.userId)).size,
      checkIns: records.filter((record) => !record.checkOutTime).length,
      checkOuts: records.filter((record) => record.checkOutTime).length,
    };

    return stats;
  } catch (error) {
    console.error("Error getting attendance statistics:", error);
    throw error;
  }
};

/**
 * Auto-checkout any open attendances from previous days by setting
 * checkOutTime to 23:59 of the same day and computing duration.
 * Safe to call on dashboard load; ignores already-checked-out records.
 */
export const autoCheckoutStaleAttendance = async () => {
  try {
    const attendanceRef = collection(db, ATTENDANCE_COLLECTION);
    const q = query(attendanceRef, orderBy("checkInTime", "desc"), limit(300));
    const snap = await getDocs(q);

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const updates = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.checkOutTime) return;
      const checkIn = data.checkInTime?.toDate ? data.checkInTime.toDate() : null;
      if (!checkIn) return;
      const key = `${checkIn.getFullYear()}-${checkIn.getMonth()}-${checkIn.getDate()}`;
      if (key !== todayKey) {
        const endOfDay = new Date(
          checkIn.getFullYear(),
          checkIn.getMonth(),
          checkIn.getDate(),
          23,
          59,
          0,
          0,
        );
        const duration = Math.max(0, Math.round((endOfDay - checkIn) / 60000));
        updates.push(
          updateDoc(doc(db, ATTENDANCE_COLLECTION, docSnap.id), {
            checkOutTime: endOfDay,
            duration,
            updatedAt: serverTimestamp(),
          }),
        );
      }
    });

    if (updates.length) {
      await Promise.allSettled(updates);
    }
  } catch (error) {
    console.error("Auto-checkout failed:", error);
  }
};
