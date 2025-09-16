const EditButtons = ({
  onCancel,
  onSave,
  saving = false,
  saveText = "Save",
  savingText = "Saving...",
  cancelText = "Cancel",
  disabled = false,
  forceEnableCancel = false,
  cancelButtonClassName = "bg-cancelButton hover:bg-cancelButton/80",
  saveButtonClassName = "bg-saveButton hover:bg-saveButton/90",
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className={`px-6 py-3 border rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed $${cancelButtonClassName}`}
        disabled={(saving || disabled) && !forceEnableCancel}
      >
        {cancelText}
      </button>
      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className={`px-6 py-3 border text-white rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed $ ${saveButtonClassName}`}
      >
        {saving ? savingText : saveText}
      </button>
    </div>
  );
};

export default EditButtons;
