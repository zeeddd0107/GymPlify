import React from "react";
import { useSubscriptions } from "@/components/hooks";
import { SubscriptionsUI } from "@/components/ui";

const Subscriptions = () => {
  // Use the custom subscriptions hook for all logic
  const {
    subscriptions,
    loading,
    editModalOpen,
    deleteModalOpen,
    editFormData,
    saving,
    deleting,
    statusOptions,
    getColumns,
    handleSaveSubscription,
    handleCloseModal,
    handleFormDataChange,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleDeleteSuccess,
    handleDeleteError,
    deletingSubscription,
    toast,
    handleCloseToast,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useSubscriptions();

  return (
    <SubscriptionsUI
      subscriptions={subscriptions}
      loading={loading}
      editModalOpen={editModalOpen}
      deleteModalOpen={deleteModalOpen}
      editFormData={editFormData}
      saving={saving}
      deleting={deleting}
      statusOptions={statusOptions}
      columns={getColumns(handleDeleteSuccess, handleDeleteError)}
      onSaveSubscription={handleSaveSubscription}
      onCloseModal={handleCloseModal}
      onFormDataChange={handleFormDataChange}
      onCloseDeleteModal={handleCloseDeleteModal}
      onConfirmDelete={handleConfirmDelete}
      onDeleteSuccess={handleDeleteSuccess}
      onDeleteError={handleDeleteError}
      deleteItemName={deletingSubscription?.displayName}
      toast={toast}
      onCloseToast={handleCloseToast}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when page size changes
      }}
    />
  );
};

export default Subscriptions;
