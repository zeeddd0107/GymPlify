import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import notificationService from "./notificationService";

let unsubscribe = null;
let isFirstLoad = true;

/**
 * Start listening for new subscription requests and notify admins
 * This should be called when an admin logs in
 */
export const startListeningForSubscriptionRequests = () => {
  // Don't start multiple listeners
  if (unsubscribe) {
    return;
  }

  // Reset first load flag
  isFirstLoad = true;

  const requestsRef = collection(db, "pendingSubscriptions");
  const q = query(
    requestsRef,
    orderBy("requestDate", "desc"),
    limit(50), // Only monitor recent requests
  );

  unsubscribe = onSnapshot(q, async (snapshot) => {
    // Skip the first snapshot (existing data on page load)
    if (isFirstLoad) {
      isFirstLoad = false;
      console.log(
        " Subscription request listener initialized, monitoring for new requests...",
      );
      return;
    }

    // Process only truly new requests
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const request = change.doc.data();
        const requestId = change.doc.id;

        console.log(" New subscription request detected:", requestId);

        // Only notify about pending requests
        if (request.status === "pending") {
          try {
            // Notify all admins about the new request
            await notificationService.notifyAllAdmins({
              type: "subscription_request",
              title: "New Subscription Request",
              message: `${request.userDisplayName} requested ${request.planName}`,
              requestId: requestId,
              priority: "high",
              actionUrl: "/requests",
            });
            console.log(
              "Admin notified about new subscription request:",
              requestId,
            );
          } catch (error) {
            console.error("Failed to notify admins:", error);
          }
        }
      }
    });
  });

  console.log(" Started listening for subscription requests");
};

/**
 * Stop listening for subscription requests
 * This should be called when admin logs out
 */
export const stopListeningForSubscriptionRequests = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    isFirstLoad = true;
    console.log(" Stopped listening for subscription requests");
  }
};
