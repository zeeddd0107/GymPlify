import { useState, useEffect } from "react";
import { DataTable } from "@/components";
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

// Columns for DataTable similar to Subscriptions
const columns = [
  {
    key: "id",
    label: "ID",
    render: (value, row) => (
      <span title={row?.fullId || value}>{String(value).toUpperCase()}</span>
    ),
  },
  {
    key: "name",
    label: "Name",
    render: (value) => <span title={value}>{value}</span>,
  },
  {
    key: "time",
    label: "Check-in",
    render: (value) => <span title={value}>{value}</span>,
  },
  {
    key: "checkOut",
    label: "Check-out",
    render: (value, row) => (
      <span title={row.checkOut || "-"}>{row.checkOut || "-"}</span>
    ),
  },
  {
    key: "date",
    label: "Date",
    render: (value) => (
      <span className="mr-6" title={value}>
        {value}
      </span>
    ),
  },
  {
    key: "status",
    label: <span className="ml-1">Status</span>,
    render: (value, row) => (
      <div className="flex items-center justify-start">
        {statusBadge[row.status]}
      </div>
    ),
  },
];

const DashboardHome = () => {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // all | in | out
  const [customDate, setCustomDate] = useState(""); // yyyy-mm-dd
  const [activeMembers, setActiveMembers] = useState(0);
  const [todaysCheckins, setTodaysCheckins] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

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

  const filteredData = rows
    .filter(
      (row) =>
        row.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(row.id).toLowerCase().includes(search.toLowerCase()),
    )
    .filter(matchesStatus)
    .filter(matchesDate);

  return (
    <div className="-mx-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 my-6">
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
      <div className="bg-white rounded-xl shadow p-6 pl-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
          <div className="flex items-center border-[1.5px] border-gray/50 rounded-2xl px-4 py-3 w-full sm:w-72 bg-gray-50">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-lightGrayText/50"
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="border-[1.5px] border-gray/50 rounded-2xl px-3 py-2 bg-white text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="in">Checked in</option>
              <option value="out">Checked out</option>
            </select>

            <input
              type="date"
              className="border-[1.5px] border-gray/50 rounded-2xl px-3 py-2 bg-white text-sm"
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
        />
      </div>
    </div>
  );
};

export default DashboardHome;
