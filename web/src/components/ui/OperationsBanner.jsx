import React from "react";

/**
 * OperationsBanner Component
 * Displays ongoing operations in a fixed bottom-right position
 * @param {Object} props - Component props
 * @param {Map} props.ongoingOperations - Map of ongoing operations
 * @param {Function} props.onCancelOperation - Function to cancel an operation
 */
const OperationsBanner = ({ ongoingOperations, onCancelOperation }) => {
  if (!ongoingOperations || ongoingOperations.size === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm sm:max-w-md lg:max-w-lg">
      {Array.from(ongoingOperations.values()).map((operation, index) => {
        const operationId = Array.from(ongoingOperations.keys())[index];
        const isAdd = operation.type === "add";
        const _isEdit = operation.type === "edit";

        return (
          <div
            key={operationId}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 w-full"
          >
            <div className="flex items-start justify-between">
              {/* Left side - Icon and content */}
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                {/* Icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary/20 flex-shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-primary">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1 min-w-0">
                      {isAdd ? "Adding" : "Editing"} "{operation.itemName}"
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      In Progress
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 sm:mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className="h-1.5 sm:h-2 rounded-full animate-pulse bg-primary"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {isAdd ? "Uploading to server..." : "Saving changes..."}
                  </p>
                </div>
              </div>

              {/* Right side - Cancel button */}
              <button
                onClick={() => onCancelOperation(operationId)}
                className="ml-2 sm:ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Cancel operation"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationsBanner;
