import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components";
import { EditModal } from "@/components/modals";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    password: "",
  });

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

  const lastActiveString = (ts) => {
    try {
      if (!ts) return "—";
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    } catch {
      return "—";
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        label: "Name",
        render: (_v, row) => row.displayName || row.name || row.email || "—",
      },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (value) =>
          value ? value.charAt(0).toUpperCase() + value.slice(1) : "—",
      },
      {
        key: "status",
        label: "Status",
        render: (_v, row) => {
          const active = !!row?.lastLogin;
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        key: "lastLogin",
        label: "Last Active",
        render: (value) => lastActiveString(value),
      },
      {
        key: "actions",
        label: "Actions",
        render: () => (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-primary text-white text-sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement Edit Staff
              }}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement Delete Staff
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const headerContent = (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
        <p className="text-sm text-gray-500">
          Manage your administrators and staff
        </p>
      </div>
      <button
        className="px-4 py-2 rounded bg-primary text-white shadow hover:opacity-90"
        onClick={() => setAddOpen(true)}
      >
        Add
      </button>
    </div>
  );

  return (
    <div className="p-8">
      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        className="h-full"
        headerContent={headerContent}
      />

      {/* Add Staff Modal */}
      <EditModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Staff Member"
        onSave={() => {
          // TODO: Wire backend register + set admin claim + Firestore write
          setAddOpen(false);
        }}
        saveText="Add Staff"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter full name"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email address"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter password"
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </EditModal>
    </div>
  );
};

export default Staff;
