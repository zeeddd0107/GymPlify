import { useState, useEffect } from "react";
import {
  subscribeToPendingSubscriptions,
  approvePendingSubscription,
  rejectPendingSubscription,
  deletePendingSubscription,
} from "@/services/requestService";

export const usePendingSubscriptions = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToPendingSubscriptions((requests) => {
      setPendingSubscriptions(requests);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const approveRequest = async (requestId) => {
    try {
      const result = await approvePendingSubscription(requestId);
      if (result.success) {
        console.log(
          "✅ Subscription approved and created:",
          result.subscriptionId,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error approving request:", error);
      setError("Failed to approve request");
      return false;
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await rejectPendingSubscription(requestId);
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      setError("Failed to reject request");
      return false;
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      await deletePendingSubscription(requestId);
      return true;
    } catch (error) {
      console.error("Error deleting request:", error);
      setError("Failed to delete request");
      return false;
    }
  };

  return {
    pendingSubscriptions,
    loading,
    error,
    approveRequest,
    rejectRequest,
    deleteRequest,
  };
};
