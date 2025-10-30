import { FaTimes, FaQrcode } from "react-icons/fa";

/**
 * QR Code Modal Component
 * Displays a user's QR code with options to regenerate
 */
const QRCodeModal = ({
  isOpen,
  onClose,
  selectedUser,
  qrCodeImage,
  qrCodeValue,
  regeneratingQr,
  onRegenerateQrCode,
}) => {
  // Don't render anything if modal is not open
  if (!isOpen || !selectedUser) return null;

  // Main render function - displays QR code modal
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-w-[95vw] flex flex-col max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaQrcode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                QR Code
              </h2>
              <p className="text-sm text-gray-600">
                {selectedUser.displayName || selectedUser.name || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
          >
            <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          {qrCodeImage ? (
            <div className="space-y-4">
              {/* QR Code Image */}
              <div className="flex justify-center bg-gray-50 rounded-lg p-6">
                <img
                  src={qrCodeImage}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>

              {/* QR Code Value */}
              {qrCodeValue && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    QR Code Value:
                  </p>
                  <p className="text-sm text-blue-900 font-mono break-all">
                    {qrCodeValue}
                  </p>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  This QR code is used for attendance check-in and check-out. 
                  Scan it using the QR scanner in the system.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading QR code...</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 mb-1 sm:mb-0 sm:px-6 md:px-7 pt-4 sm:pt-5 pb-4 sm:pb-6 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            {/* Close Button */}
            <button
              onClick={regeneratingQr || !qrCodeImage ? undefined : onClose}
              disabled={regeneratingQr || !qrCodeImage}
              className="px-6 py-3 !text-sm font-medium rounded-xl border border-gray-300 bg-white text-primary hover:bg-gray-50 hover:border-primary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              Close
            </button>

            {/* Regenerate Button */}
            <button
              onClick={regeneratingQr || !qrCodeImage ? undefined : onRegenerateQrCode}
              disabled={regeneratingQr || !qrCodeImage}
              className="px-6 py-3 !text-sm font-medium rounded-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center gap-2"
            >
              {regeneratingQr ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Regenerating...
                </>
              ) : (
                <>
                  <FaQrcode className="w-4 h-4" />
                  Regenerate QR Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

