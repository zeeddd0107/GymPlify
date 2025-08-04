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
    columns,
    handleSaveSubscription,
    handleCloseModal,
    handleFormDataChange,
    handleCloseDeleteModal,
    handleConfirmDelete,
    deletingSubscription,
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
      columns={columns}
      onSaveSubscription={handleSaveSubscription}
      onCloseModal={handleCloseModal}
      onFormDataChange={handleFormDataChange}
      onCloseDeleteModal={handleCloseDeleteModal}
      onConfirmDelete={handleConfirmDelete}
      deleteItemName={deletingSubscription?.displayName}
    />
  );
};

export default Subscriptions;
