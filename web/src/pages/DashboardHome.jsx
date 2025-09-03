import { useState } from "react";
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

const stats = [
  {
    icon: <FaUsers className="text-white text-2xl" />, // 1.5rem
    iconBg: "#4caf50",
    value: 112,
    label: "Active Members",
  },
  {
    icon: <FaCalendarCheck className="text-white text-2xl" />,
    iconBg: "#2196f3",
    value: 42,
    label: "Today's Check-ins",
  },
  {
    icon: <FaClipboardList className="text-white text-2xl" />,
    iconBg: "#ff9800",
    value: 2,
    label: "Pending Requests",
  },
  {
    icon: <FaExclamationTriangle className="text-white text-2xl" />,
    iconBg: "#f44336",
    value: 5,
    label: "Low Stock Items",
  },
];

const leaveData = [
  {
    id: "21918",
    name: "Anugrah Prasetya",
    status: "approved",
    time: "08:15 AM",
    date: "Today",
  },
  {
    id: "37189",
    name: "Denny Malik",
    status: "rejected",
    time: "08:15 AM",
    date: "Today",
  },
  {
    id: "41521",
    name: "Silvia Cintia Bakri",
    status: "approved",
    time: "08:15 AM",
    date: "Today",
  },
];

const statusBadge = {
  approved: (
    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-success group-hover:bg-green-200 transition-colors duration-200">
      <FaCircle className="mr-3 text-success text-[10px]" /> Checked in
    </span>
  ),
  rejected: (
    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-danger group-hover:bg-red-200 transition-colors duration-200">
      <FaCircle className="mr-3 text-danger text-[10px]" /> Checked out
    </span>
  ),
};

const DashboardHome = () => {
  const [search, setSearch] = useState("");

  const filteredData = leaveData.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="-mx-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 my-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-5 flex items-center"
          >
            <div
              style={{ backgroundColor: stat.iconBg }}
              className={`w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4`}
            >
              {stat.icon}
            </div>
            <div className="stat-details">
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-lightGrayText text-sm font-normal">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Leave/Permission Table Card */}
      <div className="bg-white rounded-xl shadow p-6 pl-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
          <div className="flex items-center border-[1.5px] border-gray/50 rounded-2xl px-4 py-3 w-full sm:w-72 bg-gray-50">
            <input
              type="text"
              placeholder="Search employee"
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
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray/10">
              <th className="py-4 px-4 text-left text-lg font-semibold rounded-l-xl w-[15%]">
                ID
              </th>
              <th className="py-4 px-4 text-left text-lg font-semibold w-[25%]">
                Name
              </th>
              <th className="py-4 px-4 text-left text-lg font-semibold w-[20%]">
                Time
              </th>
              <th className="py-4 px-4 text-left text-lg font-semibold w-[20%]">
                Date
              </th>
              <th className="py-4 px-4 text-left text-lg font-semibold rounded-r-xl w-[20%]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr
                key={idx}
                className="group border-b-2 border-gray/20 hover:bg-gray/10 transition-colors duration-200 cursor-pointer"
              >
                <td className="py-4 px-5 font-mono align-middle text-lg rounded-tl rounded-tr">
                  {row.id}
                </td>
                <td className="py-4 px-4 align-middle text-lg">{row.name}</td>
                <td className="py-4 px-3 align-middle text-lg">{row.time}</td>
                <td className="py-4 px-3 align-middle text-lg">{row.date}</td>
                <td className="py-4 px-3 text-center align-middle rounded-tl rounded-tr">
                  <div className="flex items-center justify-start">
                    {statusBadge[row.status]}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHome;
