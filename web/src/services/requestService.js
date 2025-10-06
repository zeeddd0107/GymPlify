import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

/**
 * Fetch all pending subscription requests
 */
export const fetchPendingSubscriptions = async () => {
  try {
    const q = query(
      collection(db, "pendingSubscriptions"),
      orderBy("requestDate", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const requests = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching pending subscriptions:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of pending subscriptions
 */
export const subscribeToPendingSubscriptions = (callback) => {
  const q = query(
    collection(db, "pendingSubscriptions"),
    orderBy("requestDate", "desc"),
  );

  return onSnapshot(q, (querySnapshot) => {
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      });
    });
    callback(requests);
  });
};

/**
 * Approve a pending subscription request
 */
export const approvePendingSubscription = async (requestId) => {
  try {
    // Get the pending subscription request
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Subscription request not found");
    }

    const requestData = requestDoc.data();

    // Get subscription plan details
    const planRef = doc(db, "subscriptionPlans", requestData.planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      throw new Error("Subscription plan not found");
    }

    const planData = planDoc.data();

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    // Set end date based on plan type
    if (planData.period === "per session") {
      // For session-based plans, end date is same as start date
      endDate.setDate(startDate.getDate() + 1); // 1 day for session
    } else if (planData.period === "per month") {
      // For monthly plans, add the periodLeft days
      endDate.setDate(startDate.getDate() + (planData.periodLeft || 31));
    }

    // Create subscription document
    const subscriptionData = {
      userId: requestData.userId,
      userEmail: requestData.userEmail,
      userDisplayName: requestData.userDisplayName,
      planId: requestData.planId,
      planName: requestData.planName,
      price: requestData.price,
      status: "active",
      startDate: startDate,
      endDate: endDate,
      periodLeft: planData.periodLeft || 31,
      paymentMethod: requestData.paymentMethod || "counter",
      approvedBy: "admin", // You can get this from auth context
      approvedAt: new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add subscription to subscriptions collection
    const subscriptionRef = await addDoc(
      collection(db, "subscriptions"),
      subscriptionData,
    );

    // Update user document with active subscription reference
    const userRef = doc(db, "users", requestData.userId);
    await setDoc(
      userRef,
      {
        activeSubscriptionId: subscriptionRef.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Update the pending subscription request status
    await updateDoc(requestRef, {
      status: "approved",
      approvedAt: new Date(),
      updatedAt: new Date(),
      subscriptionId: subscriptionRef.id, // Link to created subscription
    });

    console.log("✅ Subscription created successfully:", subscriptionRef.id);
    return { success: true, subscriptionId: subscriptionRef.id };
  } catch (error) {
    console.error("Error approving subscription:", error);
    throw error;
  }
};

/**
 * Reject a pending subscription request
 */
export const rejectPendingSubscription = async (requestId) => {
  try {
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    await updateDoc(requestRef, {
      status: "rejected",
      rejectedAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error rejecting subscription:", error);
    throw error;
  }
};

/**
 * Delete a pending subscription request
 */
export const deletePendingSubscription = async (requestId) => {
  try {
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    await deleteDoc(requestRef);
    return true;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

/**
 * Get pending subscriptions by status
 */
export const getPendingSubscriptionsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, "pendingSubscriptions"),
      where("status", "==", status),
      orderBy("requestDate", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const requests = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching pending subscriptions by status:", error);
    throw error;
  }
};
