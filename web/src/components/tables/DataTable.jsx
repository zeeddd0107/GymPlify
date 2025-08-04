import React from "react";

/**
 * Reusable DataTable Component
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions with {key, label, width, align, render}
 * @param {Array} props.data - Array of data objects to display
 * @param {boolean} props.loading - Whether the table is in loading state
 * @param {string} props.emptyMessage - Message to show when no data (default: "No data found")
 * @param {string} props.className - Additional CSS classes for the table container
 * @param {Function} props.onRowClick - Function called when a row is clicked
 * @param {string} props.rowClassName - Additional CSS classes for table rows
 * @param {boolean} props.hoverable - Whether rows should have hover effect (default: true)
 * @param {string} props.headerClassName - Additional CSS classes for table header
 * @param {React.ReactNode} props.headerContent - Additional content to show in header (like title, subtitle)
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found",
  className = "",
  onRowClick,
  rowClassName = "",
  hoverable = true,
  headerClassName = "",
  headerContent,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center h-32 ${className}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl shadow-lg bg-white ${className}`}
    >
      {/* Header Content */}
      {headerContent && (
        <div className={`p-4 border-b border-gray-200 ${headerClassName}`}>
          {headerContent}
        </div>
      )}

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-primary text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-bold uppercase tracking-wider ${
                  column.width ? column.width : ""
                } ${column.align ? `text-${column.align}` : "text-left"}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`${
                hoverable ? "hover:bg-primary/10 transition-colors" : ""
              } ${onRowClick ? "cursor-pointer" : ""} ${rowClassName}`}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-4 ${
                    column.align ? `text-${column.align}` : ""
                  } ${column.cellClassName || ""}`}
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
