import { useState, useEffect } from "react";

/**
 * Custom hook for subscription form logic
 * Handles form state management and validation
 */
export const useSubscriptionForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    plan: "",
    status: "",
    startDate: "",
    endDate: "",
    customMemberId: "",
    displayName: "",
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  // Update form data
  const handleFormDataChange = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
    // Clear errors when data changes
    setErrors({});
  };

  // Update specific field
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName?.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.plan?.trim()) {
      newErrors.plan = "Plan is required";
    }

    if (!formData.status?.trim()) {
      newErrors.status = "Status is required";
    }

    if (!formData.startDate?.trim()) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate?.trim()) {
      newErrors.endDate = "End date is required";
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = (newData = {}) => {
    setFormData({
      plan: "",
      status: "",
      startDate: "",
      endDate: "",
      customMemberId: "",
      displayName: "",
      ...newData,
    });
    setErrors({});
  };

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  return {
    // State
    formData,
    errors,

    // Actions
    handleFormDataChange,
    handleFieldChange,
    validateForm,
    resetForm,
  };
};
