import React, { useState } from "react";
import { DataTable } from "@/components";
import { usePendingSubscriptions } from "@/components/hooks/usePendingSubscriptions";
import { FaCheck, FaTimes, FaTrash, FaEye } from "react-icons/fa";

const Requests = () => {
  const {
    pendingSubscriptions,
    loading,
    error,
    approveRequest,
    rejectRequest,
    deleteRequest,
  } = usePendingSubscriptions();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // Handle approve
  const handleApprove = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to approve this subscription request?",
      )
    ) {
      const success = await approveRequest(requestId);
      if (success) {
        alert("Subscription request approved successfully!");
      }
    }
  };

  // Handle reject
  const handleReject = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this subscription request?",
      )
    ) {
      const success = await rejectRequest(requestId);
      if (success) {
        alert("Subscription request rejected successfully!");
      }
    }
  };

  // Handle delete
  const handleDelete = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this subscription request?",
      )
    ) {
      const success = await deleteRequest(requestId);
      if (success) {
        alert("Subscription request deleted successfully!");
      }
    }
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Table columns configuration
  const columns = [
    {
      key: "userDisplayName",
      label: "User",
      width: "20%",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {value || "Unknown User"}
          </div>
          <div className="text-sm text-gray-500">{row.userEmail}</div>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Plan",
      width: "15%",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.price}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "12%",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "requestDate",
      label: "Request Date",
      width: "15%",
      render: (value) => (
        <div className="text-sm text-gray-900">{formatDate(value)}</div>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      width: "12%",
      render: (value) => (
        <span className="capitalize text-sm text-gray-900">
          {value || "Counter"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "26%",
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                title="Approve"
              >
                <FaCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Reject"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Subscription Requests
        </h1>
        <p className="text-gray-600 mt-1">
          Manage pending subscription requests from users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pendingSubscriptions}
        loading={loading}
        emptyMessage="No subscription requests found"
        className="shadow-lg"
        headerContent={
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Requests
              </h2>
              <p className="text-sm text-gray-600">
                {pendingSubscriptions.length} total requests
              </p>
            </div>
          </div>
        }
      />

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  User:
                </label>
                <p className="text-gray-900">
                  {selectedRequest.userDisplayName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.userEmail}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Plan:
                </label>
                <p className="text-gray-900">{selectedRequest.planName}</p>
                <p className="text-sm text-gray-600">{selectedRequest.price}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Payment Method:
                </label>
                <p className="text-gray-900 capitalize">
                  {selectedRequest.paymentMethod || "Counter"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Request Date:
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedRequest.requestDate)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
