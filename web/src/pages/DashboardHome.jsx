import { useState, useEffect } from "react";
import { DataTable, FilterSelect, EditModal } from "@/components";
import Actions from "@/components/buttons/Actions";
import {
  FaUsers,
  FaCalendarCheck,
  FaClipboardList,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaFileCsv,
  FaSort,
  FaCircle,
} from "react-icons/fa";

const StatTile = ({ icon, bg, value, label }) => (
  <div className="bg-white rounded-xl shadow p-5 flex items-center">
    <div
      style={{ backgroundColor: bg }}
      className={`w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4`}
    >
      {icon}
    </div>
    <div className="stat-details">
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-lightGrayText text-sm font-normal">{label}</p>
    </div>
  </div>
);

// Firestore
import { db } from "@/config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";

// Helper formatters
const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (date) =>
  date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusBadge = {
  approved: (
    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
      Checked in
    </span>
  ),
  rejected: (
    <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
      Checked out
    </span>
  ),
};

const DashboardHome = () => {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // all | in | out
  const [customDate, setCustomDate] = useState(""); // yyyy-mm-dd
  const [activeMembers, setActiveMembers] = useState(0);
  const [todaysCheckins, setTodaysCheckins] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch latest attendance records
        const attendanceRef = collection(db, "attendance");
        const q = query(
          attendanceRef,
          orderBy("checkInTime", "desc"),
          limit(50),
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => {
          const a = doc.data();
          const checkIn = a.checkInTime?.toDate ? a.checkInTime.toDate() : null;
          const checkOut = a.checkOutTime?.toDate
            ? a.checkOutTime.toDate()
            : null;
          const rawSessionId = a.sessionId || doc.id;
          return {
            id: rawSessionId
              ? String(rawSessionId).slice(0, 5).toUpperCase()
              : "-",
            fullId: rawSessionId || "-",
            name: a.userInfo?.displayName || a.userInfo?.name || "-",
            time: checkIn ? formatTime(checkIn) : "-",
            checkOut: checkOut ? formatTime(checkOut) : "-",
            date: checkIn
              ? formatDate(checkIn)
              : checkOut
                ? formatDate(checkOut)
                : "-",
            status: checkOut ? "rejected" : "approved", // checked out vs checked in
            _checkInDate: checkIn,
            _checkOutDate: checkOut,
          };
        });
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load tiles data: active subscriptions, today's check-ins, low stock items
  useEffect(() => {
    const fetchTiles = async () => {
      try {
        // Active subscriptions
        const subsRef = collection(db, "subscriptions");
        const subsSnap = await getDocs(
          query(subsRef, where("status", "==", "active")),
        );
        setActiveMembers(subsSnap.size);

        // Today's check-ins
        const now = new Date();
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
        const attRef = collection(db, "attendance");
        const attSnap = await getDocs(
          query(
            attRef,
            where("checkInTime", ">=", Timestamp.fromDate(start)),
            where("checkInTime", "<", Timestamp.fromDate(end)),
          ),
        );
        setTodaysCheckins(attSnap.size);

        // Temporarily align with Inventory card count
        setLowStockItems(2);
      } catch {
        // keep defaults
      }
    };
    fetchTiles();
  }, []);

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const matchesStatus = (row) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "in") return row.status === "approved";
    if (statusFilter === "out") return row.status === "rejected";
    return true;
  };

  const matchesDate = (row) => {
    const refDate = row._checkInDate || row._checkOutDate;
    if (!customDate) return true; // no filter when not set
    if (!refDate) return false;
    const [y, m, d] = customDate.split("-").map((x) => parseInt(x, 10));
    const cd = new Date(y, m - 1, d);
    return isSameDay(refDate, cd);
  };

  // Edit functions
  const handleEdit = (item) => {
    // Convert time strings to HH:MM format for time inputs
    const formatTimeForInput = (timeStr) => {
      if (!timeStr || timeStr === "-") return "";
      // If it's already in HH:MM format, return as is
      if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
      // Try to parse common time formats
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, "0");
        const minutes = timeMatch[2];
        return `${hours}:${minutes}`;
      }
      return "";
    };

    // Convert date string to YYYY-MM-DD format for date input
    const formatDateForInput = (dateStr) => {
      if (!dateStr || dateStr === "-") return "";
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Try to parse the date string
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch {
        // If parsing fails, return empty string
      }
      return "";
    };

    setEditingItem({
      ...item,
      time: formatTimeForInput(item.time),
      checkOut: formatTimeForInput(item.checkOut),
      date: formatDateForInput(item.date),
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      // TODO: Implement actual save functionality
      console.log("Saving edited item:", editingItem);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the rows with edited data
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingItem.id
            ? {
                ...row,
                name: editingItem.name,
                time: editingItem.time,
                checkOut: editingItem.checkOut,
                date: editingItem.date,
                status: editingItem.status,
              }
            : row,
        ),
      );

      setEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving edit:", error);
    } finally {
      setSaving(false);
    }
  };

  // Columns for DataTable with Actions component
  const columns = [
    {
      key: "id",
      label: "ID",
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value, row) => (
        <span title={row?.fullId || value}>{String(value).toUpperCase()}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      width: "w-[20%]", // 20% of total space
      render: (value) => (
        <span title={value} className="break-words whitespace-normal">
          {value}
        </span>
      ),
    },
    {
      key: "time",
      label: "Check-in",
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value) => <span title={value}>{value}</span>,
    },
    {
      key: "checkOut",
      label: "Check-out",
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value, row) => (
        <span title={row.checkOut || "-"}>{row.checkOut || "-"}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value) => (
        <span className="mr-6" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: <span className="ml-1">Status</span>,
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value, row) => (
        <div className="flex items-center justify-start">
          {statusBadge[row.status]}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "w-[13.33%]", // 80% / 6 = 13.33%
      render: (value, row) => (
        <Actions
          item={row}
          onEdit={handleEdit}
          onDelete={(item) => {
            console.log("Delete item:", item);
            // TODO: Implement delete functionality
          }}
          collectionName="attendance"
          itemNameField="name"
          itemType="attendance record"
        />
      ),
    },
  ];

  const filteredData = rows
    .filter(
      (row) =>
        row.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(row.id).toLowerCase().includes(search.toLowerCase()),
    )
    .filter(matchesStatus)
    .filter(matchesDate);

  return (
    <div className="h-full pb-16">
      <div className="pl-1 pt-6"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <StatTile
          icon={<FaUsers className="text-white text-2xl" />}
          bg="#4caf50"
          value={activeMembers}
          label="Active Members"
        />
        <StatTile
          icon={<FaCalendarCheck className="text-white text-2xl" />}
          bg="#2196f3"
          value={todaysCheckins}
          label={"Today's Check-ins"}
        />
        <StatTile
          icon={<FaClipboardList className="text-white text-2xl" />}
          bg="#ff9800"
          value={2}
          label="Pending Requests"
        />
        <StatTile
          icon={<FaExclamationTriangle className="text-white text-2xl" />}
          bg="#f44336"
          value={lowStockItems}
          label="Low Stock Items"
        />
      </div>

      {/* Leave/Permission Table Card */}
      <div className="bg-white rounded-xl pt-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
            <div className="flex items-center border-[1.5px] border-gray/50 rounded-2xl px-4 py-3 w-full sm:w-72 bg-gray-50 mx-6 focus-within:border-2 focus-within:border-blue-500">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none flex-1 text-sm placeholder:font-normal placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mx-6">
              <FilterSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All" },
                  { value: "in", label: "Checked in" },
                  { value: "out", label: "Checked out" },
                ]}
              />

              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="No records found."
            className="h-full"
            pagination={{
              enabled: true,
              pageSize: pageSize,
              currentPage: currentPage,
              totalItems: filteredData.length,
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
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Attendance Record"
        onSave={handleSaveEdit}
        saving={saving}
        saveText="Save"
        savingText="Saving..."
        cancelText="Cancel"
        onCancel={handleCloseEditModal}
        maxWidth="max-w-md"
      >
        {editingItem && (
          <div className="space-y-4">
            <div className="space-y-1 mt-3">
              <label className="text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                value={editingItem.id || ""}
                disabled={true}
                className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4 opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingItem.name || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter name"
                required={true}
                className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 placeholder:font-normal placeholder:text-gray-400 pl-4 pr-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={editingItem.time || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={editingItem.checkOut || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      checkOut: e.target.value,
                    }))
                  }
                  className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={editingItem.date || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={editingItem.status || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                required={true}
                className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4 bg-white"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="approved">Checked in</option>
                <option value="rejected">Checked out</option>
              </select>
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
};

export default DashboardHome;
