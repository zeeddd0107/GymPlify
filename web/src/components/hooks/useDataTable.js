import { useState, useMemo } from "react";

/**
 * Custom hook for data table operations
 * Handles sorting, filtering, pagination, and data manipulation
 */
export const useDataTable = (initialData = [], options = {}) => {
  const {
    initialSortBy = null,
    initialSortDirection = "asc",
    itemsPerPage = 10,
    enablePagination = true,
    enableSorting = true,
    enableFiltering = true,
  } = options;

  // State management
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  // Handle sorting
  const handleSort = (columnKey) => {
    if (!enableSorting) return;

    if (sortBy === columnKey) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(columnKey);
      setSortDirection("asc");
    }
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filtering
  const handleFilter = (filterKey, filterValue) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: filterValue,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Process data with sorting, filtering, and pagination
  const processedData = useMemo(() => {
    let processed = [...data];

    // Apply search filter
    if (enableFiltering && searchTerm) {
      processed = processed.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Apply custom filters
    if (enableFiltering && Object.keys(filters).length > 0) {
      processed = processed.filter((item) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true; // Skip empty filters
          return String(item[key])
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }),
      );
    }

    // Apply sorting
    if (enableSorting && sortBy) {
      processed.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return processed;
  }, [
    data,
    searchTerm,
    filters,
    sortBy,
    sortDirection,
    enableFiltering,
    enableSorting,
  ]);

  // Calculate pagination
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, itemsPerPage, enablePagination]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (!enablePagination) return null;

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      currentPage,
      totalPages,
      totalItems: processedData.length,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
      startIndex: (currentPage - 1) * itemsPerPage + 1,
      endIndex: Math.min(currentPage * itemsPerPage, processedData.length),
    };
  }, [processedData, currentPage, itemsPerPage, enablePagination]);

  // Update data
  const updateData = (newData) => {
    setData(newData);
    setCurrentPage(1); // Reset to first page when data changes
  };

  // Add new item
  const addItem = (item) => {
    setData((prev) => [...prev, item]);
  };

  // Update item
  const updateItem = (id, updates) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  // Remove item
  const removeItem = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset all filters and sorting
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({});
    setSortBy(initialSortBy);
    setSortDirection(initialSortDirection);
    setCurrentPage(1);
  };

  return {
    // State
    data: paginatedData,
    loading,
    sortBy,
    sortDirection,
    currentPage,
    searchTerm,
    filters,
    paginationInfo,

    // Actions
    handleSort,
    handleSearch,
    handleFilter,
    handlePageChange,
    updateData,
    addItem,
    updateItem,
    removeItem,
    resetFilters,
    setLoading,
  };
};
