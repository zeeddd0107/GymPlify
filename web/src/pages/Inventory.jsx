import React, { useState, useEffect, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaBox,
  FaExclamationTriangle,
} from "react-icons/fa";
import { DataTable } from "@/components";

const Inventory = () => {
  // State for inventory data and UI
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample inventory data with different structure than subscriptions
  const sampleInventoryData = useMemo(
    () => [
      {
        id: "INV001",
        productName: "Protein Powder - Whey Gold Standard",
        category: "Products",
        sku: "PROT-WHEY-001",
        price: 49.99,
        cost: 35.0,
        stock: 25,
        minStock: 10,
        supplier: "Optimum Nutrition",
        location: "Warehouse A",
        lastRestocked: "2024-01-10",
        expiryDate: "2025-06-15",
        status: "active",
      },
      {
        id: "INV002",
        productName: "Dumbbells Set (5-50 lbs)",
        category: "Equipment",
        sku: "EQ-DUMB-002",
        price: 299.99,
        cost: 220.0,
        stock: 8,
        minStock: 5,
        supplier: "Rogue Fitness",
        location: "Warehouse B",
        lastRestocked: "2024-01-05",
        expiryDate: null,
        status: "active",
      },
      {
        id: "INV003",
        productName: "Pre-Workout Energy Blend",
        category: "Products",
        sku: "SUPP-PRE-003",
        price: 29.99,
        cost: 18.0,
        stock: 3,
        minStock: 15,
        supplier: "C4 Energy",
        location: "Warehouse A",
        lastRestocked: "2023-12-20",
        expiryDate: "2024-08-30",
        status: "low_stock",
      },
      {
        id: "INV004",
        productName: "Treadmill Pro Series",
        category: "Machines",
        sku: "MACH-TREAD-004",
        price: 1299.99,
        cost: 950.0,
        stock: 2,
        minStock: 3,
        supplier: "Life Fitness",
        location: "Warehouse C",
        lastRestocked: "2024-01-12",
        expiryDate: null,
        status: "active",
      },
      {
        id: "INV005",
        productName: "BCAA Amino Acids",
        category: "Products",
        sku: "SUPP-BCAA-005",
        price: 24.99,
        cost: 15.0,
        stock: 0,
        minStock: 20,
        supplier: "MyProtein",
        location: "Warehouse A",
        lastRestocked: "2023-11-15",
        expiryDate: "2024-05-20",
        status: "out_of_stock",
      },
      {
        id: "INV006",
        productName: "Resistance Bands Set",
        category: "Equipment",
        sku: "EQ-BANDS-006",
        price: 19.99,
        cost: 12.0,
        stock: 45,
        minStock: 25,
        supplier: "TheraBand",
        location: "Warehouse B",
        lastRestocked: "2024-01-08",
        expiryDate: null,
        status: "active",
      },
    ],
    [],
  );

  // Simulate loading data
  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInventory(sampleInventoryData);
      setLoading(false);
    };

    loadInventory();
  }, [sampleInventoryData]);

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

  // Calculate stock status
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return "out_of_stock";
    if (stock <= minStock) return "low_stock";
    return "active";
  };

  // Removed unused helpers to satisfy linter

  // Handle edit item
  const handleEditItem = (item) => {
    console.log("Edit item:", item);
    // TODO: Implement edit modal
  };

  // Handle delete item
  const handleDeleteItem = (itemId) => {
    console.log("Delete item:", itemId);
    // TODO: Implement delete confirmation
  };

  // Handle restock item
  const handleRestockItem = (item) => {
    console.log("Restock item:", item);
    // TODO: Implement restock modal
  };

  // Column definitions for inventory table - completely different from subscriptions
  const columns = [
    {
      key: "sku",
      label: "Item Code",
      render: (value) => <span title={value}>{value}</span>,
    },
    {
      key: "productName",
      label: "Product Name",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.category}</div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Current Stock",
      render: (value, row) => {
        const status = getStockStatus(value, row.minStock);
        return (
          <div className="flex items-center space-x-2 ml-6">
            <span
              className={`font-bold ${
                status === "out_of_stock"
                  ? "text-red-600"
                  : status === "low_stock"
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {value}
            </span>
            {status === "low_stock" && (
              <FaExclamationTriangle className="text-yellow-500 w-3 h-3" />
            )}
            {status === "out_of_stock" && (
              <FaExclamationTriangle className="text-red-500 w-3 h-3" />
            )}
          </div>
        );
      },
    },

    {
      key: "status",
      label: "Status",
      render: (value, row) => {
        const getStatus = (item) => {
          const stock = item.stock;
          const minStock = item.minStock;
          const category = item.category;

          if (category === "Products") {
            if (stock === 0)
              return { text: "Out of Stock", style: "bg-red-100 text-red-700" };
            if (stock < minStock)
              return {
                text: "Low Stock",
                style: "bg-yellow-100 text-yellow-700",
              };
            return { text: "In Stock", style: "bg-green-100 text-green-700" };
          } else if (category === "Equipment") {
            if (stock === 0)
              return {
                text: "Out of Service",
                style: "bg-red-100 text-red-700",
              };
            if (stock < minStock)
              return {
                text: "Under Maintenance",
                style: "bg-yellow-100 text-yellow-700",
              };
            return { text: "Available", style: "bg-green-100 text-green-700" };
          } else if (category === "Machines") {
            if (stock === 0)
              return {
                text: "Out of Service",
                style: "bg-red-100 text-red-700",
              };
            if (stock < minStock)
              return {
                text: "Under Repair",
                style: "bg-yellow-100 text-yellow-700",
              };
            return {
              text: "Operational",
              style: "bg-green-100 text-green-700",
            };
          }
          return { text: "Unknown", style: "bg-gray-100 text-gray-700" };
        };

        const status = getStatus(row);
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${status.style}`}
          >
            {status.text}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div className="flex space-x-1">
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
            className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
            title="Restock item"
            onClick={(e) => {
              e.stopPropagation();
              handleRestockItem(row);
            }}
          >
            <FaPlus className="w-4 h-4" />
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
  const lowStockItems = inventory.filter(
    (item) => getStockStatus(item.stock, item.minStock) === "low_stock",
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => getStockStatus(item.stock, item.minStock) === "out_of_stock",
  ).length;
  // Removed unused totalValue to satisfy linter

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
            <h3 className="text-2xl font-bold mb-1">{lowStockItems}</h3>
            <p className="text-lightGrayText text-sm font-normal">Low Stock</p>
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
            <h3 className="text-2xl font-bold mb-1">{outOfStockItems}</h3>
            <p className="text-lightGrayText text-sm font-normal">
              Out of Stock
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center">
          <div
            style={{ backgroundColor: "#ff5722" }}
            className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg flex items-center justify-center mr-4"
          >
            <FaExclamationTriangle className="text-white text-2xl" />
          </div>
          <div className="stat-details">
            <h3 className="text-2xl font-bold mb-1">
              {
                inventory.filter((item) => {
                  const status = getStockStatus(item.stock, item.minStock);
                  return status === "low_stock";
                }).length
              }
            </h3>
            <p className="text-lightGrayText text-sm font-normal">
              Under Maintenance
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable
        columns={columns}
        data={filteredInventory}
        loading={loading}
        emptyMessage="No inventory items found."
        className="h-full"
        headerContent={
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Items
              </h3>
              <p className="text-sm text-gray-600">
                Showing {filteredInventory.length} of {inventory.length} items
              </p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2">
              <FaPlus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        }
      />
    </div>
  );
};

export default Inventory;
