import { useState, useEffect } from "react";
import { Tag, Info, Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource, clearResourceError } from "../../../store/slices/allDataSlice";
import {
  GET_CATEGORY_BY_ID,
  CREATE_OR_URDATE_CATEGORY,
} from "../../../contants/apiRoutes";
import { apiPost, apiGet } from "../../../utils/ApiUtils";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import BackButton from "../../../components/BackButton";
import { ToastContainer } from "react-toastify";
import Loader from "../../../components/Loader";

const defaultFormData = {
  TenantID: localStorage.getItem("tenantID"),
  CategoryName: "",
  CategoryImage: null,
  CategoryDescription: "",
  ParentCategoryID: "",
  IsActive: true,
  CreatedBy: "",
  UpdatedBy: "",
  existingImage: null,
};

const CreateCategory = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isEditing = !!categoryId;

  const [oFormData, setFormData] = useState(defaultFormData);
  const [oErrors, setErrors] = useState({});
  const [sImagePreview, setImagePreview] = useState(null);
  const [bSubmitting, setSubmitting] = useState(false);

  // Redux state for categories
  const categoriesState = useSelector((state) => state.allData.resources.categories);
  const aCategories = categoriesState?.data || [];
  const bLoadingCategories = categoriesState?.loading || false;
  const categoriesError = categoriesState?.error;

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchResource({ key: "categories", params: {} }));
  }, [dispatch]);

  // Cleanup errors on unmount
  useEffect(() => {
    return () => {
      if (categoriesError) {
        dispatch(clearResourceError("categories"));
      }
      if (sImagePreview && typeof sImagePreview === "string" && sImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(sImagePreview);
      }
    };
  }, [categoriesError, sImagePreview, dispatch]);

  // Fetch category by ID (for edit)
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setSubmitting(true);
        const token = localStorage.getItem("token");
        const { data } = await apiGet(`${GET_CATEGORY_BY_ID}/${categoryId}`, {}, token);

        if (data.status === STATUS.SUCCESS.toUpperCase()) {
          const categoryData = data.data;

          if (categoryData) {
            setFormData({
              ...defaultFormData,
              ...categoryData,
              CategoryImage: null, // reset upload
              IsActive:
                categoryData.IsActive !== undefined
                  ? categoryData.IsActive
                  : categoryData.Status?.toLowerCase() === "active",
              UpdatedBy: "",
            });

            // Handle image from documentMetadata if it exists
            if (categoryData.documentMetadata && categoryData.documentMetadata.length > 0) {
              setFormData(prev => ({
                ...prev,
                existingImage: categoryData.documentMetadata[0]
              }));
              setImagePreview(categoryData.documentMetadata[0].documentUrl);
            } else if (categoryData.CategoryImages?.length > 0) {
              setFormData(prev => ({
                ...prev,
                existingImage: categoryData.CategoryImages[0]
              }));
              setImagePreview(categoryData.CategoryImages[0].documentUrl);
            }
          }
        }
      } catch (err) {
        const errorMsg =
          err?.response?.data?.message || t("PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR");
        setErrors((prev) => ({ ...prev, api: errorMsg }));
      } finally {
        hideLoaderWithDelay(setSubmitting);
      }
    };

    if (isEditing && categoryId) {
      fetchCategoryDetails();
    }
  }, [categoryId, isEditing, t]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (oErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        CategoryImage: t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_ERROR"),
      }));
      return;
    }

    // Clear image error when valid file is selected
    setErrors((prev) => ({ ...prev, CategoryImage: "" }));
    setFormData((prev) => ({ ...prev, CategoryImage: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (sImagePreview && typeof sImagePreview === "string" && sImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(sImagePreview);
    }
    setFormData((prev) => ({ 
      ...prev, 
      CategoryImage: null,
      existingImage: null
    }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, CategoryImage: "" }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Category Name validation
    if (!oFormData.CategoryName?.trim()) {
      errors.CategoryName = t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_ERROR") || "Category name is required";
    }

    // Category Description validation
    const descLength = oFormData.CategoryDescription?.trim().length || 0;
    if (descLength < 10 && descLength > 0) {
      errors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MIN_LENGTH") || "Description must be at least 10 characters long";
    } else if (descLength === 0) {
      // Make description optional for now, but show warning if empty
      // errors.CategoryDescription = "Description is recommended";
    }
    if (descLength > 500) {
      errors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MAX_LENGTH") || "Description cannot exceed 500 characters";
    }

    console.log("Validation Errors:", errors); // Debug log

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    const newErrors = validateForm();
    
    console.log("Form Data:", oFormData); // Debug log
    console.log("Validation Errors:", newErrors); // Debug log
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Setting errors to state:", newErrors); // Debug log
      return;
    }

    setSubmitting(true);
    const dataToSend = new FormData();
    const documentMetadata = [];

    // Add image to documentMetadata if exists
    if (oFormData.CategoryImage) {
      documentMetadata.push({ 
        image: "category1", 
        sortOrder: 1,
        ...(isEditing && oFormData.existingImage && { documentId: oFormData.existingImage.documentId })
      });
    } else if (isEditing && !sImagePreview && oFormData.existingImage) {
      documentMetadata.push({ 
        action: "remove",
        documentId: oFormData.existingImage.documentId 
      });
    }

    // Prepare the JSON payload
    const jsonPayload = {
      CategoryID: isEditing ? categoryId : undefined,
      TenantID: oFormData.TenantID,
      CategoryName: oFormData.CategoryName,
      CategoryDescription: oFormData.CategoryDescription,
      IsActive: oFormData.IsActive,
      ParentCategoryID: oFormData.ParentCategoryID || undefined,
      documentMetadata,
      CreatedBy: isEditing ? undefined : localStorage.getItem("userId"),
      UpdatedBy: isEditing ? localStorage.getItem("userId") : undefined,
    };

    // Append the JSON payload
    dataToSend.append("data", JSON.stringify(jsonPayload));

    // Append the image file if exists
    if (oFormData.CategoryImage) {
      dataToSend.append("category1", oFormData.CategoryImage);
    }

    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiPost(
        CREATE_OR_URDATE_CATEGORY,
        dataToSend,
        token,
        true // multipart/form-data
      );

      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.message, STATUS.SUCCESS, 3000, () => {
          navigate("/browse", { state: { fromCategoryEdit: true } });
        });
      } else {
        showEmsg(oResponse.data.message, STATUS.WARNING);
        setErrors((prev) => ({ ...prev, api: oResponse.data.message }));
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  // Filter categories to only include parent categories (ParentCategoryID is null)
  const parentCategories = [
    {
      value: "",
      label: t("PRODUCT_SETUP.CREATE_CATEGORY.SELECT_PARENT"),
    },
    ...aCategories
      .filter((cat) => cat.ParentCategoryID === null || cat.ParentCategoryID === undefined)
      .map((cat) => ({
        value: cat.CategoryID,
        label: cat.CategoryName,
      })),
  ];

  // Helper function to render error messages
  const renderErrorMessage = (error) => {
    if (!error) return null;
    return (
      <div className="mt-1">
        <p className="text-red-600 text-sm flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      </div>
    );
  };

  // Helper function to render form field with error
  const renderFormField = (fieldName, fieldComponent, error = null) => (
    <div className="flex-1">
      {fieldComponent}
      {renderErrorMessage(error)}
    </div>
  );

  return (
    <div className="w-full min-h-screen">
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate("/browse", { state: { fromCategoryEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.CREATE_CATEGORY.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_TITLE")}
        </h2>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Category Name and Status Row */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
         <div className="flex-1">
            <TextInputWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_LABEL")}
              id="CategoryName"
              name="CategoryName"
              value={oFormData.CategoryName}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_PLACEHOLDER")}
              error={oErrors.CategoryName}
              Icon={Tag}
            />
         </div>
          
          <div className="flex-1">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_LABEL")}
              id="IsActive"
              name="IsActive"
              value={String(oFormData.IsActive)}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, IsActive: e.target.value === "true" }))
              }
              options={[
                { value: "true", label: t("COMMON.ACTIVE") },
                { value: "false", label: t("COMMON.INACTIVE") },
              ]}
              Icon={Tag}
            />
          </div>
        </div>

        {/* Parent Category Row */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <SelectWithIcon
              label={t("PRODUCT_SETUP.CREATE_CATEGORY.PARENT_LABEL")}
              id="ParentCategoryID"
              name="ParentCategoryID"
              value={oFormData.ParentCategoryID}
              onChange={handleInputChange}
              options={parentCategories}
              loading={bLoadingCategories}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.SELECT_PARENT")}
              Icon={Tag}
            />
          </div>
        </div>

        {/* Image Upload and Description Row */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          {/* Image Upload */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_LABEL")}
            </label>
            <div
              className={`relative group rounded-xl border-2 ${
                oErrors.CategoryImage ? "border-red-300" : "border-gray-200"
              } border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}
            >
              <div className="p-6 space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                    <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                  </div>
                </div>
                <div className="flex text-sm text-muted justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7]"
                  >
                    <span>{t("COMMON.UPLOAD")}</span>
                    <input
                      id="file-upload"
                      name="CategoryImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">{t("COMMON.DRAG_DROP_TEXT")}</p>
                </div>
                {sImagePreview && (
                  <div className="mt-4 flex justify-center relative">
                    <img
                      src={sImagePreview}
                      alt="Category Preview"
                      className="max-h-32 max-w-full rounded-md border border-gray-200 shadow"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-3 -right-3 p-1.5 bg-white border border-gray-300 text-gray-600 rounded-full shadow hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200 z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {oErrors.CategoryImage && (
                  <p className="text-sm text-red flex items-center justify-center">
                    <span className="mr-1">⚠️</span>
                    {oErrors.CategoryImage}
                  </p>
                )}
              </div>
            </div>
            {renderErrorMessage(oErrors.CategoryImage)}
          </div>

          {/* Description */}
          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              name="CategoryDescription"
              value={oFormData.CategoryDescription}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_PLACEHOLDER")}
              error={oErrors.CategoryDescription}
              icon={Info}
              className={oErrors.CategoryDescription ? "border-red-300 focus:border-red-500" : ""}
              rows={4}
            />
            {renderErrorMessage(oErrors.CategoryDescription)}
          </div>
        </div>

        {/* API Error Display */}
        {oErrors.api && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-600">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {oErrors.api}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/browse", { state: { fromCategoryEdit: true } })}
            disabled={bSubmitting}
          >
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary" disabled={bSubmitting}>
            {bSubmitting ? t("COMMON.LOADING") : (isEditing ? t("COMMON.SAVE_BUTTON") : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_BUTTON"))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;