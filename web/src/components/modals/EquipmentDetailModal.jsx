import React, { useState } from "react";
import {
  FaTimes,
  FaBox,
  FaDumbbell,
  FaRunning,
  FaWeight,
  FaEdit,
  FaExpand,
} from "react-icons/fa";
import { EditDeleteButtons } from "@/components";

const EquipmentDetailModal = ({
  isOpen,
  onClose,
  equipment,
  onDelete,
  onEdit,
  deleting = false,
}) => {
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);

  // Don't render anything if modal is not open or no equipment data
  if (!isOpen || !equipment) return null;

  // Ensure name field exists (fallback from productName for migration)
  const equipmentName =
    equipment.name || equipment.productName || "Unknown Item";

  // Debug logging
  console.log("EquipmentDetailModal rendering with:", { isOpen, equipment });

  // Get the appropriate icon component
  const getIconComponent = (category) => {
    const iconMap = {
      Equipment: FaDumbbell,
      Machines: FaRunning,
    };
    return iconMap[category] || FaBox;
  };

  const IconComponent = getIconComponent(equipment.category);

  // Get status styling and text
  const getStatusInfo = (item) => {
    switch (item.status) {
      case "good-condition":
        return { text: "GOOD CONDITION", style: "bg-green-100 text-green-700" };
      case "needs-maintenance":
        return {
          text: "NEEDS MAINTENANCE",
          style: "bg-yellow-100 text-yellow-700",
        };
      case "under-repair":
        return { text: "UNDER REPAIR", style: "bg-orange-100 text-orange-700" };
      case "out-of-service":
        return { text: "OUT OF SERVICE", style: "bg-red-100 text-red-700" };
      default:
        return { text: "UNKNOWN", style: "bg-gray-100 text-gray-700" };
    }
  };

  const statusInfo = getStatusInfo(equipment);

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(equipment);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 pr-2">
            Equipment Details
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
          >
            <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
          {/* Equipment Image/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray/30 flex items-center justify-center group">
              {equipment.imagePath ? (
                <>
                  <img
                    src={equipment.imagePath}
                    alt={equipmentName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setShowImageFullscreen(true)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                    title="View full image"
                  >
                    <FaExpand className="w-4 h-4" />
                  </button>
                </>
              ) : null}
              <div
                className={`w-full h-full bg-blue-500 flex items-center justify-center ${equipment.imagePath ? "hidden" : "flex"}`}
                style={{ display: equipment.imagePath ? "none" : "flex" }}
              >
                <IconComponent className="text-white text-4xl md:text-5xl" />
              </div>
            </div>
          </div>

          {/* Equipment Name */}
          <div className="text-center mb-2">
            <h3 className="text-2xl font-medium text-gray-800">
              {equipmentName}
            </h3>
          </div>

          {/* Equipment ID */}
          <div className="text-center mb-4">
            <p className="text-lg md:text-base lg:text-sm font-semibold text-gray-500">
              {equipment.inventoryCode || equipment.id}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.style}`}
            >
              {statusInfo.text}
            </span>
          </div>

          {/* Equipment Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-base lg:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </label>
                <p className="text-base lg:text-base text-gray-800 mt-1">
                  {equipment.category}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-base lg:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Quantity
                </label>
                <p className="text-base lg:text-base text-gray-800 mt-1">
                  {equipment.quantity || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
          <EditDeleteButtons
            onEdit={handleEdit}
            onDelete={() => {
              if (onDelete) {
                onDelete(equipment);
              }
            }}
            editing={false}
            deleting={deleting}
            editText="Edit"
            deleteText="Delete"
            editingText="Editing..."
            deletingText="Deleting..."
            disabled={false}
          />
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showImageFullscreen && equipment.imagePath && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-8"
          onClick={() => setShowImageFullscreen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={equipment.imagePath}
              alt={equipmentName}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowImageFullscreen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              title="Close fullscreen"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetailModal;
