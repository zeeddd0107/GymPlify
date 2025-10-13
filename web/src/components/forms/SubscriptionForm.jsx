import React from "react";
import { CustomListBox, FormInput, FormSelect, DatePicker } from "@/components";
import { getSubscriptionStatus } from "@/components/utils";

/**
 * Reusable subscription form component for editing subscriptions
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data object
 * @param {Function} props.onFormDataChange - Function called when form data changes
 */
const SubscriptionForm = ({ formData, onFormDataChange }) => {
  // Calculate the current status based on the form data
  const calculateCurrentStatus = () => {
    if (!formData.startDate || !formData.endDate) {
      return formData.status || "active";
    }

    // Create a temporary subscription object to calculate status
    const tempSubscription = {
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: "active", // Always start with active to allow proper recalculation
    };

    return getSubscriptionStatus(tempSubscription);
  };

  const currentStatus = calculateCurrentStatus();

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
          Status (Auto-calculated)
        </label>
        <FormInput
          type="text"
          value={currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          readOnly={true}
          className="bg-gray-50 text-gray-700"
          placeholder="Status will be calculated based on dates"
        />
        <p className="text-xs text-gray-500 mt-1">
          Status is automatically determined based on the start and end dates.
        </p>
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
