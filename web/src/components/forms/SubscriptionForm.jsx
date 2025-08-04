import React from "react";
import { CustomListBox, LabeledInput, DatePicker } from "@/components";

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
      {/* Member Info (Read-only) */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledInput
          label="Member ID"
          value={formData.customMemberId || ""}
          inputProps={{ readOnly: true }}
        />

        <LabeledInput
          label="Member Name"
          value={formData.displayName || ""}
          onChange={(e) => {
            onFormDataChange({
              ...formData,
              displayName: e.target.value,
            });
          }}
        />
      </div>

      <CustomListBox
        label="Status"
        options={statusOptions}
        selectedValue={
          statusOptions.find((status) => status.id === formData.status) ||
          statusOptions[0]
        }
        onChange={(selectedStatus) => {
          onFormDataChange({
            ...formData,
            status: selectedStatus.id,
          });
        }}
        placeholder="Select Status"
      />

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
