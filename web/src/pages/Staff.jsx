import React, { useEffect, useMemo, useState } from "react";
import { FaUser, FaTimes } from "react-icons/fa";
import {
  DataTable,
  EditModal,
  AddItem,
  Actions,
  FormInput,
  FormSelect,
  EditDeleteButtons,
  ToastNotification,
  AddButton,
  OperationsBanner,
  StatusBadge,
} from "@/components";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context";
import api from "@/services/api";

const Staff = () => {
  // Get current user from auth context
  const { user: _user } = useAuth();

  // State for staff data and UI
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filters removed: we only show staff
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
  });

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

  // Validation errors for Add New Staff modal
  const [addStaffErrors, setAddStaffErrors] = useState({});

  // Operation tracking for cancel functionality
  const [ongoingOperations, _setOngoingOperations] = useState(new Map());
  // Simple password validation state for Edit modal
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password) => {
    const validation = {
      minLength: (password || "").length >= 8,
      hasUppercase: /[A-Z]/.test(password || ""),
      hasNumber: /[0-9]/.test(password || ""),
      hasSpecialChar: /[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || ""),
    };
    setPasswordValidation(validation);
    return validation;
  };

  // Fetch staff from Firestore (users where role is staff only)
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        // Include common role capitalizations; avoid orderBy to prevent index requirement
        const q = query(usersRef, where("role", "in", ["staff", "Staff"]));
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const an = (a.displayName || a.name || a.email || "").toLowerCase();
            const bn = (b.displayName || b.name || b.email || "").toLowerCase();
            return an.localeCompare(bn);
          });
        setStaff(list);
      } catch (e) {
        console.error("Error fetching staff:", e);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);


  const lastActiveString = (ts) => {
    try {
      if (!ts) return "—";
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    } catch {
      return "—";
    }
  };

  // Handle add staff modal
  const handleAddStaff = () => {
    setShowAddModal(true);
  };

  // Handle close add modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewStaff({
      name: "",
      email: "",
      role: "staff",
      password: "",
    });
    setAddStaffErrors({});
  };

  // Handle save staff
  const handleSaveStaff = async () => {
    // Validation
    const errors = {};
    if (!newStaff.name.trim()) {
      errors.name = "Full name is required";
    }
    if (!newStaff.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!newStaff.password || newStaff.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setAddStaffErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      console.log("Attempting to create staff member...");
      console.log("Data:", {
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        role: newStaff.role,
      });
      
      // Try cloud function first, fallback to local backend
      let response;
      try {
        // Cloud function URL - will be available after deployment
        const cloudFunctionUrl = "https://us-central1-gymplify-554c8.cloudfunctions.net/createStaff";
        response = await fetch(cloudFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newStaff.name.trim(),
            email: newStaff.email.trim(),
            role: newStaff.role,
            password: newStaff.password,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        response = { data: await response.json() };
        console.log("Created via Cloud Function");
      } catch (cloudError) {
        console.log("Cloud function failed, trying local backend:", cloudError);
        // Fallback to local backend
        response = await api.post("/auth/admin/create-staff", {
          name: newStaff.name.trim(),
          email: newStaff.email.trim(),
          role: newStaff.role,
          password: newStaff.password,
        });
      }

      console.log("Response:", response.data);
      
      // Show success toast
      addToast("Staff member created successfully");
      
      // Refresh staff list
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("role", "in", ["staff", "Staff"]),
      );
      const snap = await getDocs(q);
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const an = (a.displayName || a.name || a.email || "").toLowerCase();
          const bn = (b.displayName || b.name || b.email || "").toLowerCase();
          return an.localeCompare(bn);
        });
      setStaff(list);

      // Close modal and reset form
      handleCloseAddModal();
    } catch (error) {
      console.error("Error creating staff member:", error);
      const errorMessage = error.response?.data?.error || "Failed to create staff member";
      addToast(errorMessage, "error");
      
      // Set field-specific errors if available
      if (errorMessage.includes("email")) {
        setAddStaffErrors({ email: errorMessage });
      } else if (errorMessage.includes("Name")) {
        setAddStaffErrors({ name: errorMessage });
      } else if (errorMessage.includes("password")) {
        setAddStaffErrors({ password: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle edit staff
  const handleEditStaff = (member) => {
    setEditingStaff(member);
    setShowEditModal(true);
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStaff(null);
  };

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        label: "Staff",
        width: "w-1/6",
        render: (_v, row) => {
          const name = row.displayName || row.name || row.email || "—";
          const isActive = !!row?.lastLogin;
          return (
            <div className="flex items-center space-x-2 sm:space-x-3 group">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-green-100 group-hover:bg-green-200"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <FaUser
                  className={`text-sm sm:text-base transition-colors duration-200 ${
                    isActive
                      ? "text-green-600 group-hover:text-green-700"
                      : "text-gray-500 group-hover:text-gray-600"
                  }`}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm lg:text-base text-gray-700 break-words group-hover:text-gray-900 transition-colors duration-200">
                  {name}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        label: "Email",
        width: "w-1/5",
        render: (value) => (
          <span className="text-gray-900 text-xs sm:text-sm md:text-base break-words whitespace-normal group-hover:text-gray-700 transition-colors duration-200">
            {value || "—"}
          </span>
        ),
      },
      {
        key: "role",
        label: "Role",
        width: "w-1/6",
        render: (value) => (
          <span className="text-xs sm:text-sm md:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
            {value ? value.charAt(0).toUpperCase() + value.slice(1) : "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "w-1/6",
        render: (_v, row) => {
          const active = !!row?.lastLogin;
          return (
            <div className="flex justify-start pr-1">
              <StatusBadge
                status={active ? "active" : "inactive"}
                customLabels={{
                  active: "Active",
                  inactive: "Inactive",
                }}
                customStyles={{
                  active: "bg-green-100 text-green-700",
                  inactive: "bg-gray-100 text-gray-600",
                }}
              />
            </div>
          );
        },
      },
      {
        key: "lastLogin",
        label: "Last Active",
        width: "w-1/6",
        render: (value) => (
          <span className="text-xs sm:text-sm md:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
            {lastActiveString(value)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        width: "w-20",
        render: (value, row) => (
          <Actions
            item={row}
            onEdit={handleEditStaff}
            collectionName="users"
            itemNameField="displayName"
            itemType="staff member"
            editTitle="Edit staff member"
            deleteTitle="Delete staff member"
            onDeleteSuccess={() => {
              addToast("Staff member deleted successfully!");
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="h-full pb-16">
      <div className="pl-1 pt-6"></div>

      {/* Operations Banner */}
      <OperationsBanner
        ongoingOperations={ongoingOperations}
        onCancelOperation={() => {}}
      />

      {/* DataTable Card (filters removed) */}
      <div className="rounded-xl">
        {/* Header with Add Staff button only */}
        <div className="px-4 sm:px-6 mb-6 flex justify-end">
          <AddButton onClick={handleAddStaff} text="Add Staff" className="" />
        </div>
        <DataTable
          columns={columns}
          data={staff}
          loading={loading}
          emptyMessage="No staff members found."
          className="h-full"
          pagination={{
            enabled: true,
            pageSize: pageSize,
            currentPage: currentPage,
            totalItems: staff.length,
            showPageSizeSelector: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset to first page when page size changes
          }}
        />
      </div>

      {/* Add Staff Modal */}
      <AddItem
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSave={handleSaveStaff}
        saving={saving}
        title="Add New Staff Member"
        saveText="Add Staff"
        cancelText="Cancel"
        cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
        saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
        noShadow
        className="max-w-2xl"
      >
        <div className="space-y-5 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <FormInput
              type="text"
              value={newStaff.name}
              onChange={(e) => {
                setNewStaff((s) => ({ ...s, name: e.target.value }));
                if (addStaffErrors.name) {
                  setAddStaffErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              placeholder="Enter full name"
              required={true}
              error={!!addStaffErrors.name}
            />
            {addStaffErrors.name && (
              <p className="text-red-500 text-sm mt-1 italic">
                {addStaffErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <FormInput
              type="email"
              value={newStaff.email}
              onChange={(e) => {
                setNewStaff((s) => ({ ...s, email: e.target.value }));
                if (addStaffErrors.email) {
                  setAddStaffErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="Enter email address"
              required={true}
              error={!!addStaffErrors.email}
            />
            {addStaffErrors.email && (
              <p className="text-red-500 text-sm mt-1 italic">
                {addStaffErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <FormInput
              type="password"
              value={newStaff.password}
              onChange={(e) => {
                setNewStaff((s) => ({ ...s, password: e.target.value }));
                if (addStaffErrors.password) {
                  setAddStaffErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              placeholder="Enter password"
              required={true}
              error={!!addStaffErrors.password}
            />
            {addStaffErrors.password && (
              <p className="text-red-500 text-sm mt-1 italic">
                {addStaffErrors.password}
              </p>
            )}
          </div>
        </div>
      </AddItem>

      {/* Edit Staff Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSave={async () => {
          if (!editingStaff) return;
          try {
            setSaving(true);
            // Only update password if provided
            const newPassword = editingStaff.__newPassword;
            if (newPassword && newPassword.length > 0) {
              const v = validatePassword(newPassword);
              const ok = v.minLength && v.hasUppercase && v.hasNumber && v.hasSpecialChar;
              if (!ok) {
                addToast(
                  "Password must be at least 8 chars and include uppercase, number, and special character.",
                  "error",
                );
                setSaving(false);
                return;
              }
              const cloudFunctionUrl = "https://us-central1-gymplify-554c8.cloudfunctions.net/resetStaffPassword";
              const resp = await fetch(cloudFunctionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: editingStaff.email, newPassword }),
              });
              if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || `HTTP error ${resp.status}`);
              }
              addToast("Password updated successfully");
            }
            setShowEditModal(false);
          } catch (e) {
            console.error("Failed to update staff:", e);
            addToast(e.message || "Failed to update staff", "error");
          } finally {
            setSaving(false);
          }
        }}
        saving={saving}
        title="Edit Staff Member"
        saveText="Save"
        cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
        saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
        noShadow
        className="max-w-2xl"
      >
        {editingStaff && (
          <div className="space-y-5 mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <FormInput
                type="text"
                value={editingStaff.displayName || editingStaff.name || ""}
                onChange={(e) =>
                  setEditingStaff((s) => ({
                    ...s,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Enter full name"
                required={true}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <FormInput
                type="email"
                value={editingStaff.email || ""}
                onChange={(e) =>
                  setEditingStaff((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="Enter email address"
                required={true}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <FormInput
                type="password"
                value={editingStaff.__newPassword || ""}
                onChange={(e) =>
                  {
                    const value = e.target.value;
                    setEditingStaff((s) => ({ ...s, __newPassword: value }));
                    validatePassword(value);
                  }
                }
                placeholder="Leave blank to keep current password"
              />
              <p className={`text-xs ${editingStaff.__newPassword && !(passwordValidation.minLength && passwordValidation.hasUppercase && passwordValidation.hasNumber && passwordValidation.hasSpecialChar) ? 'text-red-600' : 'text-gray-500'}`}>
                Must be at least 8 characters and include an uppercase letter, a number, and a special character. Leave blank to keep existing password.
              </p>
            </div>
          </div>
        )}
      </EditModal>

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

export default Staff;
