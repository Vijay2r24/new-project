import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Building, Info, Image, X, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import TextInputWithIcon from "../../../components/TextInputWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import Loader from "../../../components/Loader";
import SelectWithIcon from "../../../components/SelectWithIcon";
import ImageCropperModal from "../../../components/ImageCropperModal"; // Import the cropper modal

import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";
import {
  CREATE_BRAND,
  GET_BRAND_BY_ID,
  UPDATE_BRAND,
} from "../../../contants/apiRoutes";
import { STATUS, STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";

import { ToastContainer } from "react-toastify";

const CreateBrand = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: brandId } = useParams();

  const isEditing = Boolean(brandId);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);

  // Form state
  const [oFormData, setFormData] = useState({
    TenantID: localStorage.getItem("tenantID"),
    BrandName: "",
    BrandCode: "",
    IsActive: STATUS_VALUES.BOOLEAN_ACTIVE,
    BrandLogo: null,
    description: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
    existingLogo: null,
    existingLogoDocumentId: null,
  });

  // Error messages
  const [oErrors, setErrors] = useState({});
  // Preview URL for uploaded or existing logo
  const [sImagePreview, setImagePreview] = useState(null);
  // Submission loader
  const [bSubmitting, setSubmitting] = useState(false);
  // Cropper modal state
  const [bShowCropper, setShowCropper] = useState(false);
  const [oImageToCrop, setImageToCrop] = useState(null);

  /**
   * Fetch brand details if editing
   */
  useEffect(() => {
    if (isEditing && brandId) {
      const fetchBrandDetails = async () => {
        try {
          const res = await apiGet(`${GET_BRAND_BY_ID}/${brandId}`, {}, token);
          const brand = res?.data?.data;

          if (
            (res?.data?.STATUS === STATUS.SUCCESS.toUpperCase() ||
              res?.data?.status === STATUS.SUCCESS.toUpperCase()) &&
            brand
          ) {
            setFormData((prev) => ({
              ...prev,
              TenantID: brand.TenantID || localStorage.getItem("tenantID"),
              BrandName: brand.BrandName || "",
              BrandCode: brand.BrandCode || "",
              IsActive:
                brand.IsActive !== undefined
                  ? brand.IsActive
                  : brand.Status === "Active",
              BrandLogo: null,
              description: brand.BrandDescription || "",
              CreatedBy: brand.CreatedBy || t("COMMON.ADMIN"),
              UpdatedBy: t("COMMON.ADMIN"),
              existingLogo: brand.BrandLogo?.[0] || null,
              existingLogoDocumentId: brand.BrandLogo?.[0]?.documentId || null,
            }));

            if (brand.BrandLogo && brand.BrandLogo.length > 0) {
              setImagePreview(brand.BrandLogo[0].documentUrl);
            }
          }
        } catch (error) {
          console.error("Error fetching brand details:", error);
        }
      };
      fetchBrandDetails();
    }
  }, [brandId, isEditing, t, token]);

  /**
   * Cleanup blob URLs on unmount
   */
  useEffect(() => {
    return () => {
      if (
        sImagePreview &&
        typeof sImagePreview === "string" &&
        sImagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(sImagePreview);
      }
    };
  }, [sImagePreview]);

  /**
   * Generic form field change handler
   */
  const handleInputChange = ({ target: { name, value, type, checked } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (oErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * File upload handler - opens cropper instead of directly setting
   */
  const handleFileChange = ({ target: { files } }) => {
    const file = files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        BrandLogo: t("PRODUCT_SETUP.CREATE_BRAND.IMAGE_ERROR"),
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        BrandLogo: t("PRODUCT_SETUP.CREATE_BRAND.IMAGE_TYPE_ERROR"),
      }));
      return;
    }

    // Create object URL and open cropper
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropper(true);
  };

  /**
   * Handle crop completion
   */
  const handleCropComplete = (croppedBlob) => {
    if (!croppedBlob) {
      setShowCropper(false);
      return;
    }

    // Create preview URL from cropped blob
    const croppedImageUrl = URL.createObjectURL(croppedBlob);
    
    // Create a File object from the blob for form submission
    const croppedFile = new File([croppedBlob], `brand-logo-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    // Update form data with cropped image
    setFormData((prev) => ({
      ...prev,
      BrandLogo: croppedFile,
      existingLogo: null, // Clear existing logo when new file is uploaded
    }));

    // Set preview
    setImagePreview(croppedImageUrl);
    
    // Clear any existing errors
    setErrors((prev) => ({ ...prev, BrandLogo: "" }));
    
    // Close cropper
    setShowCropper(false);
    
    // Clean up the original image URL
    if (oImageToCrop) {
      URL.revokeObjectURL(oImageToCrop);
      setImageToCrop(null);
    }
  };

  /**
   * Handle crop cancellation
   */
  const handleCropCancel = () => {
    setShowCropper(false);
    
    // Clean up the image URL
    if (oImageToCrop) {
      URL.revokeObjectURL(oImageToCrop);
      setImageToCrop(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Remove uploaded or existing logo
   */
  const handleRemoveImage = () => {
    if (
      sImagePreview &&
      typeof sImagePreview === "string" &&
      sImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(sImagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      BrandLogo: null,
      existingLogo: null,
    }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, BrandLogo: "" }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Client-side form validation
   */
  const validateForm = () => {
    const errors = {};
    const { BrandName, BrandCode } = oFormData;

    if (!BrandName.trim())
      errors.BrandName = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_NAME_REQUIRED");
    if (!BrandCode.trim())
      errors.BrandCode = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_CODE_REQUIRED");
    if (!sImagePreview && !isEditing)
      errors.BrandLogo = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_LOGO_REQUIRED");

    return errors;
  };

  /**
   * Submit handler (Create/Update brand)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    const dataToSend = new FormData();
    const documentMetadata = [];

    // Handle logo upload / update / removal
    if (oFormData.BrandLogo) {
      // New image uploaded (cropped)
      documentMetadata.push({
        image: "brand_image",
        sortOrder: 1,
        ...(isEditing && oFormData.existingLogoDocumentId && {
          DocumentID: oFormData.existingLogoDocumentId,
        }),
      });
    } else if (isEditing && !sImagePreview && oFormData.existingLogoDocumentId) {
      // Editing and image removed - send remove action with documentId
      documentMetadata.push({
        action: "remove",
        DocumentID: oFormData.existingLogoDocumentId,
      });
    } else if (isEditing && sImagePreview && !oFormData.BrandLogo && oFormData.existingLogoDocumentId) {
      // Editing but keeping existing image - don't include documentMetadata at all
    }

    // Construct payload depending on Create or Edit mode
    let jsonPayload;
    if (isEditing) {
      jsonPayload = {
        BrandID: brandId,
        TenantID: oFormData.TenantID,
        BrandName: oFormData.BrandName,
        BrandCode: oFormData.BrandCode,
        IsActive: oFormData.IsActive,
        BrandDescription: oFormData.description,
        ...(documentMetadata.length > 0 && { documentMetadata }),
        UpdatedBy: userId,
      };
    } else {
      jsonPayload = {
        TenantID: oFormData.TenantID,
        BrandName: oFormData.BrandName,
        BrandCode: oFormData.BrandCode,
        IsActive: oFormData.IsActive,
        BrandDescription: oFormData.description,
        ...(documentMetadata.length > 0 && { documentMetadata }),
        CreatedBy: userId,
      };
    }

    // Attach payload & files to FormData
    dataToSend.append("data", JSON.stringify(jsonPayload));
    if (oFormData.BrandLogo) {
      dataToSend.append("brand_image", oFormData.BrandLogo);
    }

    try {
      let response;

      if (isEditing) {
        response = await apiPut(
          UPDATE_BRAND,
          dataToSend,
          token,
          true
        );
      } else {
        response = await apiPost(
          CREATE_BRAND,
          dataToSend,
          token,
          true
        );
      }

      const responseStatus = response.data.STATUS || response.data.status;
      const responseMessage = response.data.MESSAGE || response.data.message;

      if (
        responseStatus === STATUS.SUCCESS.toUpperCase() ||
        responseStatus === STATUS.SUCCESS
      ) {
        showEmsg(responseMessage, STATUS.SUCCESS, 3000, () =>
          navigate("/browse", { state: { fromBrandEdit: true } })
        );
      } else {
        showEmsg(responseMessage, STATUS.WARNING);
        setErrors((prev) => ({ ...prev, api: responseMessage }));
      }
    } catch (err) {
      console.error("API Error:", err);
      const message =
        err?.response?.data?.MESSAGE ||
        err?.response?.data?.message ||
        t("COMMON.API_ERROR");
      showEmsg(message, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Prepare status options
  const statusOptions = STATUS_OPTIONS.filter(option => option.value !== STATUS_VALUES.ALL)
    .map(option => ({
      value: option.value.toString(),
      label: t(option.labelKey)
    }));

  // Show loader overlay while submitting
  const loaderOverlay = bSubmitting && (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {loaderOverlay}
      {isEditing && <ToastContainer />}
      
      {/* Image Cropper Modal */}
      {bShowCropper && (
        <ImageCropperModal
          image={oImageToCrop}
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
          aspectRatio={1} // Square aspect ratio for brand logos
          minWidth={200}
          minHeight={200}
          title={t("PRODUCT_SETUP.CREATE_BRAND.CROP_TITLE")}
          cancelText={t("COMMON.CANCEL")}
          saveText={t("COMMON.CROP_IMAGE")}
        />
      )}

      <div className="w-full p-0 sm:p-0">
        {/* Page Header */}
        <div className="flex items-center mb-4">
          <button
            onClick={() =>
              navigate("/browse", { state: { fromBrandEdit: true } })
            }
            className="mr-3 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing
              ? t("PRODUCT_SETUP.CREATE_BRAND.EDIT_TITLE")
              : t("PRODUCT_SETUP.CREATE_BRAND.CREATE_TITLE")}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name + Brand Code */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <TextInputWithIcon
                label={t("PRODUCT_SETUP.CREATE_BRAND.NAME_LABEL")}
                id="BrandName"
                name="BrandName"
                value={oFormData.BrandName}
                onChange={handleInputChange}
                placeholder={t("PRODUCT_SETUP.CREATE_BRAND.NAME_PLACEHOLDER")}
                error={oErrors.BrandName}
                Icon={Building}
              />
            </div>
            <div className="w-full md:w-1/2">
              <TextInputWithIcon
                label={t("PRODUCT_SETUP.CREATE_BRAND.BRAND_CODE_LABEL")}
                id="BrandCode"
                name="BrandCode"
                value={oFormData.BrandCode}
                onChange={handleInputChange}
                placeholder={t(
                  "PRODUCT_SETUP.CREATE_BRAND.BRAND_CODE_PLACEHOLDER"
                )}
                error={oErrors.BrandCode}
                Icon={Tag}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <SelectWithIcon
                label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
                id="IsActive"
                name="IsActive"
                value={oFormData.IsActive.toString()}
                onChange={(e) =>
                  handleInputChange({
                    target: {
                      name: "IsActive",
                      value: e.target.value === "true",
                    },
                  })
                }
                options={statusOptions}
                Icon={Tag}
                error={oErrors.IsActive}
              />
            </div>
          </div>

          {/* Logo Upload + Description in one row */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            {/* Logo Upload */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("PRODUCT_SETUP.CREATE_BRAND.LOGO_LABEL")}
              </label>
              <div
                className={`relative group rounded-xl border-2 ${
                  oErrors.BrandLogo ? "border-red-300" : "border-gray-200"
                } border-dashed transition-all duration-200 hover:border-[#5B45E0] bg-gray-50 hover:bg-gray-50/50`}
              >
                <div className="p-6">
                  <div className="space-y-3 text-center">
                    {/* Upload Icon - Only show when no image */}
                    {!sImagePreview && (
                      <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                          <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                        </div>
                      </div>
                    )}

                    {/* Upload input area */}
                    <div className="flex flex-col items-center gap-2">
                      {!sImagePreview ? (
                        <>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] underline"
                            >
                              <span>{t("COMMON.UPLOAD")}</span>
                              <input
                                id="file-upload"
                                ref={fileInputRef}
                                name="BrandLogo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">{t("COMMON.DRAG_DROP_TEXT")}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                        </>
                      ) : (
                        <>
                          {/* Image preview with better styling */}
                          <div className="relative">
                            <img
                              src={sImagePreview}
                              alt="Brand Logo Preview"
                              className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 bg-white p-2 shadow-sm mx-auto"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Click the X to remove or upload a different image
                          </p>
                        </>
                      )}
                    </div>

                    {/* Logo errors */}
                    {oErrors.BrandLogo && (
                      <p className="text-sm text-red-600 flex items-center justify-center mt-2">
                        <span className="mr-1">⚠️</span>
                        {oErrors.BrandLogo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="w-full md:w-1/2">
              <TextAreaWithIcon
                label={t("COMMON.DESCRIPTION")}
                name="description"
                value={oFormData.description}
                onChange={handleInputChange}
                placeholder={t(
                  "PRODUCT_SETUP.CREATE_BRAND.DESCRIPTION_PLACEHOLDER"
                )}
                icon={Info}
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                navigate("/browse", { state: { fromBrandEdit: true } })
              }
              className="btn-cancel"
            >
              {t("COMMON.CANCEL")}
            </button>
            <button type="submit" className="btn-primary">
              {isEditing
                ? t("COMMON.SAVE_BUTTON")
                : t("PRODUCT_SETUP.CREATE_BRAND.CREATE_BUTTON")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrand;