import { useAuth } from "@/context";
import { DataTable } from "@/components";
import { SubscriptionStatusBadge } from "@/components/subscription";
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
  deleteItemName,
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
              case "status":
                // Display subscription status badge
                return (
                  <SubscriptionStatusBadge
                    status={result.status}
                    subscription={result.subscription}
                    getSubscriptionStatus={getSubscriptionStatus}
                  />
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
                    onDeleteSuccess={result.onDeleteSuccess}
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
      />
    </div>
  );
};

export default SubscriptionsUI;
