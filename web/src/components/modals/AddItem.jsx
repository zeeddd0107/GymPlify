import { FaTimes } from "react-icons/fa";
import { SaveCancelButtons } from "@/components";

const AddItem = ({
  isOpen,
  onClose,
  title = "Add Item",
  children,
  onSave,
  saving = false,
  saveText = "Add",
  savingText = "Adding...",
  cancelText = "Cancel",
  onCancel,
  disabled = false,
  className = "",
  saveButtonClassName,
  cancelButtonClassName,
  maxWidth = "max-w-lg", // Default max width
  maxHeight = "max-h-[90vh]", // Default max height with margin
  noShadow = false,
}) => {
  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Main render function - displays add item modal with form and buttons
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full ${maxWidth} max-w-[95vw] flex flex-col ${maxHeight} ${
          noShadow ? "" : "shadow-2xl"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with title and close button */}
        <div className="flex justify-between items-center px-6 py-4 sm:p-6 md:px-7 md:py-4 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray/20 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Modal Content - displays the form or content passed as children */}
        <div className="px-6 sm:px-6 md:px-7 flex-1 overflow-y-auto">
          <div className="space-y-3 sm:space-y-4 md:space-y-5">{children}</div>
        </div>

        {/* Modal Buttons - SaveCancelButtons component for Add/Cancel actions */}
        <div className="px-4 mb-1 sm:mb-0 sm:px-6 md:px-7 pt-4 sm:pt-5 pb-4 sm:pb-6 flex-shrink-0">
          <SaveCancelButtons
            onCancel={onCancel || onClose}
            onSave={onSave}
            saving={saving}
            savingText={savingText}
            saveText={saveText}
            cancelText={cancelText}
            disabled={disabled || saving}
            saveButtonClassName={saveButtonClassName}
            cancelButtonClassName={cancelButtonClassName}
          />
        </div>
      </div>
    </div>
  );
};

export default AddItem;
