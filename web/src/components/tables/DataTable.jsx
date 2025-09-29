import React from "react";
import { PaginationControls } from "@/components";

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
 * @param {Object} props.pagination - Pagination configuration object
 * @param {Function} props.onPageChange - Function called when page changes
 * @param {Function} props.onPageSizeChange - Function called when page size changes
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
  pagination = null,
  onPageChange,
  onPageSizeChange,
}) => {
  // Calculate paginated data if pagination is enabled
  const paginatedData = pagination
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize,
      )
    : data;

  // Use paginated data for rendering
  const displayData = paginatedData;
  // Loading state - skeleton loading
  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-b-xl shadow-lg bg-white ${className}`}
      >
        {/* Header Content Skeleton */}
        {headerContent && (
          <div
            className={`p-3 sm:p-4 border-b border-gray-200 ${headerClassName}`}
          >
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-32 sm:w-48"></div>
          </div>
        )}

        {/* Table Skeleton */}
        <table className="min-w-full divide-y divide-gray-300 table-auto w-full">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-1 sm:px-2 md:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider"
                  style={column.width ? { width: column.width } : {}}
                >
                  <div className="h-3 sm:h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className="px-1 sm:px-2 md:px-3 lg:px-4 py-3 sm:py-4 break-words"
                  >
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={`text-center text-gray-500 text-base sm:text-lg p-4 sm:p-6 ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-b-xl shadow-lg bg-white ${className}`}
    >
      {/* Header Content */}
      {headerContent && (
        <div
          className={`p-3 sm:p-4 border-b border-gray-200 ${headerClassName}`}
        >
          {headerContent}
        </div>
      )}

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-300 table-auto w-full">
        <thead className="bg-primary text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-1 sm:px-2 md:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  column.width ? column.width : ""
                } ${column.align ? `text-${column.align}` : "text-left"}`}
                style={column.width ? { width: column.width } : {}}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {displayData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`${
                hoverable ? "hover:bg-gray-50 transition-colors" : ""
              } ${onRowClick ? "cursor-pointer" : ""} ${rowClassName}`}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-1 sm:px-2 md:px-3 lg:px-4 py-3 sm:py-4 break-words text-xs sm:text-sm md:text-base ${
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

      {/* Pagination Controls */}
      {pagination && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={Math.ceil(pagination.totalItems / pagination.pageSize)}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showPageSizeSelector={pagination.showPageSizeSelector}
          pageSizeOptions={pagination.pageSizeOptions}
        />
      )}
    </div>
  );
};

export default DataTable;
