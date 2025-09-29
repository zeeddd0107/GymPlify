import React from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

/**
 * PaginationControls Component
 * Provides pagination controls for tables
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalItems - Total number of items
 * @param {Function} props.onPageChange - Function called when page changes
 * @param {Function} props.onPageSizeChange - Function called when page size changes
 * @param {boolean} props.showPageSizeSelector - Whether to show page size selector
 * @param {Array} props.pageSizeOptions - Available page size options
 */
const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
      {/* Page info - left side */}
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Page navigation - centered */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 disabled:hover:shadow-none disabled:hover:scale-100"
          title="First page"
        >
          <FaAngleDoubleLeft />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 disabled:hover:shadow-none disabled:hover:scale-100"
          title="Previous page"
        >
          <FaAngleLeft />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              pageNum === 1 ? "px-3.5" : "px-3"
            } ${
              pageNum === currentPage
                ? "bg-primary text-white shadow-lg shadow-primary/10 border border-primary hover:shadow-xl hover:shadow-primary/20"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md"
            }`}
            title={`Page ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 disabled:hover:shadow-none disabled:hover:scale-100"
          title="Next page"
        >
          <FaAngleRight />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300 disabled:hover:shadow-none disabled:hover:scale-100"
          title="Last page"
        >
          <FaAngleDoubleRight />
        </button>
      </div>

      {/* Page size selector - right side */}
      {showPageSizeSelector && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      )}
    </div>
  );
};

export default PaginationControls;
