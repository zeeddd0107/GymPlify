import React, { useState } from "react";

/**
 * Image component with skeleton loading state
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS classes for the image container
 * @param {React.Component} props.fallbackIcon - Fallback icon component when no image
 * @param {string} props.fallbackBgColor - Background color for fallback icon
 * @param {string} props.fallbackIconColor - Color for fallback icon
 * @param {string} props.skeletonClassName - CSS classes for skeleton
 */
const ImageWithSkeleton = ({
  src,
  alt = "Image",
  className = "w-10 h-10 rounded-lg object-cover",
  fallbackIcon: FallbackIcon = null,
  fallbackBgColor = "#4A70FF",
  fallbackIconColor = "text-white",
  skeletonClassName = "w-10 h-10 rounded-lg",
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // If no src, show fallback icon
  if (!src) {
    if (FallbackIcon) {
      return (
        <div
          className={`${skeletonClassName} flex items-center justify-center`}
          style={{ backgroundColor: fallbackBgColor }}
        >
          <FallbackIcon className={`${fallbackIconColor} text-lg`} />
        </div>
      );
    }
    return (
      <div
        className={`${skeletonClassName} bg-gray-200 flex items-center justify-center`}
      >
        <div className="w-6 h-6 bg-gray-400 rounded"></div>
      </div>
    );
  }

  // If there's an error, show fallback icon
  if (imageError) {
    if (FallbackIcon) {
      return (
        <div
          className={`${skeletonClassName} flex items-center justify-center`}
          style={{ backgroundColor: fallbackBgColor }}
        >
          <FallbackIcon className={`${fallbackIconColor} text-lg`} />
        </div>
      );
    }
    return (
      <div
        className={`${skeletonClassName} bg-gray-200 flex items-center justify-center`}
      >
        <div className="w-6 h-6 bg-gray-400 rounded"></div>
      </div>
    );
  }

  // Show image with skeleton overlay while loading
  return (
    <div className="relative">
      {/* Always render the image to trigger onLoad */}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: imageLoading ? 0 : 1 }}
      />

      {/* Show skeleton overlay while loading */}
      {imageLoading && (
        <div
          className={`absolute inset-0 ${skeletonClassName} bg-gray-200 animate-pulse flex items-center justify-center`}
        >
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      )}
    </div>
  );
};

export default ImageWithSkeleton;
