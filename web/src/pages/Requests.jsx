import React, { useState, useEffect } from "react";
import {
  DataTable,
  Actions,
  SaveCancelButtons,
  CancelDeleteButtons,
  ToastNotification,
} from "@/components";
import { usePendingSubscriptions } from "@/components/hooks/usePendingSubscriptions";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";

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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // I need to track pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Let me prevent scrolling when any modal is open
  useEffect(() => {
    if (showModal || showApproveModal || showRejectModal || showDeleteModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to ensure the class is removed when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showModal, showApproveModal, showRejectModal, showDeleteModal]);

  // Toast notification states
  // Smart toast notification system
  const [activeToasts, setActiveToasts] = useState([]);

  // Function to add a new toast with smart grouping
  const addToast = (message, type = "success") => {
    const toastId = Date.now() + Math.random();
    
    setActiveToasts(prev => {
      // Limit to maximum 3 toasts at once
      if (prev.length >= 3) {
        // Remove oldest toast to make room
        const sortedToasts = [...prev].sort((a, b) => a.timestamp - b.timestamp);
        const filteredToasts = prev.filter(toast => toast.id !== sortedToasts[0].id);
        
        const newToast = { 
          id: toastId, 
          message, 
          type,
          timestamp: Date.now()
        };
        
        return [...filteredToasts, newToast];
      }
      
      // Check for similar operations and group them
      const similarToast = prev.find(toast => 
        toast.message === message && 
        toast.type === type &&
        (Date.now() - toast.timestamp) < 1000 // Within 1 second
      );
      
      if (similarToast) {
        // Update existing toast with count
        const updatedToasts = prev.map(toast => 
          toast.id === similarToast.id 
            ? { ...toast, count: (toast.count || 1) + 1, timestamp: Date.now() }
            : toast
        );
        return updatedToasts;
      }
      
      // Add new toast
      const newToast = { 
        id: toastId, 
        message, 
        type,
        timestamp: Date.now(),
        count: 1
      };
      
      return [...prev, newToast];
    });
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 3000);
  };

  // Function to remove a specific toast
  const removeToast = (toastId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

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

  // Handle approve
  const _handleApprove = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to approve this subscription request?",
      )
    ) {
      const success = await approveRequest(requestId);
      if (success) {
        alert("Subscription request approved successfully!");
      } else {
        // Show the error message from the hook
        if (error) {
          alert(error);
        } else {
          alert("Failed to approve subscription request. Please try again.");
        }
      }
    }
  };

  // Handle reject
  const _handleReject = async (requestId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this subscription request?",
      )
    ) {
      const success = await rejectRequest(requestId);
      if (success) {
        alert("Subscription request rejected!");
      }
    }
  };

  // Handle delete
  const _handleDelete = async (requestId) => {
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

  // Handle delete without confirmation (for modal)
  const handleDeleteDirect = async (requestId) => {
    const success = await deleteRequest(requestId);
    return success;
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Get status badge for requests (custom styling with correct text)
  const getRequestStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        text: "Pending",
        style: "bg-yellow-100 text-yellow-700",
      },
      approved: {
        text: "Approved",
        style: "bg-green-100 text-green-700",
      },
      rejected: {
        text: "Rejected",
        style: "bg-red-100 text-red-700",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-block rounded-full font-bold px-2 py-0.5 text-xs sm:px-2.5 sm:py-1 sm:text-xs md:px-3 md:py-1 md:text-sm lg:px-3 lg:py-1 lg:text-sm ${config.style}`}
      >
        {config.text}
      </span>
    );
  };

  // Table columns configuration
  const columns = [
    {
      key: "userDisplayName",
      label: "Name",
      width: "w-1/4",
      render: (value, row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-gray-900 text-xs sm:text-sm md:text-base break-words whitespace-normal">
            {value || "Unknown User"}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 break-words">
            {row.userEmail}
          </span>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Plan",
      width: "w-1/5",
      render: (value, row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-gray-900 text-xs sm:text-sm md:text-base break-words whitespace-normal">
            {value}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 break-words">
            {row.price}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-1/6",
      render: (value, row) => {
        return (
          <div className="flex justify-start pr-1">
            {getRequestStatusBadge(row.status)}
          </div>
        );
      },
    },
    {
      key: "requestDate",
      label: "Request Date",
      width: "w-1/5",
      render: (value) => (
        <span className="text-xs sm:text-sm md:text-base text-gray-700">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "w-20",
      render: (value, row) => (
        <div className="flex space-x-1">
          {row.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRequestToApprove(row);
                  setShowApproveModal(true);
                }}
                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
                title="Approve"
              >
                <FaCheck className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRequestToReject(row);
                  setShowRejectModal(true);
                }}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Reject"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRequestToDelete(row);
              setShowDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
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
    <div className="h-full pb-16">
      <div className="pl-1 pt-6"></div>

      <DataTable
        columns={columns}
        data={pendingSubscriptions}
        loading={loading}
        emptyMessage="No subscription requests found"
        className="h-full"
        onRowClick={handleViewDetails}
        pagination={{
          currentPage: currentPage,
          pageSize: pageSize,
          totalItems: pendingSubscriptions.length,
          showPageSizeSelector: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 pr-2">
                Request Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Name:
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.userDisplayName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.userEmail}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Plan:
                  </label>
                  <p className="text-gray-900">{selectedRequest.planName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.price}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Status:
                  </label>
                  <div className="mt-1">
                    {getRequestStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Payment Method:
                  </label>
                  <p className="text-gray-900 capitalize">
                    {selectedRequest.paymentMethod || "Counter"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Request Date:
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedRequest.requestDate)}
                  </p>
                </div>

                {selectedRequest.status === "approved" &&
                  selectedRequest.approvedDate && (
                    <div>
                      <label className="text-sm font-bold text-gray-700">
                        Approved Date:
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedRequest.approvedDate)}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {selectedRequest.status === "pending" && (
                    <CancelDeleteButtons
                      onCancel={async () => {
                        const success = await approveRequest(
                          selectedRequest.id,
                        );
                        if (success) {
                          addToast("Subscription request approved!");
                          setShowModal(false);
                        } else {
                          // Show the error message from the hook
                          if (error) {
                            addToast(error, "error");
                          } else {
                            addToast("Failed to approve subscription request. Please try again.", "error");
                          }
                        }
                      }}
                      onDelete={async () => {
                        const success = await rejectRequest(selectedRequest.id);
                        if (success) {
                          addToast("Subscription request rejected!");
                          setShowModal(false);
                        } else {
                          addToast("Failed to reject subscription request. Please try again.", "error");
                        }
                      }}
                      cancelText="Approve"
                      deleteText="Reject"
                      cancelButtonClassName="!bg-[#4361ee] hover:!bg-[#3b56d4] focus:!bg-[#3b56d4] !text-white !border-transparent"
                    />
                  )}
                </div>
                <button
                  onClick={async () => {
                    const success = await handleDeleteDirect(
                      selectedRequest.id,
                    );
                    if (success) {
                      addToast(
                        "Subscription request deleted successfully!",
                        "success",
                      );
                      setShowModal(false);
                    } else {
                      addToast(
                        "Failed to delete subscription request. Please try again.",
                        "error",
                      );
                    }
                  }}
                  className="px-6 py-3 !text-sm font-medium rounded-xl border border-transparent bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && requestToApprove && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
          onClick={() => {
            setIsApproving(false);
            setShowApproveModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 pr-2">
                Approve Request
              </h2>
              <button
                onClick={() => {
                  setIsApproving(false);
                  setShowApproveModal(false);
                }}
                className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Approve Subscription Request
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to approve this subscription request for{" "}
                  <span className="font-semibold">
                    {requestToApprove.userDisplayName}
                  </span>
                  ?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
              <SaveCancelButtons
                onCancel={() => {
                  setIsApproving(false);
                  setShowApproveModal(false);
                }}
                onSave={async () => {
                  setIsApproving(true);
                  const success = await approveRequest(requestToApprove.id);
                  if (success) {
                    addToast(
                      "Subscription request approved!",
                      "success",
                    );
                    setIsApproving(false);
                    setShowApproveModal(false);
                  } else {
                    if (error) {
                      addToast(error, "error");
                    } else {
                      addToast(
                        "Failed to approve subscription request. Please try again.",
                        "error",
                      );
                    }
                    setIsApproving(false);
                  }
                }}
                saving={isApproving}
                cancelText="Cancel"
                saveText="Confirm"
                savingText="Confirming..."
                saveButtonClassName="!bg-[#4361ee] hover:!bg-[#3b56d4] focus:!bg-[#3b56d4]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && requestToReject && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
          onClick={() => {
            setIsRejecting(false);
            setShowRejectModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 pr-2">
                Reject Request
              </h2>
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setShowRejectModal(false);
                }}
                className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimes className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Reject Subscription Request
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to reject this subscription request for{" "}
                  <span className="font-semibold">
                    {requestToReject.userDisplayName}
                  </span>
                  ?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
              <CancelDeleteButtons
                onCancel={() => {
                  setIsRejecting(false);
                  setShowRejectModal(false);
                }}
                onDelete={async () => {
                  setIsRejecting(true);
                  const success = await rejectRequest(requestToReject.id);
                  if (success) {
                    addToast(
                      "Subscription request rejected!",
                      "success",
                    );
                    setIsRejecting(false);
                    setShowRejectModal(false);
                  } else {
                    addToast(
                      "Failed to reject subscription request. Please try again.",
                      "error",
                    );
                    setIsRejecting(false);
                  }
                }}
                deleting={isRejecting}
                cancelText="Cancel"
                deleteText="Reject"
                deletingText="Rejecting..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && requestToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
          onClick={() => {
            setShowDeleteModal(false);
            setIsDeleting(false);
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 pr-2">
                Delete Request
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setIsDeleting(false);
                }}
                className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Delete Subscription Request
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this subscription request for{" "}
                  <span className="font-semibold">
                    {requestToDelete.userDisplayName}
                  </span>
                  ?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
              <CancelDeleteButtons
                onCancel={() => {
                  setShowDeleteModal(false);
                  setIsDeleting(false);
                }}
                onDelete={async () => {
                  setIsDeleting(true);
                  try {
                    const success = await handleDeleteDirect(
                      requestToDelete.id,
                    );
                    if (success) {
                      addToast(
                        "Subscription request deleted successfully!",
                        "success",
                      );
                      setShowDeleteModal(false);
                    } else {
                      addToast(
                        "Failed to delete subscription request. Please try again.",
                        "error",
                      );
                    }
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                cancelText="Cancel"
                deleteText="Delete"
                deleting={isDeleting}
                deletingText="Deleting..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications - Multiple simultaneous toasts */}
      {activeToasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + (index * 80)}px`, // Stack toasts vertically
            right: '20px',
            zIndex: 1000 + index,
          }}
        >
          <ToastNotification
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            message={toast.count > 1 ? `${toast.message} (${toast.count}x)` : toast.message}
            type={toast.type}
            position="top-right"
          />
        </div>
      ))}
    </div>
  );
};

export default Requests;
