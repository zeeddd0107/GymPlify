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
        category: "Supplements",
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
        category: "Supplements",
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
        category: "Supplements",
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

  // Calculate profit margin
  const calculateProfitMargin = (price, cost) => {
    return (((price - cost) / price) * 100).toFixed(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

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
      label: "SKU",
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
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
      label: "Stock Level",
      render: (value, row) => {
        const status = getStockStatus(value, row.minStock);
        return (
          <div className="flex items-center space-x-2">
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
            <span className="text-xs text-gray-500">/ {row.minStock} min</span>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      render: (value, row) => (
        <div>
          <div className="font-bold text-gray-900">{formatCurrency(value)}</div>
          <div className="text-xs text-green-600">
            {calculateProfitMargin(value, row.cost)}% margin
          </div>
        </div>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (value) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: "location",
      label: "Location",
      render: (value) => (
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "lastRestocked",
      label: "Last Restocked",
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
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
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.price * item.stock,
    0,
  );

  return (
    <div className="h-full">
      <div className="pl-1 pt-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Inventory Management
        </h1>
        <p className="mb-8 text-gray-600">
          Track and manage your gym equipment and supplies inventory.
        </p>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaBox className="text-blue-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStockItems}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {outOfStockItems}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaBox className="text-green-500 w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalValue)}
              </p>
            </div>
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
