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

const Staff = () => {
  // Get current user from auth context
  const { user: _user } = useAuth();

  // State for staff data and UI
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, _setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "admin",
    password: "",
  });

  // Success notification states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Validation errors for Add New Staff modal
  const [addStaffErrors, setAddStaffErrors] = useState({});

  // Operation tracking for cancel functionality
  const [ongoingOperations, _setOngoingOperations] = useState(new Map());

  // Fetch staff from Firestore (users where role in [admin, staff])
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        // Include common role capitalizations; avoid orderBy to prevent index requirement
        const q = query(
          usersRef,
          where("role", "in", ["admin", "Admin", "staff", "Staff"]),
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
      } catch (e) {
        console.error("Error fetching staff:", e);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Filter staff by role and status
  const filteredStaff = staff.filter((member) => {
    const roleMatch =
      selectedRole === "all" || member.role?.toLowerCase() === selectedRole;
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "active" && !!member?.lastLogin) ||
      (selectedStatus === "inactive" && !member?.lastLogin);
    return roleMatch && statusMatch;
  });

  // Get unique roles for filter
  const roles = [
    "all",
    ...new Set(
      staff.map((member) => member.role?.toLowerCase()).filter(Boolean),
    ),
  ];

  // Get unique statuses for filter
  const statuses = ["all", "active", "inactive"];

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
      role: "admin",
      password: "",
    });
    setAddStaffErrors({});
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
              setSuccessMessage("Staff member deleted successfully!");
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 3000);
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

      {/* Combined Filter and DataTable Card */}
      <div className="bg-white rounded-xl pt-6">
        {/* Filters and Add Button */}
        <div className="px-4 sm:px-6 mb-6">
          {/* Mobile and sm: Two column layout */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:hidden">
            {/* Left column: Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role === "all"
                        ? "All Roles"
                        : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm mr-5 font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Right column: Add Staff button */}
            <div className="flex justify-end items-start">
              <AddButton
                onClick={handleAddStaff}
                text="Add Staff"
                className=""
              />
            </div>
          </div>

          {/* md and larger: Original layout */}
          <div className="hidden md:flex md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Role:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role === "all"
                        ? "All Roles"
                        : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <AddButton
                onClick={handleAddStaff}
                text="Add Staff"
                className=""
              />
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredStaff}
          loading={loading}
          emptyMessage="No staff members found."
          className="h-full"
          pagination={{
            enabled: true,
            pageSize: pageSize,
            currentPage: currentPage,
            totalItems: filteredStaff.length,
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
        onSave={() => {
          // TODO: Wire backend register + set admin claim + Firestore write
          setShowAddModal(false);
        }}
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
              Role <span className="text-red-500">*</span>
            </label>
            <FormSelect
              value={newStaff.role}
              onChange={(e) => {
                setNewStaff((s) => ({ ...s, role: e.target.value }));
                if (addStaffErrors.role) {
                  setAddStaffErrors((prev) => ({ ...prev, role: "" }));
                }
              }}
              options={[
                { value: "admin", label: "Admin" },
                { value: "staff", label: "Staff" },
              ]}
              placeholder="Select role"
              required={true}
              className={addStaffErrors.role ? "border-red-500" : ""}
            />
            {addStaffErrors.role && (
              <p className="text-red-500 text-sm mt-1 italic">
                {addStaffErrors.role}
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
        onSave={() => {
          // TODO: Implement edit staff functionality
          setShowEditModal(false);
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
              <label className="text-sm font-medium text-gray-700">Role</label>
              <FormSelect
                value={editingStaff.role || ""}
                onChange={(e) =>
                  setEditingStaff((s) => ({ ...s, role: e.target.value }))
                }
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "staff", label: "Staff" },
                ]}
                placeholder="Select role"
                required={true}
              />
            </div>
          </div>
        )}
      </EditModal>

      {/* Toast Notification */}
      <ToastNotification
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
        type="success"
        position="top-right"
      />
    </div>
  );
};

export default Staff;
