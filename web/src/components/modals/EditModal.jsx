import { FaTimes } from "react-icons/fa";
import { EditButtons } from "@/components";

const EditModal = ({
  isOpen,
  onClose,
  title = "Edit",
  children,
  onSave,
  saving = false,
  saveText = "Save",
  savingText,
  cancelText = "Cancel",
  onCancel,
  disabled = false,
  className = "",
  saveButtonClassName,
  cancelButtonClassName,
  forceEnableCancel = false,
}) => {
  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Main render function - displays edit modal with form and buttons
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-[30px]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with title and close button */}
        <div className="flex justify-between items-center p-7 pt-5 pb-4 border-b border-gray/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - displays the form or content passed as children */}
        <div className="px-7 flex-1 overflow-y-auto">
          <div className="space-y-4">{children}</div>
        </div>

        {/* Modal Buttons - EditButtons component for Save/Cancel actions */}
        <div className="px-7 pb-5 flex-shrink-0">
          <EditButtons
            onCancel={onCancel || onClose}
            onSave={onSave}
            saving={saving}
            savingText={savingText}
            saveText={saveText}
            cancelText={cancelText}
            forceEnableCancel={forceEnableCancel}
            disabled={disabled}
            saveButtonClassName={saveButtonClassName}
            cancelButtonClassName={cancelButtonClassName}
          />
        </div>
      </div>
    </div>
  );
};

export default EditModal;
