import { useAuth } from "@/context";
import { DataTable, StatusBadge } from "@/components";
import { Actions } from "@/components/buttons";
import { getSubscriptionStatus } from "@/components/utils";
import SubscriptionsActions from "./SubscriptionsActions";

/**
 * UI Component for Subscriptions page
 * Handles only the presentation of the subscriptions interface
 */
const SubscriptionsUI = ({
  subscriptions,
  loading,
  editModalOpen,
  deleteModalOpen,
  editFormData,
  saving,
  deleting,
  statusOptions,
  columns,
  onSaveSubscription,
  onCloseModal,
  onFormDataChange,
  onCloseDeleteModal,
  onConfirmDelete,
  onDeleteSuccess,
  onDeleteError,
  deleteItemName,
  toast,
  onCloseToast,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // QR Code modal props
  qrModalOpen,
  selectedUser,
  qrCodeValue,
  qrCodeImage,
  regeneratingQr,
  onRegenerateQrCode,
  onCloseQrModal,
}) => {
  // Get admin status from auth context
  const { isAdmin: _isAdmin } = useAuth();

  // Function to process columns and handle JSX rendering for specific column types
  const processedColumns = columns.map((column) => {
    if (column.render && typeof column.render === "function") {
      return {
        ...column,
        render: (value, row) => {
          const result = column.render(value, row);

          // Handle JSX rendering for specific column types
          if (result && typeof result === "object" && result.type) {
            switch (result.type) {
              case "memberId":
                // Display member ID with tooltip
                return <span title={result.title}>{result.value}</span>;
              case "status": {
                // Display subscription status badge
                const actualStatus = getSubscriptionStatus
                  ? getSubscriptionStatus(result.subscription)
                  : result.status;
                return <StatusBadge status={actualStatus} />;
              }
              case "qrCode":
                // Display QR code button
                return (
                  <button
                    onClick={() => result.onQrClick && result.onQrClick(result.subscription)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View QR
                  </button>
                );
              case "actions":
                // Display action buttons (edit/delete) for each row
                return (
                  <Actions
                    item={result.item}
                    onEdit={result.onEdit}
                    collectionName={result.collectionName}
                    itemNameField={result.itemNameField}
                    itemType={result.itemType}
                    editTitle={result.editTitle}
                    deleteTitle={result.deleteTitle}
                    onDeleteSuccess={onDeleteSuccess}
                    onDeleteError={onDeleteError}
                  />
                );
              default:
                return result;
            }
          }

          return result;
        },
      };
    }
    return column;
  });

  // Main render function - displays subscriptions page with table and modals
  return (
    <div className="h-full">
      {/* Data Table - displays subscriptions in table format */}
      <div className="mt-6">
        <DataTable
          columns={processedColumns}
          data={subscriptions}
          loading={loading}
          emptyMessage="No subscriptions found."
          className="h-full"
          pagination={{
            enabled: true,
            pageSize: pageSize,
            currentPage: currentPage,
            totalItems: subscriptions.length,
            showPageSizeSelector: true,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {/* Subscriptions Actions - contains edit and delete modals */}
      <SubscriptionsActions
        editModalOpen={editModalOpen}
        deleteModalOpen={deleteModalOpen}
        editFormData={editFormData}
        saving={saving}
        deleting={deleting}
        statusOptions={statusOptions}
        onSaveSubscription={onSaveSubscription}
        onCloseEditModal={onCloseModal}
        onCloseDeleteModal={onCloseDeleteModal}
        onConfirmDelete={onConfirmDelete}
        onFormDataChange={onFormDataChange}
        deleteItemName={deleteItemName}
        deleteItemType="subscription"
        toast={toast}
        onCloseToast={onCloseToast}
        qrModalOpen={qrModalOpen}
        selectedUser={selectedUser}
        qrCodeValue={qrCodeValue}
        qrCodeImage={qrCodeImage}
        regeneratingQr={regeneratingQr}
        onRegenerateQrCode={onRegenerateQrCode}
        onCloseQrModal={onCloseQrModal}
      />
    </div>
  );
};

export default SubscriptionsUI;