import { EditModal, SubscriptionForm, ToastNotification } from "@/components";
import { DeleteModal } from "@/components/modals";

/**
 * Subscriptions Actions Component
 * Handles both Edit and Delete modals for subscriptions
 */
const SubscriptionsActions = ({
  editModalOpen,
  deleteModalOpen,
  editFormData,
  saving,
  deleting,
  statusOptions,
  onSaveSubscription,
  onCloseEditModal,
  onCloseDeleteModal,
  onConfirmDelete,
  onFormDataChange,
  deleteItemName,
  deleteItemType = "subscription",
  toast,
  onCloseToast,
}) => {
  // Main render function - displays both edit and delete modals
  return (
    <>
      {/* Edit Subscription Modal - contains form for editing subscription data */}
      <EditModal
        isOpen={editModalOpen}
        onClose={onCloseEditModal}
        title="Edit Subscription"
        onSave={onSaveSubscription}
        saving={saving}
      >
        <SubscriptionForm
          formData={editFormData}
          onFormDataChange={onFormDataChange}
          statusOptions={statusOptions}
        />
      </EditModal>

      {/* Delete Confirmation Modal - confirms deletion with warning */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={onCloseDeleteModal}
        title={`Delete ${deleteItemType}`}
        itemName={deleteItemName || "Unknown Item"}
        itemType={deleteItemType}
        onConfirm={onConfirmDelete}
        deleting={deleting}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast?.isVisible || false}
        onClose={onCloseToast}
        message={toast?.message || ""}
        type={toast?.type || "success"}
        duration={4000}
        position="top-right"
      />
    </>
  );
};

export default SubscriptionsActions;
