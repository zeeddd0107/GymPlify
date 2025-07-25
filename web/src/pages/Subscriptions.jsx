import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context";

const Subscriptions = () => {
  const { user, isAdmin } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subscriptions: all if admin, only own if not
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        let q;
        if (isAdmin) {
          // Admin: fetch all subscriptions, ordered by startDate desc
          q = query(
            collection(db, "subscriptions"),
            orderBy("startDate", "desc"),
          );
        } else {
          // Non-admin: fetch only own subscriptions
          q = query(
            collection(db, "subscriptions"),
            where("userId", "==", user.uid),
            orderBy("startDate", "desc"),
          );
        }
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubscriptions(data);
      } catch {
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSubscriptions();
  }, [user, isAdmin]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Subscriptions</h1>
      <p className="mb-6 text-gray-600">
        {isAdmin
          ? "Viewing all user subscriptions."
          : "Viewing your subscriptions only."}
      </p>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center text-gray-500">No subscriptions found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary text-white">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    User ID
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-primary/10 transition-colors"
                >
                  {isAdmin && (
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                      {sub.userId}
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-lg text-primary-700">
                    {sub.plan}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${sub.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sub.startDate?.toDate
                      ? sub.startDate.toDate().toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sub.endDate?.toDate
                      ? sub.endDate.toDate().toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {sub.createdAt?.toDate
                      ? sub.createdAt.toDate().toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
