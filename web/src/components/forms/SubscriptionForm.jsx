import React from "react";
import { CustomListBox, FormInput, FormSelect, DatePicker } from "@/components";

/**
 * Reusable subscription form component for editing subscriptions
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data object
 * @param {Function} props.onFormDataChange - Function called when form data changes
 * @param {Array} props.statusOptions - Array of status options for dropdown
 */
const SubscriptionForm = ({ formData, onFormDataChange, statusOptions }) => {
  // Handle date changes from DatePicker component
  const handleStartDateChange = (dateString) => {
    onFormDataChange({
      ...formData,
      startDate: dateString,
    });
  };

  const handleEndDateChange = (dateString) => {
    onFormDataChange({
      ...formData,
      endDate: dateString,
    });
  };

  return (
    <div className="space-y-4">
      {/* Member Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Member ID</label>
          <FormInput
            type="text"
            value={formData.customMemberId || ""}
            readOnly={true}
            placeholder="Auto-generated"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Member Name <span className="text-red-500">*</span>
          </label>
          <FormInput
            type="text"
            value={formData.displayName || ""}
            onChange={(e) => {
              onFormDataChange({
                ...formData,
                displayName: e.target.value,
              });
            }}
            placeholder="Enter member name"
            required={true}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Status <span className="text-red-500">*</span>
        </label>
        <FormSelect
          value={formData.status || ""}
          onChange={(e) => {
            onFormDataChange({
              ...formData,
              status: e.target.value,
            });
          }}
          options={statusOptions.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          placeholder="Select Status"
          required={true}
        />
      </div>

      {/* DatePicker Component */}
      <DatePicker
        startDate={formData.startDate}
        endDate={formData.endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
    </div>
  );
};

export default SubscriptionForm;
