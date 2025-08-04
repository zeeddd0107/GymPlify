import { useState, useCallback } from "react";

/**
 * Custom hook for modal operations
 * Handles modal state, open/close actions, and modal data
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Open modal with optional data and type
  const openModal = useCallback((data = null, type = null) => {
    setIsOpen(true);
    setModalData(data);
    setModalType(type);
  }, []);

  // Close modal and reset data
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
    setModalType(null);
  }, []);

  // Toggle modal state
  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Update modal data without changing open state
  const updateModalData = useCallback((newData) => {
    setModalData(newData);
  }, []);

  // Update modal type
  const updateModalType = useCallback((newType) => {
    setModalType(newType);
  }, []);

  return {
    // State
    isOpen,
    modalData,
    modalType,

    // Actions
    openModal,
    closeModal,
    toggleModal,
    updateModalData,
    updateModalType,
  };
};
