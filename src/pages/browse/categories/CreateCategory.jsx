import { useState, useEffect } from "react";
import { Tag, Info, Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  CREATE_CATEGORY,
  GET_CATEGORY_BY_ID,
  UPDATE_CATEGORY_BY_ID,
} from "../../../contants/apiRoutes";
import { useCategories } from "../../../context/AllDataContext";
import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
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
  Status: "",
  CategoryDescription: "",
  ParentCategoryId: "",
  CreatedBy: "",
  UpdatedBy: "",
  Heading: "",
};

const CreateCategory = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = !!categoryId;

  const { data: aCategories = [], loading: bLoadingCategories } = useCategories();

  const [oFormData, setFormData] = useState(defaultFormData);
  const [oErrors, setErrors] = useState({});
  const [sImagePreview, setImagePreview] = useState(null);
  const [bSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await apiGet(`${GET_CATEGORY_BY_ID}/${categoryId}`, {}, token);
        if (data.STATUS === STATUS.SUCCESS.toUpperCase()) {
          const categoryData = data.data?.Data;
          if (categoryData) {
            setFormData({
              ...defaultFormData,
              ...categoryData,
              UpdatedBy: "",
            });
            setImagePreview(categoryData.CategoryImage || null);
          } else {
            setErrors((prev) => ({
              ...prev,
              api: t("PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR"),
            }));
          }
        } else {
          setErrors((prev) => ({ ...prev, api: data.MESSAGE || t("PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR") }));
        }
      } catch (err) {
        const errorMsg = err?.response?.data?.MESSAGE || t("PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR");
        setErrors((prev) => ({ ...prev, api: errorMsg }));
      }
    };

    if (isEditing && categoryId && !bLoadingCategories) {
      fetchCategoryDetails();
    }
  }, [categoryId, isEditing, bLoadingCategories, t]);

  useEffect(() => {
    return () => {
      if (sImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(sImagePreview);
      }
    };
  }, [sImagePreview]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (oErrors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

    setFormData((prev) => ({ ...prev, CategoryImage: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (sImagePreview?.startsWith("blob:")) URL.revokeObjectURL(sImagePreview);
    setFormData((prev) => ({ ...prev, CategoryImage: null }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, CategoryImage: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!oFormData.CategoryName.trim()) errors.CategoryName = t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_ERROR");
    if (!oFormData.Heading.trim()) errors.Heading = t("PRODUCT_SETUP.CREATE_CATEGORY.HEADING_REQUIRED");
    if (!isEditing && !oFormData.CategoryImage) errors.CategoryImage = t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_REQUIRED");

    const descLength = oFormData.CategoryDescription.trim().length;
    if (descLength < 10) errors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MIN_LENGTH");
    if (descLength > 500) errors.CategoryDescription = t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MAX_LENGTH");

    if (!oFormData.Status) errors.Status = t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_INVALID");

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const dataToSend = new FormData();

    Object.entries(oFormData).forEach(([key, value]) => {
      if (key === "CategoryImage" && value) {
        dataToSend.append("UploadCategoryImages", value);
      } else {
        dataToSend.append(key, value ?? "");
      }
    });

    dataToSend.append(isEditing ? "UpdatedBy" : "CreatedBy", localStorage.getItem("userId"));

    try {
      const token = localStorage.getItem("token");
      const oResponse = isEditing
        ? await apiPut(`${UPDATE_CATEGORY_BY_ID}/${categoryId}`, dataToSend, token, true)
        : await apiPost(CREATE_CATEGORY, dataToSend, token, true);

      if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.MESSAGE, STATUS.SUCCESS, 3000, () => {
          navigate("/browse", { state: { fromCategoryEdit: true } });
        });
      } else {
        showEmsg(oResponse.data.MESSAGE, STATUS.WARNING);
        setErrors((prev) => ({ ...prev, api: oResponse.data.MESSAGE }));
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {bSubmitting && <div className="global-loader-overlay"><Loader /></div>}
      {isEditing && <ToastContainer />}
      <div className="flex items-center mb-6">
        <BackButton onClick={() => navigate("/browse", { state: { fromCategoryEdit: true } })} />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.CREATE_CATEGORY.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_TITLE")}
        </h2>
      </div>

      {/* Inputs and Selects */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:space-x-4">
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
          <TextInputWithIcon
            label={t("COMMON.HEADING_LABEL") || t("COMMON.TITLE")}
            id="Heading"
            name="Heading"
            value={oFormData.Heading}
            onChange={handleInputChange}
            placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.HEADING_PLACE")}
            error={oErrors.Heading}
            Icon={Info}
          />
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4">
          <SelectWithIcon
            label={t("PRODUCT_SETUP.CREATE_CATEGORY.PARENT_LABEL")}
            id="ParentCategoryId"
            name="ParentCategoryId"
            value={oFormData.ParentCategoryId}
            onChange={handleInputChange}
            options={aCategories.map((cat) => ({
              value: cat.CategoryID,
              label: cat.CategoryName,
            }))}
            loading={bLoadingCategories}
            placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.SELECT_PARENT")}
            Icon={Tag}
            onInputChange={(value) => categories.fetch({ searchText: value })}
          />
          <SelectWithIcon
            label={t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_LABEL")}
            id="Status"
            name="Status"
            value={oFormData.Status}
            onChange={handleInputChange}
            options={[
              { value: "Active", label: t("COMMON.ACTIVE") },
              { value: "Inactive", label: t("COMMON.INACTIVE") },
            ]}
            Icon={Tag}
            error={oErrors.Status}
          />
        </div>

        {/* Image Upload */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_LABEL")}
            </label>
            <div className={`relative group rounded-xl border-2 ${oErrors.CategoryImage ? "border-red-300" : "border-gray-200"} border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}>
              <div className="p-6 space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                    <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                  </div>
                </div>
                <div className="flex text-sm text-muted justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7]">
                    <span>{t("COMMON.UPLOAD")}</span>
                    <input id="file-upload" name="CategoryImage" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                  </label>
                  <p className="pl-1">{t("COMMON.DRAG_DROP_TEXT")}</p>
                </div>
                {sImagePreview && (
                  <div className="mt-4 flex justify-center relative">
                    <img src={sImagePreview} alt="Category Preview" className="max-h-32 max-w-full rounded-md border border-gray-200 shadow" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-3 -right-3 p-1.5 bg-white border border-gray-300 text-gray-600 rounded-full shadow hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200 z-10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {oErrors.CategoryImage && (
                  <p className="text-sm text-red flex items-center justify-center">
                    <span className="mr-1">⚠️</span>{oErrors.CategoryImage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              name="CategoryDescription"
              value={oFormData.CategoryDescription}
              onChange={handleInputChange}
              placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_PLACEHOLDER")}
              icon={Info}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" className="btn-cancel" onClick={() => navigate("/browse", { state: { fromCategoryEdit: true } })}>
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? t("COMMON.SAVE_BUTTON") : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_BUTTON")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
