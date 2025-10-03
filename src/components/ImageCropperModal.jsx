import { useRef, useEffect, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import PropTypes from "prop-types";

const ImageCropperModal = ({
  image,
  onCropComplete,
  onClose,
  aspectRatio,
  minWidth,
  minHeight,
  title,
  cancelText = "Cancel",
  saveText = "Ok",
  context,
}) => {
  const cropperRef = useRef(null);
  const [processing, setProcessing] = useState(false); // Prevent multiple crops

  const imageSrc = Array.isArray(image) ? image[0] : image;
  const resolvedContext =
    context !== undefined ? context : Array.isArray(image) ? image[1] : undefined;

  const handleCrop = async () => {
    if (processing) return; // Prevent duplicates

    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return;
    }

    setProcessing(true);
    try {
      const canvas = cropper.getCroppedCanvas({
        width: minWidth,
        height: minHeight,
      });
      if (canvas) {
        canvas.toBlob(
          (blob) => {
            if (blob && !processing) { // Double-check to avoid stale calls
              onCropComplete(blob, resolvedContext);
            }
          },
          "image/jpeg",
          0.9 // Add quality for better compression
        );
      }
    } catch (error) {
      console.error("Crop error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Improved cleanup: Destroy cropper instance properly
  useEffect(() => {
    return () => {
      if (cropperRef.current?.cropper) {
        cropperRef.current.cropper.destroy();
        cropperRef.current.cropper = null;
      }
      cropperRef.current = null;
    };
  }, []);

  // Reset processing when modal opens (optional, for safety)
  useEffect(() => {
    setProcessing(false);
  }, [imageSrc]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-4" style={{ height: "400px" }}>
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            style={{ height: "100%", width: "100%" }}
            initialAspectRatio={aspectRatio}
            aspectRatio={aspectRatio}
            guides={true}
            viewMode={1}
            minCropBoxWidth={minWidth}
            minCropBoxHeight={minHeight}
            responsive={true}
            autoCropArea={0.8} // Slightly lower to avoid aggressive initial crop
            checkOrientation={false}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={processing}
            className="px-4 py-2 bg-custom-bg text-white rounded-md hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : saveText}
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes remain the same
ImageCropperModal.propTypes = {
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  aspectRatio: PropTypes.number.isRequired,
  minWidth: PropTypes.number.isRequired,
  minHeight: PropTypes.number.isRequired,
  title: PropTypes.string,
  cancelText: PropTypes.string,
  saveText: PropTypes.string,
  context: PropTypes.any,
};

export default ImageCropperModal;