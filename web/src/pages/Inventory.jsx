import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaBox,
  FaExclamationTriangle,
  FaDumbbell,
  FaBicycle,
  FaRunning,
  FaWeight,
  FaTimes,
} from "react-icons/fa";
import {
  DataTable,
  EditModal,
  AddItem,
  EquipmentDetailModal,
  Actions,
  FormInput,
  FormSelect,
  FormFileUpload,
  EditDeleteButtons,
  ToastNotification,
  ImageWithSkeleton,
  AddButton,
  OperationsBanner,
  StatusBadge,
} from "@/components";
import {
  addInventoryItem,
  getInventoryItems,
  // deleteInventoryItem,
  updateInventoryItem,
} from "@/services/inventoryService";
import { useAuth } from "@/context";

const Inventory = () => {
  // Get current user from auth context
  const { user } = useAuth();

  // State for inventory data and UI
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    inventoryCode: "",
    quantity: "",
    status: "",
    image: null,
    imageFile: null,
  });
  const [itemCodePreview, setItemCodePreview] = useState("");

  // Success notification states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Validation errors for Add New Item modal
  const [addItemErrors, setAddItemErrors] = useState({});

  // Operation tracking for cancel functionality
  const [ongoingOperations, setOngoingOperations] = useState(new Map());
  const ongoingOperationsRef = useRef(new Map());

  // Cancel ongoing operation
  const cancelOperation = (operationId) => {
    const operation = ongoingOperationsRef.current.get(operationId);
    if (operation) {
      // Remove optimistic item
      if (operation.type === "add") {
        setInventory((prev) =>
          prev.filter((item) => item.id !== operation.optimisticId),
        );
      } else if (operation.type === "edit") {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === operation.itemId
              ? { ...item, isOptimistic: false }
              : item,
          ),
        );
      }

      // Remove from ongoing operations
      ongoingOperationsRef.current.delete(operationId);
      setOngoingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });

      // Show cancellation message
      const operationType =
        operation.type === "add" ? "Adding Item" : "Editing";
      setSuccessMessage(`${operationType} cancelled`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };
  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      try {
        const inventoryData = await getInventoryItems();
        console.log("Raw inventory data from Firebase:", inventoryData);
        // Add icon mapping for display and handle field migration
        const inventoryWithIcons = inventoryData.map((item) => {
          const categoryIcons = {
            Equipment: FaDumbbell,
            Machines: FaRunning,
          };
          // Ensure name field exists (fallback from productName for migration)
          const itemWithName = {
            ...item,
            name: item.name || item.productName || "Unknown Item",
            icon: categoryIcons[item.category] || FaBox,
          };
          console.log("Processed item:", itemWithName);
          return itemWithName;
        });
        console.log("Final inventory with icons:", inventoryWithIcons);
        setInventory(inventoryWithIcons);
      } catch (error) {
        console.error("Error loading inventory:", error);
        // Set empty array if Firebase fails
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Clean up stale operations (operations that have been running too long)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const staleOperations = [];

      ongoingOperationsRef.current.forEach((operation, operationId) => {
        // If operation has been running for more than 30 seconds, consider it stale
        if (now - operation.startTime > 30000) {
          staleOperations.push(operationId);
        }
      });

      if (staleOperations.length > 0) {
        staleOperations.forEach((operationId) => {
          ongoingOperationsRef.current.delete(operationId);
        });

        setOngoingOperations((prev) => {
          const newMap = new Map(prev);
          staleOperations.forEach((operationId) => {
            newMap.delete(operationId);
          });
          return newMap;
        });

        // Remove optimistic items for stale operations
        setInventory((prev) =>
          prev.filter(
            (item) =>
              !item.isOptimistic || !staleOperations.includes(item.operationId),
          ),
        );

        console.warn(`Cleaned up ${staleOperations.length} stale operations`);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  // Update Item Code preview when modal opens, category changes, or inventory changes
  useEffect(() => {
    if (showAddModal && newItem.category) {
      const categoryPrefixes = {
        Equipment: "EQ",
        Machines: "MACH",
      };
      const categoryCount =
        inventory.filter((item) => item.category === newItem.category).length +
        1;
      const generatedCode = `${categoryPrefixes[newItem.category]}-${String(categoryCount).padStart(3, "0")}`;
      setItemCodePreview(generatedCode);
      console.log(
        `Updated Item Code preview: ${generatedCode} for category: ${newItem.category}`,
      );
    } else if (showAddModal && !newItem.category) {
      setItemCodePreview("Select category to generate code");
    }
  }, [inventory, showAddModal, newItem.category]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showAddModal || showDetailModal || showEditModal) {
      // Store the current scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [showAddModal, showDetailModal, showEditModal]);

  // Filter inventory by category and status
  const filteredInventory = inventory.filter((item) => {
    const categoryMatch =
      selectedCategory === "all" || item.category === selectedCategory;
    const statusMatch =
      selectedStatus === "all" || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(inventory.map((item) => item.category)),
  ];

  // Get unique statuses for filter
  const statuses = ["all", ...new Set(inventory.map((item) => item.status))];

  // Removed unused helpers to satisfy linter

  // Handle edit item
  const handleEditItem = (item) => {
    // Set up the editing item with existing data
    setEditingItem({
      ...item,
      imageFile: null, // Reset imageFile to null initially
    });
    setShowEditModal(true);
    setShowDetailModal(false); // Close detail modal when opening edit modal
  };

  // Handle add item modal
  const handleAddItem = () => {
    setShowAddModal(true);
    // Initialize Item Code preview with current inventory state
    const categoryPrefixes = {
      Equipment: "EQ",
      Machines: "MACH",
    };
    const categoryCount =
      inventory.filter((item) => item.category === newItem.category).length + 1;
    const generatedCode = `${categoryPrefixes[newItem.category]}-${String(categoryCount).padStart(3, "0")}`;
    setItemCodePreview(generatedCode);
  };

  // Generate Item Code preview
  // Removed unused generateItemCodePreview to satisfy linter

  // Handle close add modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewItem({
      name: "",
      category: "",
      inventoryCode: "",
      quantity: "",
      status: "",
      image: null,
      imageFile: null,
    });
    setItemCodePreview("");
    // Clear validation errors when modal is closed
    setAddItemErrors({});
  };

  // Handle row click to show equipment details
  const handleRowClick = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailModal(true);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEquipment(null);
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Handle save edited item
  // Handle save edit item with optimistic updates and cancellation support
  const handleSaveEditItem = async () => {
    if (!user || !editingItem) {
      console.error("User not authenticated or no item to edit");
      return;
    }

    setSaving(true);

    // Create operation ID for tracking
    const operationId = `edit-${Date.now()}`;

    // Prepare the update data
    const updateData = {
      name: editingItem.name,
      category: editingItem.category,
      quantity: parseInt(editingItem.quantity) || 1,
      status: editingItem.status,
    };

    // Create optimistic update for immediate UI feedback
    const optimisticUpdate = {
      ...updateData,
      imagePath: editingItem.imageFile
        ? URL.createObjectURL(editingItem.imageFile)
        : editingItem.imagePath,
      updatedAt: new Date().toISOString(),
      operationId: operationId, // Track this operation
    };

    // Track the ongoing operation
    const operationData = {
      type: "edit",
      itemId: editingItem.id,
      itemName: editingItem.name,
      startTime: Date.now(),
    };

    ongoingOperationsRef.current.set(operationId, operationData);
    setOngoingOperations((prev) => {
      const newMap = new Map(prev);
      newMap.set(operationId, operationData);
      return newMap;
    });

    // Update UI immediately with optimistic data
    setInventory((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...optimisticUpdate, isOptimistic: true }
          : item,
      ),
    );

    // Close modal immediately
    handleCloseEditModal();

    // Process actual update in background
    try {
      const updatedData = await updateInventoryItem(
        editingItem.id,
        updateData,
        user.uid,
        editingItem.imageFile || null,
      );

      // Check if operation was cancelled
      if (!ongoingOperationsRef.current.has(operationId)) {
        return; // Operation was cancelled, don't proceed
      }

      // Replace optimistic update with real data
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...updateData,
                imagePath: updatedData.imagePath || item.imagePath,
                isOptimistic: false,
                operationId: undefined, // Remove operation tracking
              }
            : item,
        ),
      );

      // Remove from ongoing operations
      ongoingOperationsRef.current.delete(operationId);
      setOngoingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });

      // Show success notification only after actual update completes
      setSuccessMessage("Item updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      console.log(
        "Item updated successfully:",
        editingItem.name || editingItem.productName,
      );
    } catch (error) {
      console.error("Error updating item:", error);

      // Check if operation was cancelled
      if (!ongoingOperations.has(operationId)) {
        return; // Operation was cancelled, don't show error
      }

      // Revert optimistic update on error
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, isOptimistic: false, operationId: undefined }
            : item,
        ),
      );

      // Remove from ongoing operations
      ongoingOperationsRef.current.delete(operationId);
      setOngoingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });

      // Show error notification
      setSuccessMessage("Failed to update item. Please try again.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Handle save new item with optimistic updates and cancellation support
  const handleSaveNewItem = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // Validate required fields
    const errors = {};

    if (!newItem.name?.trim()) {
      errors.name = "Item Name is required";
    }
    if (!newItem.quantity || newItem.quantity <= 0) {
      errors.quantity = "Quantity is required";
    }
    if (!newItem.category) {
      errors.category = "Category is required";
    }
    if (!newItem.status) {
      errors.status = "Status is required";
    }

    // If there are validation errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setAddItemErrors(errors);
      return;
    }

    // Clear validation errors if validation passes
    setAddItemErrors({});

    setSaving(true);

    // Create operation ID for tracking
    const operationId = `add-${Date.now()}`;

    // Create optimistic item for immediate UI update
    const categoryIcons = {
      Equipment: FaDumbbell,
      Machines: FaRunning,
    };
    const optimisticItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: newItem.name,
      category: newItem.category,
      inventoryCode: itemCodePreview,
      quantity: parseInt(newItem.quantity),
      status: newItem.status,
      imagePath: newItem.imageFile
        ? URL.createObjectURL(newItem.imageFile)
        : null,
      icon: categoryIcons[newItem.category] || FaBox,
      minStock: 5,
      lastRestocked: new Date().toISOString().split("T")[0],
      expiryDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
      updatedBy: user.uid,
      isOptimistic: true, // Flag to identify optimistic items
      operationId: operationId, // Track this operation
    };

    // Track the ongoing operation
    const operationData = {
      type: "add",
      optimisticId: optimisticItem.id,
      itemName: newItem.name,
      startTime: Date.now(),
    };

    ongoingOperationsRef.current.set(operationId, operationData);
    setOngoingOperations((prev) => {
      const newMap = new Map(prev);
      newMap.set(operationId, operationData);
      return newMap;
    });

    // Add optimistic item to UI immediately
    setInventory((prev) => [optimisticItem, ...prev]);

    // Close modal immediately for better UX
    handleCloseAddModal();

    // Process actual save in background
    try {
      const result = await addInventoryItem(
        newItem,
        user.uid,
        newItem.imageFile,
      );
      const { docId, inventoryCode, imagePath } = result;

      // Check if operation was cancelled
      if (!ongoingOperationsRef.current.has(operationId)) {
        return; // Operation was cancelled, don't proceed
      }

      // Replace optimistic item with real item
      const realItem = {
        ...optimisticItem,
        id: docId,
        inventoryCode: inventoryCode,
        imagePath: imagePath || null,
        isOptimistic: false,
        operationId: undefined, // Remove operation tracking
      };

      setInventory((prev) =>
        prev.map((item) => (item.id === optimisticItem.id ? realItem : item)),
      );

      // Remove from ongoing operations
      ongoingOperationsRef.current.delete(operationId);
      setOngoingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });

      // Show success notification only after actual save completes
      setSuccessMessage("Item added successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding item:", error);

      // Check if operation was cancelled
      if (!ongoingOperationsRef.current.has(operationId)) {
        return; // Operation was cancelled, don't show error
      }

      // Remove optimistic item on error
      setInventory((prev) =>
        prev.filter((item) => item.id !== optimisticItem.id),
      );

      // Remove from ongoing operations
      ongoingOperationsRef.current.delete(operationId);
      setOngoingOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(operationId);
        return newMap;
      });

      // Show error notification
      setSuccessMessage("Failed to add item. Please try again.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Calculate inventory statistics
  const totalItems = inventory.length;
  const maintenanceItems = inventory.filter(
    (item) =>
      item.status === "needs-maintenance" || item.status === "under-repair",
  ).length;
  const outOfServiceItems = inventory.filter(
    (item) => item.status === "out-of-service",
  ).length;
  // Removed unused totalValue to satisfy linter

  // Add error boundary for debugging
  try {
    return (
      <div className="h-full pb-16">
        <div className="pl-1 pt-6"></div>

        {/* Inventory Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow p-5 flex items-center min-w-0">
            <div
              style={{ backgroundColor: "#2196f3" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
            >
              <FaBox className="text-white text-2xl" />
            </div>
            <div className="stat-details flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1 truncate">{totalItems}</h3>
              <p className="text-lightGrayText text-sm font-normal break-words">
                Total Items
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex items-center min-w-0">
            <div
              style={{ backgroundColor: "#ff9800" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
            >
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <div className="stat-details flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1 truncate">
                {maintenanceItems}
              </h3>
              <p className="text-lightGrayText text-sm font-normal break-words">
                Needs Maintenance
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex items-center min-w-0">
            <div
              style={{ backgroundColor: "#f44336" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
            >
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <div className="stat-details flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1 truncate">
                {outOfServiceItems}
              </h3>
              <p className="text-lightGrayText text-sm font-normal break-words">
                Out of Service
              </p>
            </div>
          </div>
        </div>

        {/* Operations Banner */}
        <OperationsBanner
          ongoingOperations={ongoingOperations}
          onCancelOperation={cancelOperation}
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
                    Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
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
                          : status
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Right column: Add Item button */}
              <div className="flex justify-end items-start">
                <AddButton
                  onClick={handleAddItem}
                  text="Add Item"
                  className=""
                />
              </div>
            </div>

            {/* md and larger: Original layout */}
            <div className="hidden md:flex md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
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
                          : status
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <AddButton
                  onClick={handleAddItem}
                  text="Add Item"
                  className=""
                />
              </div>
            </div>
          </div>
          <DataTable
            columns={[
              {
                key: "inventoryCode",
                label: "Item",
                width: "w-1/6",
                render: (value, row) => {
                  const IconComponent = row.icon;
                  return (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <ImageWithSkeleton
                        src={row.imagePath}
                        alt={row.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                        fallbackIcon={IconComponent}
                        fallbackBgColor="#4A70FF"
                        fallbackIconColor="text-white"
                        skeletonClassName="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs sm:text-sm lg:text-base text-gray-700 break-words ${row.isOptimistic && row.operationId && ongoingOperationsRef.current.has(row.operationId) ? "opacity-70" : ""}`}
                        >
                          {value}
                        </span>
                        {row.isOptimistic &&
                          row.operationId &&
                          ongoingOperationsRef.current.has(row.operationId) && (
                            <span className="text-xs text-blue-600 italic">
                              Saving...
                            </span>
                          )}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "name",
                label: "Name",
                width: "w-1/5",
                render: (value, row) => (
                  <span
                    className={`text-gray-900 text-xs sm:text-sm md:text-base break-words whitespace-normal ${row.isOptimistic && row.operationId && ongoingOperationsRef.current.has(row.operationId) ? "opacity-70" : ""}`}
                  >
                    {value}
                  </span>
                ),
              },
              {
                key: "quantity",
                label: "Quantity",
                width: "w-1/6",
                render: (value) => (
                  <div className="flex justify-start pl-1 sm:pl-2 md:pl-4">
                    <span className="text-xs sm:text-sm md:text-base text-gray-700">
                      {value} pcs
                    </span>
                  </div>
                ),
              },
              {
                key: "category",
                label: "Category",
                width: "w-1/6",
                render: (value) => (
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">
                    {value}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                width: "w-1/6",
                render: (value, row) => {
                  return (
                    <div className="flex justify-start pr-1">
                      <StatusBadge status={row.status} />
                    </div>
                  );
                },
              },
              {
                key: "actions",
                label: "Actions",
                width: "w-20",
                render: (value, row) => {
                  // Show operation status for optimistic items
                  if (
                    row.isOptimistic &&
                    row.operationId &&
                    ongoingOperationsRef.current.has(row.operationId)
                  ) {
                    return (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-blue-600 italic">
                          Saving...
                        </span>
                      </div>
                    );
                  }

                  // Show normal actions for completed items
                  return (
                    <Actions
                      item={row}
                      onEdit={handleEditItem}
                      collectionName="inventory"
                      itemNameField="name"
                      itemType="inventory item"
                      editTitle="Edit item"
                      deleteTitle="Delete item"
                      onDeleteSuccess={() => {
                        // Show success notification
                        setSuccessMessage("Item deleted successfully!");
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 3000);

                        // Refresh inventory after successful deletion
                        const loadInventory = async () => {
                          try {
                            const inventoryData = await getInventoryItems();
                            const inventoryWithIcons = inventoryData.map(
                              (item) => {
                                const categoryIcons = {
                                  Equipment: FaDumbbell,
                                  Machines: FaRunning,
                                };
                                return {
                                  ...item,
                                  name:
                                    item.name ||
                                    item.productName ||
                                    "Unknown Item",
                                  icon: categoryIcons[item.category] || FaBox,
                                };
                              },
                            );
                            setInventory(inventoryWithIcons);
                          } catch (error) {
                            console.error("Error refreshing inventory:", error);
                          }
                        };
                        loadInventory();
                      }}
                    />
                  );
                },
              },
            ]}
            data={filteredInventory}
            loading={loading}
            emptyMessage="No inventory items found."
            className="h-full"
            onRowClick={handleRowClick}
            pagination={{
              enabled: true,
              pageSize: pageSize,
              currentPage: currentPage,
              totalItems: filteredInventory.length,
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

        {/* Add Item Modal */}
        <AddItem
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onSave={handleSaveNewItem}
          saving={saving}
          title="Add New Item"
          saveText="Add Item"
          cancelText="Cancel"
          cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
          saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
          noShadow
          className="max-w-2xl"
        >
          <div className="space-y-5 mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Item Name <span className="text-red-500">*</span>
              </label>
              <FormInput
                type="text"
                value={newItem.name}
                onChange={(e) => {
                  setNewItem((s) => ({ ...s, name: e.target.value }));
                  // Clear error when user starts typing
                  if (addItemErrors.name) {
                    setAddItemErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="Enter item name"
                required={true}
                error={!!addItemErrors.name}
              />
              {addItemErrors.name && (
                <p className="text-red-500 text-sm mt-1 italic">
                  {addItemErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Item Code
              </label>
              <FormInput
                type="text"
                value={itemCodePreview}
                placeholder="Auto-generated by system"
                disabled={true}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <FormInput
                type="number"
                min="1"
                step="1"
                value={newItem.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow whole numbers (integers)
                  if (value === "" || /^\d+$/.test(value)) {
                    setNewItem((s) => ({ ...s, quantity: value }));
                    // Clear error when user starts typing
                    if (addItemErrors.quantity) {
                      setAddItemErrors((prev) => ({ ...prev, quantity: "" }));
                    }
                  }
                }}
                placeholder="Enter quantity"
                required={true}
                error={!!addItemErrors.quantity}
              />
              {addItemErrors.quantity && (
                <p className="text-red-500 text-sm mt-1 italic">
                  {addItemErrors.quantity}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={newItem.category}
                onChange={(e) => {
                  setNewItem((s) => ({ ...s, category: e.target.value }));
                  // Clear error when user selects an option
                  if (addItemErrors.category) {
                    setAddItemErrors((prev) => ({ ...prev, category: "" }));
                  }
                }}
                options={[
                  { value: "Equipment", label: "Equipment" },
                  { value: "Machines", label: "Machines" },
                ]}
                placeholder="Select category"
                required={true}
                className={addItemErrors.category ? "border-red-500" : ""}
              />
              {addItemErrors.category && (
                <p className="text-red-500 text-sm mt-1 italic">
                  {addItemErrors.category}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <FormSelect
                value={newItem.status}
                onChange={(e) => {
                  setNewItem((s) => ({ ...s, status: e.target.value }));
                  // Clear error when user selects an option
                  if (addItemErrors.status) {
                    setAddItemErrors((prev) => ({ ...prev, status: "" }));
                  }
                }}
                options={[
                  { value: "good-condition", label: "Good Condition" },
                  { value: "needs-maintenance", label: "Needs Maintenance" },
                  { value: "under-repair", label: "Under Repair" },
                  { value: "out-of-service", label: "Out of Service" },
                ]}
                placeholder="Select status"
                required={true}
                className={addItemErrors.status ? "border-red-500" : ""}
              />
              {addItemErrors.status && (
                <p className="text-red-500 text-sm mt-1 italic">
                  {addItemErrors.status}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Image</label>
              <FormFileUpload
                id="image-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewItem((s) => ({ ...s, imageFile: file }));
                  }
                }}
                selectedFile={newItem.imageFile}
                uploadText="Upload Image"
                replaceText="Upload New Image"
              />
            </div>
          </div>
        </AddItem>

        {/* Equipment Detail Modal */}
        <EquipmentDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          equipment={selectedEquipment}
          onEdit={handleEditItem}
        />

        {/* Edit Item Modal */}
        <EditModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditItem}
          saving={saving}
          title="Edit Item"
          saveText="Save"
          cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
          saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
          noShadow
          className="max-w-2xl"
        >
          {editingItem && (
            <div className="space-y-5 mt-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <FormInput
                  type="text"
                  value={editingItem.name || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                  required={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Item Code
                </label>
                <FormInput
                  type="text"
                  value={editingItem.inventoryCode || ""}
                  placeholder="Auto-generated by system"
                  disabled={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <FormInput
                  type="number"
                  min="1"
                  step="1"
                  value={editingItem.quantity || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow whole numbers (integers)
                    if (value === "" || /^\d+$/.test(value)) {
                      setEditingItem((s) => ({ ...s, quantity: value }));
                    }
                  }}
                  placeholder="Enter quantity"
                  required={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <FormSelect
                  value={editingItem.category || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, category: e.target.value }))
                  }
                  options={[
                    { value: "Equipment", label: "Equipment" },
                    { value: "Machines", label: "Machines" },
                  ]}
                  placeholder="Select category"
                  required={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <FormSelect
                  value={editingItem.status || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, status: e.target.value }))
                  }
                  options={[
                    { value: "good-condition", label: "Good Condition" },
                    { value: "needs-maintenance", label: "Needs Maintenance" },
                    { value: "under-repair", label: "Under Repair" },
                    { value: "out-of-service", label: "Out of Service" },
                  ]}
                  placeholder="Select status"
                  required={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Image
                </label>
                <FormFileUpload
                  id="edit-image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditingItem((s) => ({ ...s, imageFile: file }));
                    }
                  }}
                  selectedFile={editingItem.imageFile}
                  existingFile={editingItem.imagePath}
                  uploadText="Upload Image"
                  replaceText="Upload New Image"
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
  } catch (error) {
    console.error("Error rendering Inventory component:", error);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Inventory
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the inventory data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.toString()}
            </pre>
          </details>
        </div>
      </div>
    );
  }
};

export default Inventory;
