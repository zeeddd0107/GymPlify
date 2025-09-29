import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

/**
 * Reusable FormFileUpload Component
 * @param {Object} props - Component props
 * @param {string} props.id - HTML id attribute for the file input
 * @param {string} props.accept - File types to accept (e.g., "image/*", ".pdf")
 * @param {Function} props.onChange - Function called when file selection changes
 * @param {string} props.placeholder - Placeholder text for the upload button
 * @param {boolean} props.disabled - Whether the upload is disabled
 * @param {boolean} props.required - Whether the upload is required
 * @param {string} props.className - Additional CSS classes
 * @param {File} props.selectedFile - Currently selected file
 * @param {string} props.existingFile - Existing file path/name to show
 * @param {string} props.uploadText - Text to show when no file is selected
 * @param {string} props.replaceText - Text to show when replacing existing file
 * @param {string} props.icon - Custom icon (defaults to faUpload)
 * @param {boolean} props.uploading - Whether upload is in progress
 * @param {...Object} otherProps - Other props to pass to input element
 */
const FormFileUpload = ({
  id,
  accept = "image/*",
  onChange,
  disabled = false,
  required = false,
  className = "",
  selectedFile,
  existingFile,
  uploadText = "Upload File",
  replaceText = "Upload New File",
  icon = faUpload,
  uploading = false,
  ...otherProps
}) => {
  const hasFile = selectedFile || existingFile;
  const displayText = hasFile ? replaceText : uploadText;
  const isDisabled = disabled || uploading;

  // Extract filename from URL or use the string as is
  const getDisplayFileName = (filePath) => {
    if (!filePath) return "";

    // If it's just a filename (no path separators), return as is
    if (!filePath.includes("/")) {
      return filePath;
    }

    // If it's a URL, try to extract the filename
    if (filePath.includes("/")) {
      // Extract filename from URL path
      const urlParts = filePath.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Remove query parameters if present
      const cleanFileName = fileName.split("?")[0];

      // Check if filename starts with timestamp pattern (numbers followed by underscore)
      // Pattern: 1758344951200_Smith Machine - Male.mp4
      const timestampPattern = /^\d+_(.+)$/;
      const match = cleanFileName.match(timestampPattern);

      if (match) {
        // Extract the original filename after the timestamp
        const originalFileName = match[1];
        try {
          return decodeURIComponent(originalFileName);
        } catch {
          return originalFileName;
        }
      }

      // If no timestamp pattern, decode URL encoding
      try {
        return decodeURIComponent(cleanFileName);
      } catch {
        return cleanFileName;
      }
    }

    // If it's not a URL, return as is
    return filePath;
  };

  return (
    <div className={`relative mb-2 ${className}`}>
      <input
        type="file"
        accept={accept}
        className="hidden"
        id={id}
        onChange={onChange}
        disabled={isDisabled}
        required={required}
        {...otherProps}
      />
      <label
        htmlFor={id}
        className={`
          flex items-center justify-left gap-2 w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 pl-4 pr-4 cursor-pointer hover:bg-slate-50
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        `.trim()}
      >
        <FontAwesomeIcon icon={icon} className="text-primary text-lg" />
        <span className="text-primary font-normal text-base">
          {uploading ? "Uploading..." : displayText}
        </span>
      </label>

      {selectedFile && (
        <div className="mt-3">
          <div className="text-sm">
            <span className="text-sm text-slate-500 italic">Selected:</span>{" "}
            <span className="text-sm text-slate-500 italic">
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>
        </div>
      )}

      {existingFile && !selectedFile && (
        <div className="mt-3">
          <div className="text-sm">
            <span className="text-sm text-slate-500 italic">Current:</span>{" "}
            <span className="text-sm text-slate-500 italic break-words whitespace-normal">
              {getDisplayFileName(existingFile)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormFileUpload;
