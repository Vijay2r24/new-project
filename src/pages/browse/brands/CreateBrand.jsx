import { useState, useEffect } from "react";
import { ArrowLeft, Building, Info, Image, X, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import TextInputWithIcon from "../../../components/TextInputWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import Loader from "../../../components/Loader";
import SelectWithIcon from "../../../components/SelectWithIcon";

import { apiPost, apiGet } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";
import {
  CREATE_OR_UPDATE_BRAND,
  GET_BRAND_BY_ID,
} from "../../../contants/apiRoutes";
import { STATUS, STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";

import { ToastContainer } from "react-toastify";

const CreateBrand = () => {
  const { t } = useTranslation(); // i18n translation hook
  const navigate = useNavigate(); // navigation hook
  const { id: brandId } = useParams(); // get brandId from route params

  const isEditing = Boolean(brandId); // check if editing or creating
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Form state to hold brand details
  const [oFormData, setFormData] = useState({
    TenantID: localStorage.getItem("tenantID"),
    BrandName: "",
    BrandCode: "",
    IsActive: STATUS_VALUES.BOOLEAN_ACTIVE,
    BrandLogo: null,
    description: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
    existingLogo: null, // Track existing logo when editing
  });

  // Error messages for validation
  const [oErrors, setErrors] = useState({});
  // Preview URL for uploaded or existing logo
  const [sImagePreview, setImagePreview] = useState(null);
  // Submission loader
  const [bSubmitting, setSubmitting] = useState(false);

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
            // Populate form with existing brand data
            setFormData((prev) => ({
              ...prev,
              TenantID: brand.TenantID || localStorage.getItem("tenantID"),
              BrandName: brand.BrandName || "",
              BrandCode: brand.BrandCode || "",
              IsActive:
                brand.IsActive !== undefined
                  ? brand.IsActive
                  : brand.Status === "Active",
              BrandLogo: null, // reset (file is handled separately)
              description: brand.BrandDescription || "",
              CreatedBy: brand.CreatedBy || t("COMMON.ADMIN"),
              UpdatedBy: t("COMMON.ADMIN"),
              existingLogo: brand.BrandLogo?.[0] || null, // store first logo if exists
            }));

            // Set logo preview
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
   * File upload handler (for logo)
   */
  const handleFileChange = ({ target: { files } }) => {
    const file = files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, BrandLogo: null }));
      setImagePreview(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        BrandLogo: t("PRODUCT_SETUP.CREATE_BRAND.IMAGE_ERROR"),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, BrandLogo: file }));
    setImagePreview(URL.createObjectURL(file));
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
      existingLogo: null, // clear reference if editing
    }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, BrandLogo: "" }));
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
      documentMetadata.push({
        image: "brand_image",
        sortOrder: 1,
        ...(isEditing &&
          oFormData.existingLogo && {
            documentId: oFormData.existingLogo.documentId,
          }),
      });
    } else if (isEditing && !sImagePreview) {
      // If editing and removing the existing logo
      documentMetadata.push({
        action: "remove",
        documentId: oFormData.existingLogo?.documentId,
      });
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
        documentMetadata,
        UpdatedBy: userId,
      };
    } else {
      jsonPayload = {
        TenantID: oFormData.TenantID,
        BrandName: oFormData.BrandName,
        BrandCode: oFormData.BrandCode,
        IsActive: oFormData.IsActive,
        BrandDescription: oFormData.description,
        documentMetadata,
        CreatedBy: userId,
      };
    }

    // Attach payload & files to FormData
    dataToSend.append("data", JSON.stringify(jsonPayload));
    if (oFormData.BrandLogo) {
      dataToSend.append("brand_image", oFormData.BrandLogo);
    }

    try {
      // API call
      const response = await apiPost(
        CREATE_OR_UPDATE_BRAND,
        dataToSend,
        token,
        true // multipart/form-data
      );

      const responseStatus = response.data.STATUS || response.data.status;
      const responseMessage = response.data.MESSAGE || response.data.message;

      if (
        responseStatus === STATUS.SUCCESS.toUpperCase() ||
        responseStatus === STATUS.SUCCESS
      ) {
        // Success notification + redirect
        showEmsg(responseMessage, STATUS.SUCCESS, 3000, () =>
          navigate("/browse", { state: { fromBrandEdit: true } })
        );
      } else {
        // Warning / validation error
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
      // Hide loader with delay
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Prepare status options using STATUS_OPTIONS from constants (filter out ALL option)
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

          {/* Logo Upload */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("PRODUCT_SETUP.CREATE_BRAND.LOGO_LABEL")}
            </label>
            <div
              className={`relative group rounded-xl border-2 ${
                oErrors.BrandLogo ? "border-red-300" : "border-gray-200"
              } border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}
            >
              <div className="p-6">
                <div className="space-y-3 text-center">
                  {/* Upload Icon */}
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                      <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                    </div>
                  </div>

                  {/* Upload input */}
                  <div className="flex text-sm text-muted justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7]"
                    >
                      <span>{t("COMMON.UPLOAD")}</span>
                      <input
                        id="file-upload"
                        name="BrandLogo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">{t("COMMON.DRAG_DROP_TEXT")}</p>
                  </div>

                  {/* Image preview */}
                  {sImagePreview && (
                    <div className="mt-4 flex justify-center relative">
                      <img
                        src={sImagePreview}
                        alt="Brand Logo Preview"
                        className="max-h-32 max-w-full rounded-md border border-gray-200 shadow"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-3 -right-3 p-1.5 bg-white border border-gray-300 text-gray-600 rounded-full shadow hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200 z-10"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Logo errors */}
                  {oErrors.BrandLogo && (
                    <p className="text-sm text-red flex items-center justify-center">
                      <span className="mr-1">⚠️</span>
                      {oErrors.BrandLogo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="w-full">
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
