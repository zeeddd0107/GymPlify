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
    search,
    setSearch,
    filteredSubscriptions,
    // QR Code state and actions
    qrModalOpen,
    selectedUser,
    qrCodeValue,
    qrCodeImage,
    regeneratingQr,
    handleQrCodeClick,
    handleRegenerateQrCode,
    handleCloseQrModal,
    // Subscription details modal state and actions
    subscriptionDetailsModalOpen,
    selectedSubscription,
    handleSubscriptionClick,
    handleCloseSubscriptionDetailsModal,
  } = useSubscriptions();

  return (
    <SubscriptionsUI
      subscriptions={filteredSubscriptions}
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
      search={search}
      onSearchChange={setSearch}
      // QR Code props
      qrModalOpen={qrModalOpen}
      selectedUser={selectedUser}
      qrCodeValue={qrCodeValue}
      qrCodeImage={qrCodeImage}
      regeneratingQr={regeneratingQr}
      onQrCodeClick={handleQrCodeClick}
      onRegenerateQrCode={handleRegenerateQrCode}
      onCloseQrModal={handleCloseQrModal}
      // Subscription details modal props
      subscriptionDetailsModalOpen={subscriptionDetailsModalOpen}
      selectedSubscription={selectedSubscription}
      onSubscriptionClick={handleSubscriptionClick}
      onCloseSubscriptionDetailsModal={handleCloseSubscriptionDetailsModal}
    />
  );
};

export default Subscriptions;
