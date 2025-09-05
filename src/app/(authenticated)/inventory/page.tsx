"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { cn } from "@/utils";
import AddItemModal from "@/components/modals/add-item-modal";
import AddStockModal from "@/components/modals/add-stock-modal";
import ConsumeStockModal from "@/components/modals/consume-stock-modal";
import { InventoryService } from "@/services/inventoryService";
import { InventoryItem as InventoryItemType } from "@/types";
import CustomDropdown from "@/components/ui/custom-dropdown";
import { TrendingUp, TrendingDown, Filter, Eye, Edit, MoreVertical } from "lucide-react";

// Helper function to get status based on stock levels
const getStockStatus = (currentStock: number, minimumStock: number): string => {
  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minimumStock) return "Low Stock";
  return "Normal";
};

// Helper function to get expiry info
const getExpiryInfo = (expiresAt: string): string | undefined => {
  if (!expiresAt) return undefined;

  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  if (diffDays <= 30) return `Expires in ${diffDays} days`;
  return undefined;
};

const getColorSwatch = (color: string) => {
  const colorMap: { [key: string]: string } = {
    Blue: "#3B82F6",
    Silver: "#9CA3AF",
    Beige: "#F5F5DC",
    Black: "#000000",
    White: "#FFFFFF",
    Brown: "#8B4513",
  };
  return colorMap[color] || "#9CA3AF";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Normal":
      return "bg-green-100 text-green-800";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800";
    case "Out of Stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getExpiryColor = (expiryInfo: string) => {
  if (expiryInfo.includes("Expires in")) {
    return "bg-orange-100 text-orange-800";
  }
  return "bg-green-100 text-green-800";
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showConsumeStockModal, setShowConsumeStockModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // API state
  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch inventory items
  const fetchInventoryItems = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await InventoryService.getInventoryItems(page, limit);
      setInventoryItems(response.items);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch inventory items";
      setError(errorMessage);
      console.error("Error fetching inventory:", err);

      // If it's an authentication error, redirect to login
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        // Handle authentication error
        console.log("Authentication error, user should be redirected to login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // Refresh inventory after modal operations
  const refreshInventory = () => {
    fetchInventoryItems(pagination.page, pagination.limit);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItemType) => {
    setEditingItem(item);
    setShowEditItemModal(true);
    setOpenDropdownId(null); // Close dropdown
  };

  // Handle view details
  const handleViewDetails = (item: InventoryItemType) => {
    // For now, just open edit modal - you can implement view details separately
    setEditingItem(item);
    setShowEditItemModal(true);
    setOpenDropdownId(null); // Close dropdown
  };

  // Toggle dropdown
  const toggleDropdown = (itemId: string) => {
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };


  // Handle quick stock update
  const handleQuickStockUpdate = async (
    itemId: string,
    action: "add" | "consume"
  ) => {
    const quantity = prompt(`Enter quantity to ${action}:`, "1");
    if (quantity && !isNaN(parseInt(quantity))) {
      try {
        setOpenDropdownId(null); // Close dropdown
        await InventoryService.updateStock(itemId, parseInt(quantity), action);
        refreshInventory();
      } catch (err) {
        console.error(`Error ${action}ing stock:`, err);
        alert(`Failed to ${action} stock. Please try again.`);
      }
    }
  };

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.itemName.localeCompare(b.itemName);
      case "stock":
        return b.currentStock - a.currentStock;
      case "mrp":
        return b.mrp - a.mrp;
      default:
        return 0;
    }
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="space-y-1">
            <h1
              className="text-lg font-semibold text-[#101828]"
              style={{ fontFamily: "Segoe UI" }}
            >
              Inventory
            </h1>
            <p
              className="text-[#4A5565] text-sm"
              style={{ fontFamily: "Segoe UI" }}
            >
              Managing inventory for Main Branch
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-2 px-6 py-1 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors text-xs font-medium cursor-pointer"
              style={{ fontFamily: "Segoe UI" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Item
            </button>
            <button
              onClick={() => setShowConsumeStockModal(true)}
              className="flex items-center gap-2 px-6 py-1 border border-[#E5E7EB] bg-white font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm cursor-pointer"
              style={{ fontFamily: "Segoe UI" }}
            >
              <TrendingDown className="w-4 h-4" />
              Consume Stock
            </button>
            <button
              onClick={() => setShowAddStockModal(true)}
              className="flex items-center gap-2 px-6 py-1 border border-[#E5E7EB] bg-white font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm cursor-pointer"
              style={{ fontFamily: "Segoe UI" }}
            >
              <TrendingUp className="w-4 h-4" />
              Add Stock
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-1 border border-[#E5E7EB] bg-white font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm cursor-pointer"
              style={{ fontFamily: "Segoe UI" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search on the left */}
          <div className="flex-shrink-0">
            <div className="relative w-64">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "Segoe UI" }}
              />
            </div>
          </div>

          {/* Filter and Sort on the right */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Filter Button */}
            <button className="bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-9 px-3 py-2 text-sm cursor-pointer">
              <Filter className="w-4 h-4 mr-2"/>
              Filter
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Sort Dropdown */}
            <CustomDropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "name", label: "Item Name (A-Z)" },
                { value: "stock", label: "Stock (High to Low)" },
                { value: "mrp", label: "MRP (High to Low)" },
              ]}
              placeholder="Sort by..."
              className="w-48"
              aria-label="Sort inventory items"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Item Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Item Code
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Type & Ear
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    MRP
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Color
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Stock
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                        <span className="ml-2 text-[#4A5565]">
                          Loading inventory...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="text-red-500">
                        <p className="font-medium">Error loading inventory</p>
                        <p className="text-sm">{error}</p>
                        <button
                          onClick={() => fetchInventoryItems()}
                          className="mt-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : sortedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-[#4A5565]"
                    >
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs font-medium text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.itemName}
                          </div>
                          <div
                            className="text-xs text-[#4A5565]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.brand}
                          </div>
                          <div
                            className="text-xs text-[#4A5565]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs text-[#101828]"
                          style={{ fontFamily: "Segoe UI" }}
                        >
                          {item.itemCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.itemType}
                          </span>
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs font-medium text-[#101828]"
                          style={{ fontFamily: "Segoe UI" }}
                        >
                          ₹{item.mrp.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-[#E5E7EB]"
                            style={{
                              backgroundColor: getColorSwatch(item.color),
                            }}
                          />
                          <span
                            className="text-xs text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs font-medium text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.currentStock}{" "}
                            {item.currentStock === 1 ? "piece" : "pieces"}
                          </div>
                          <div
                            className="text-xs text-[#4A5565]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            Min: {item.minimumStock}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(
                                getStockStatus(
                                  item.currentStock,
                                  item.minimumStock
                                )
                              )
                            )}
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {getStockStatus(
                              item.currentStock,
                              item.minimumStock
                            )}
                          </span>
                          {getExpiryInfo(item.expiresAt) && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                getExpiryColor(getExpiryInfo(item.expiresAt)!)
                              )}
                              style={{ fontFamily: "Segoe UI" }}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {getExpiryInfo(item.expiresAt)}
                            </span>
                          )}
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative dropdown-container">
                          <button
                            onClick={() => toggleDropdown(item.id)}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-50 cursor-pointer"
                            aria-label={`Actions for ${item.itemName}`}
                            title={`Actions for ${item.itemName}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                              <div className="p">
                                {/* View Details */}
                                <button
                                  onClick={() => handleViewDetails(item)}
                                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>

                                {/* Edit Item */}
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Item
                                </button>

                                {/* Separator */}
                                <div className="border-t border-gray-200 my-1"></div>

                                {/* Add Stock */}
                                <button
                                  onClick={() => handleQuickStockUpdate(item.id, "add")}
                                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer"
                                >
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  Add Stock
                                </button>

                                {/* Consume Stock */}
                                <button
                                  onClick={() => handleQuickStockUpdate(item.id, "consume")}
                                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer"
                                >
                                  <TrendingDown className="w-4 h-4 text-orange-600" />
                                  Consume Stock
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-[#E5E7EB] rounded-lg">
          <div className="text-sm text-[#4A5565]">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                fetchInventoryItems(pagination.page - 1, pagination.limit)
              }
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-[#E5E7EB] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB] cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-[#4A5565]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                fetchInventoryItems(pagination.page + 1, pagination.limit)
              }
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-[#E5E7EB] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSuccess={refreshInventory}
      />
      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        onSuccess={refreshInventory}
      />
      <ConsumeStockModal
        isOpen={showConsumeStockModal}
        onClose={() => setShowConsumeStockModal(false)}
        onSuccess={refreshInventory}
      />
      {editingItem && (
        <AddItemModal
          isOpen={showEditItemModal}
          onClose={() => {
            setShowEditItemModal(false);
            setEditingItem(null);
          }}
          onSuccess={refreshInventory}
          editingItem={editingItem}
          isEditMode={true}
        />
      )}
      </div>
    </MainLayout>
  );
}
