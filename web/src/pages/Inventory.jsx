import React, { useState, useEffect, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaBox,
  FaExclamationTriangle,
  FaDumbbell,
  FaBicycle,
  FaRunning,
  FaWeight,
  FaUpload,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import {
  DataTable,
  EditModal,
  EquipmentDetailModal,
  DeleteModal,
} from "@/components";
import {
  addInventoryItem,
  getInventoryItems,
  deleteInventoryItem,
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Equipment",
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

  // Sample inventory data with different structure than subscriptions
  const sampleInventoryData = useMemo(
    () => [
      {
        id: "INV002",
        name: "Dumbbells Set (5-50 lbs)",
        category: "Equipment",
        inventoryCode: "EQ-002",
        quantity: 15,
        price: 299.99,
        cost: 220.0,
        supplier: "Rogue Fitness",
        location: "Warehouse B",
        status: "good-condition",
        icon: FaDumbbell,
      },
      {
        id: "INV004",
        name: "Treadmill Pro Series",
        category: "Machines",
        inventoryCode: "MACH-001",
        quantity: 3,
        price: 1299.99,
        cost: 950.0,
        supplier: "Life Fitness",
        location: "Warehouse C",
        status: "needs-maintenance",
        icon: FaRunning,
      },
      {
        id: "INV006",
        name: "Resistance Bands Set",
        category: "Equipment",
        inventoryCode: "EQ-003",
        quantity: 25,
        price: 19.99,
        cost: 12.0,
        supplier: "TheraBand",
        location: "Warehouse B",
        status: "under-repair",
        icon: FaWeight,
      },
    ],
    [],
  );

  // Load inventory data from Firebase
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
        // Fallback to sample data if Firebase fails
        setInventory(sampleInventoryData);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [sampleInventoryData]);

  // Update Item Code preview when modal opens, category changes, or inventory changes
  useEffect(() => {
    if (showAddModal) {
      const categoryPrefixes = {
        Products: "PROD",
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
    }
  }, [inventory, showAddModal, newItem.category]);

  // Filter inventory by category
  const filteredInventory =
    selectedCategory === "all"
      ? inventory
      : inventory.filter((item) => item.category === selectedCategory);

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(inventory.map((item) => item.category)),
  ];

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

  // Handle delete item
  const handleDeleteItem = (itemIdOrItem) => {
    let item;

    // Handle both itemId (string) and item object
    if (typeof itemIdOrItem === "string") {
      item = inventory.find((item) => item.id === itemIdOrItem);
    } else {
      item = itemIdOrItem;
    }

    if (item) {
      setItemToDelete(item);
      setShowDeleteModal(true);
    }
  };

  // Handle add item modal
  const handleAddItem = () => {
    setShowAddModal(true);
    // Initialize Item Code preview with current inventory state
    const categoryPrefixes = {
      Products: "PROD",
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
      category: "Equipment",
      inventoryCode: "",
      quantity: "",
      status: "",
      image: null,
      imageFile: null,
    });
    setItemCodePreview("");
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
  const handleSaveEditItem = async () => {
    if (!user || !editingItem) {
      console.error("User not authenticated or no item to edit");
      return;
    }

    setSaving(true);
    try {
      // Prepare the update data
      const updateData = {
        name: editingItem.name,
        category: editingItem.category,
        quantity: parseInt(editingItem.quantity) || 1,
        status: editingItem.status,
      };

      // Call the update service with the new image file if it exists
      const updatedData = await updateInventoryItem(
        editingItem.id,
        updateData,
        user.uid,
        editingItem.imageFile || null,
      );

      // Update the local inventory state
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...updateData,
                imagePath: updatedData.imagePath || item.imagePath,
              }
            : item,
        ),
      );

      // Close the modal
      handleCloseEditModal();

      // Show success notification
      setSuccessMessage("Item updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      console.log(
        "Item updated successfully:",
        editingItem.name || editingItem.productName,
      );
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      // Delete item from Firestore and its image from Storage
      await deleteInventoryItem(itemToDelete.id, itemToDelete);

      // Remove item from local state
      setInventory((prev) =>
        prev.filter((item) => item.id !== itemToDelete.id),
      );

      console.log(
        "Item deleted successfully:",
        itemToDelete.name || itemToDelete.productName,
      );

      // Close modal after successful deletion
      handleCloseDeleteModal();

      // Show success notification
      setSuccessMessage("Item deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      // You might want to show an error message to the user here
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Handle save new item
  const handleSaveNewItem = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // Validate required fields
    if (!newItem.status) {
      alert("Please select a status for the item.");
      return;
    }

    setSaving(true);
    try {
      // Create the item for Firebase (service will generate SKU)
      const itemToSave = {
        ...newItem,
      };

      // Add item to Firebase
      const result = await addInventoryItem(
        itemToSave,
        user.uid,
        newItem.imageFile,
      );
      const { docId, inventoryCode, imagePath } = result;

      // Add the new item to local state with icon
      const categoryIcons = {
        Equipment: FaDumbbell,
        Machines: FaRunning,
      };

      const newItemWithIcon = {
        ...itemToSave,
        id: docId,
        inventoryCode: inventoryCode, // Use the inventory code generated by the service
        icon: categoryIcons[newItem.category] || FaBox,
        imagePath: imagePath, // Use the Firebase Storage URL
        minStock: 5,
        lastRestocked: new Date().toISOString().split("T")[0],
        expiryDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
        updatedBy: user.uid,
      };

      setInventory((prev) => [newItemWithIcon, ...prev]);
      handleCloseAddModal();

      // Show success notification
      setSuccessMessage("Item added successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding item:", error);
      // You might want to show an error message to the user here
    } finally {
      setSaving(false);
    }
  };

  // Column definitions for inventory table - completely different from subscriptions
  const columns = [
    {
      key: "inventoryCode",
      label: "ITEM",
      width: "w-1/6",
      render: (value, row) => {
        const IconComponent = row.icon;
        return (
          <div className="flex items-center space-x-3">
            {row.imagePath ? (
              <img
                src={row.imagePath}
                alt={row.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#4A70FF" }}
              >
                <IconComponent className="text-white text-lg" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base text-gray-700">{value}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "NAME",
      width: "w-1.5/6",
      render: (value) => {
        // Break text at word boundaries to avoid splitting words
        const breakText = (text) => {
          if (!text) return "";

          const words = text.split(" ");
          const lines = [];
          let currentLine = "";

          for (const word of words) {
            // If adding this word would exceed 25 characters, start a new line
            if (
              currentLine.length + word.length + 1 > 25 &&
              currentLine.length > 0
            ) {
              lines.push(currentLine.trim());
              currentLine = word;
            } else {
              currentLine += (currentLine ? " " : "") + word;
            }
          }

          // Add the last line if it has content
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }

          return lines.join("\n");
        };

        return (
          <span className="font-medium text-gray-900 text-base whitespace-pre-line">
            {breakText(value)}
          </span>
        );
      },
    },
    {
      key: "quantity",
      label: "QUANTITY",
      width: "w-1/6",
      render: (value) => (
        <div className="flex justify-start pl-4">
          <span className="text-base text-gray-700 font-medium">
            {value} pcs
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      width: "w-1/6",
      align: "right",
      render: (value) => (
        <span className="text-base text-gray-700 pr-6">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-1/6",
      render: (value, row) => {
        const getStatusDisplay = (status) => {
          switch (status) {
            case "good-condition":
              return {
                text: "Good Condition",
                style: "bg-green-100 text-green-700",
              };
            case "needs-maintenance":
              return {
                text: "Needs Maintenance",
                style: "bg-yellow-100 text-yellow-700",
              };
            case "under-repair":
              return {
                text: "Under Repair",
                style: "bg-orange-100 text-orange-700",
              };
            case "out-of-service":
              return {
                text: "Out of Service",
                style: "bg-red-100 text-red-700",
              };
            default:
              return { text: "Unknown", style: "bg-gray-100 text-gray-700" };
          }
        };

        const status = getStatusDisplay(row.status);
        return (
          <div className="flex justify-start pr-1">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.style}`}
            >
              {status.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "w-0.5/6",
      render: (value, row) => (
        <div className="flex space-x-1 justify-start">
          <button
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit item"
            onClick={(e) => {
              e.stopPropagation();
              handleEditItem(row);
            }}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete item"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteItem(row.id);
            }}
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

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
      <div className="h-full">
        <div className="pl-1 pt-6"></div>

        {/* Inventory Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow p-5 flex items-center">
            <div
              style={{ backgroundColor: "#2196f3" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4"
            >
              <FaBox className="text-white text-2xl" />
            </div>
            <div className="stat-details">
              <h3 className="text-2xl font-bold mb-1">{totalItems}</h3>
              <p className="text-lightGrayText text-sm font-normal">
                Total Items
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex items-center">
            <div
              style={{ backgroundColor: "#ff9800" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4"
            >
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <div className="stat-details">
              <h3 className="text-2xl font-bold mb-1">{maintenanceItems}</h3>
              <p className="text-lightGrayText text-sm font-normal">
                Needs Maintenance
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex items-center">
            <div
              style={{ backgroundColor: "#f44336" }}
              className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4"
            >
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <div className="stat-details">
              <h3 className="text-2xl font-bold mb-1">{outOfServiceItems}</h3>
              <p className="text-lightGrayText text-sm font-normal">
                Out of Service
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Items
            </h3>
            <p className="text-sm text-gray-600">
              Showing {filteredInventory.length} of {inventory.length} items
            </p>
          </div>
          <button
            onClick={handleAddItem}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Inventory Table */}
        <DataTable
          columns={columns}
          data={filteredInventory}
          loading={loading}
          emptyMessage="No inventory items found."
          className="h-full"
          onRowClick={handleRowClick}
        />

        {/* Add Item Modal */}
        <EditModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onSave={handleSaveNewItem}
          saving={saving}
          title="Add New Item"
          saveText="Add Item"
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
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border focus:border-primary transition-colors"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Enter item name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Item Code <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                value={itemCodePreview}
                readOnly
                placeholder="Auto-generated by system"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border focus:border-primary transition-colors"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, quantity: e.target.value }))
                }
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border focus:border-primary transition-colors"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, category: e.target.value }))
                }
              >
                <option value="Equipment">Equipment</option>
                <option value="Machines">Machines</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border focus:border-primary transition-colors"
                value={newItem.status}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, status: e.target.value }))
                }
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="good-condition">Good Condition</option>
                <option value="needs-maintenance">Needs Maintenance</option>
                <option value="under-repair">Under Repair</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewItem((s) => ({ ...s, imageFile: file }));
                    }
                  }}
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-left gap-2 w-full px-4 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <FaUpload className="text-primary text-lg" />
                  <span className="text-primary font-normal text-sm">
                    Upload Image
                  </span>
                </label>
                {newItem.imageFile && (
                  <div className="mt-3">
                    <div className="text-sm">
                      <span className="text-sm text-slate-500 italic">
                        Current:
                      </span>{" "}
                      <span className="text-sm text-slate-500 italic">
                        {newItem.imageFile.name} (
                        {(newItem.imageFile.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </EditModal>

        {/* Equipment Detail Modal */}
        <EquipmentDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          equipment={selectedEquipment}
          onDelete={handleDeleteItem}
          onEdit={handleEditItem}
          deleting={deleting}
        />

        {/* Edit Item Modal */}
        <EditModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditItem}
          saving={saving}
          title="Edit Item"
          saveText="Save Changes"
          cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
          saveButtonClassName="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
          noShadow
          className="max-w-2xl"
        >
          {editingItem && (
            <div className="space-y-5 mt-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-primary transition-colors"
                  value={editingItem.name || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                  value={editingItem.inventoryCode || ""}
                  readOnly
                  placeholder="Auto-generated by system"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-primary transition-colors"
                  value={editingItem.quantity || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, quantity: e.target.value }))
                  }
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-primary transition-colors"
                  value={editingItem.category || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, category: e.target.value }))
                  }
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Machines">Machines</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-primary transition-colors"
                  value={editingItem.status || ""}
                  onChange={(e) =>
                    setEditingItem((s) => ({ ...s, status: e.target.value }))
                  }
                >
                  <option value="good-condition">Good Condition</option>
                  <option value="needs-maintenance">Needs Maintenance</option>
                  <option value="under-repair">Under Repair</option>
                  <option value="out-of-service">Out of Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="edit-image-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditingItem((s) => ({ ...s, imageFile: file }));
                      }
                    }}
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="flex items-center justify-left gap-2 w-full px-4 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <FaUpload className="text-primary text-lg" />
                    <span className="text-primary font-normal text-sm">
                      {editingItem.imagePath || editingItem.imageFile
                        ? "Upload New Image"
                        : "Upload Image"}
                    </span>
                  </label>
                </div>
                {editingItem.imageFile && (
                  <div className="mt-3">
                    <div className="text-sm">
                      <span className="text-sm text-slate-500 italic">
                        Current:
                      </span>{" "}
                      <span className="text-sm text-slate-500 italic">
                        {editingItem.imageFile.name} (
                        {(editingItem.imageFile.size / 1024 / 1024).toFixed(1)}{" "}
                        MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </EditModal>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
          title="Delete Item"
          itemName={
            itemToDelete?.name || itemToDelete?.productName || "Unknown Item"
          }
          itemType="inventory item"
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Success Notification */}
        {showSuccess && (
          <div
            className="fixed top-4 right-4 z-[60] bg-white rounded-lg border-l-4 border-green-500 px-4 py-3 flex items-center gap-3 max-w-sm"
            style={{ boxShadow: "5px 5px 8px rgba(0, 0, 0, 0.1)" }}
          >
            {/* Success icon */}
            <div className="bg-green-600 rounded-full p-2 flex-shrink-0">
              <FaCheck className="w-4 h-4 text-white" />
            </div>

            {/* Text content */}
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">
                {successMessage}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="text-dark hover:text-gray transition-colors flex-shrink-0 p-1 rounded-full hover:bg-black-200"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}
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
