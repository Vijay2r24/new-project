import { useState, useEffect } from "react";
import { Tag, Info, Image, X } from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useParams, useNavigate } from "react-router-dom";
import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
import {
  CREATE_CATEGORY,
  GET_CATEGORY_BY_ID,
  UPDATE_CATEGORY_BY_ID,
} from "../../../contants/apiRoutes";
import { useCategories } from "../../../context/AllDataContext";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import BackButton from "../../../components/BackButton";
import { ToastContainer } from "react-toastify";

const CreateCategory = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEditing = !!categoryId;
  const categories = useCategories();
  const aCategories = categories.data || [];
  const bLoadingCategories = categories.loading;
  const sErrorCategories = categories.error;

  const [oFormData, setFormData] = useState({
    TenantID: localStorage.getItem("tenantID"),
    CategoryName: "",
    CategoryImage: null,
    Status: "Active",
    CategoryDescription: "",
    ParentCategoryId: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
    Heading: "",
  });

  const [oErrors, setErrors] = useState({});
  const [sImagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    if (isEditing && categoryId && !bLoadingCategories) {
      const fetchCategoryDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const oResponse = await apiGet(
            `${GET_CATEGORY_BY_ID}/${categoryId}`,
            {},
            token
          );

          if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
            if (oResponse.data.MESSAGE) {
              setErrors((prev) => ({ ...prev, api: oResponse.data.MESSAGE }));
            }

            if (oResponse.data.data && oResponse.data.data.Data) {
              const categoryData = oResponse.data.data.Data;
              setFormData((prev) => ({
                ...prev,
                TenantID: categoryData.TenantID,
                CategoryName: categoryData.CategoryName || "",
                CategoryImage: categoryData.CategoryImage || null,
                Status: categoryData.Status || "Active",
                CategoryDescription: categoryData.CategoryDescription || "",
                ParentCategoryId: categoryData.ParentCategoryId || "",
                CreatedBy: categoryData.CreatedBy || "Admin",
                UpdatedBy: "Admin",
                Heading: categoryData.Heading || "",
              }));
              if (categoryData.CategoryImage) {
                setImagePreview(categoryData.CategoryImage);
              }
            } else {
              setErrors((prev) => ({
                ...prev,
                api: t("PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR"),
              }));
            }
          } else {
            if (oResponse.data.MESSAGE) {
              setErrors((prev) => ({ ...prev, api: oResponse.data.MESSAGE }));
            } else {
              setErrors((prev) => ({
                ...prev,
                api: t("PRODUCT_SETUP.CREATE_CATEGORY.UNKNOWN_ERROR"),
              }));
            }
          }
        } catch (err) {
          let errorMsg = t("PRODUCT_SETUP.CREATE_CATEGORY.UNEXPECTED_ERROR");
          if (err.response && err.response.data && err.response.data.MESSAGE) {
            errorMsg = err.response.data.MESSAGE;
          }
          setErrors((prev) => ({ ...prev, api: errorMsg }));
        }
      };
      fetchCategoryDetails();
    }
  }, [categoryId, isEditing, bLoadingCategories, t]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (oErrors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          CategoryImage: t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_ERROR"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        CategoryImage: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, CategoryImage: null }));
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    if (sImagePreview && sImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(sImagePreview);
    }
    setFormData((prev) => ({ ...prev, CategoryImage: null }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, CategoryImage: "" }));
  };

  useEffect(() => {
    return () => {
      if (sImagePreview && sImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(sImagePreview);
      }
    };
  }, [sImagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oFormData.CategoryName.trim()) {
      newErrors.CategoryName = t("PRODUCT_SETUP.CREATE_CATEGORY.NAME_ERROR");
    }
    if (!oFormData.Heading.trim()) {
      newErrors.Heading = t("PRODUCT_SETUP.CREATE_CATEGORY.HEADING_REQUIRED");
    }
    if (!oFormData.CategoryImage && !isEditing) {
      newErrors.CategoryImage = t(
        "PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_REQUIRED"
      );
    }

    if (oFormData.CategoryDescription.trim().length < 10) {
      newErrors.CategoryDescription = t(
        "PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MIN_LENGTH"
      );
    }
    if (oFormData.CategoryDescription.trim().length > 500) {
      newErrors.CategoryDescription = t(
        "PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_MAX_LENGTH"
      );
    }

    if (!oFormData.Status) {
      newErrors.Status = t("PRODUCT_SETUP.CREATE_CATEGORY.STATUS_INVALID");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("TenantID", oFormData.TenantID);
    dataToSend.append("CategoryName", oFormData.CategoryName);
    dataToSend.append("Status", oFormData.Status);
    dataToSend.append("CategoryDescription", oFormData.CategoryDescription);
    dataToSend.append("Heading", oFormData.Heading);

    // ✅ Always send ParentCategoryId, even if empty
    dataToSend.append("ParentCategoryId", oFormData.ParentCategoryId || "");

    dataToSend.append("UpdatedBy", oFormData.UpdatedBy);

    if (oFormData.CategoryImage) {
      if (Array.isArray(oFormData.CategoryImage)) {
        oFormData.CategoryImage.forEach((file) => {
          dataToSend.append("UploadCategoryImages", file);
        });
      } else {
        dataToSend.append("UploadCategoryImages", oFormData.CategoryImage);
      }
    }

    try {
      const token = localStorage.getItem("token");
      let oResponse;
      if (isEditing) {
        oResponse = await apiPut(
          `${UPDATE_CATEGORY_BY_ID}/${categoryId}`,
          dataToSend,
          token,
          true
        );
      } else {
        oResponse = await apiPost(CREATE_CATEGORY, dataToSend, token, true);
      }

      if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data.MESSAGE, STATUS.SUCCESS);
      } else {
        showEmsg(oResponse.data.MESSAGE, STATUS.WARNING);
        setErrors((prev) => ({
          ...prev,
          api: oResponse.data.MESSAGE,
        }));
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {isEditing && <ToastContainer />}
      <div className="flex items-center mb-6">
        <BackButton
          onClick={() =>
            navigate("/browse", { state: { fromCategoryEdit: true } })
          }
        />
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing
            ? t("PRODUCT_SETUP.CREATE_CATEGORY.EDIT_TITLE")
            : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_TITLE")}
        </h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
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
          <div className="w-full md:w-1/2">
            <TextInputWithIcon
              label={t("COMMON.HEADING_LABEL") || t("COMMON.TITLE")}
              id="Heading"
              name="Heading"
              value={oFormData.Heading}
              onChange={handleInputChange}
              placeholder={
                t("PRODUCT_SETUP.CREATE_CATEGORY.HEADING_PLACE") ||
                "Enter heading for the category"
              }
              error={oErrors.Heading}
              Icon={Info}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
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
          </div>
          <div className="w-full md:w-1/2">
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
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("PRODUCT_SETUP.CREATE_CATEGORY.IMAGE_LABEL")}
            </label>
            <div
              className={`relative group rounded-xl border-2 ${
                oErrors.CategoryImage ? "border-red-300" : "border-gray-200"
              } border-dashed transition-all duration-200 hover:border-custom-bg bg-gray-50 hover:bg-gray-50/50`}
            >
              <div className="p-6">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                      <Image className="h-8 w-8 text-gray-400 group-hover:text-[#5B45E0] transition-colors duration-200" />
                    </div>
                  </div>
                  <div className="flex text-sm text-muted justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-[#5B45E0] hover:text-[#4c39c7] focus-within:outline-none"
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
                        title="Remove image"
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
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <TextAreaWithIcon
              label={t("COMMON.DESCRIPTION")}
              name="CategoryDescription"
              value={oFormData.CategoryDescription}
              onChange={handleInputChange}
              placeholder={t(
                "PRODUCT_SETUP.CREATE_CATEGORY.DESCRIPTION_PLACEHOLDER"
              )}
              icon={Info}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              navigate("/browse", {
                state: { fromCategoryEdit: true },
              })
            }
            className="btn-cancel"
          >
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary" onClick={handleSubmit}>
            {isEditing
              ? t("COMMON.SAVE_BUTTON")
              : t("PRODUCT_SETUP.CREATE_CATEGORY.CREATE_BUTTON")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
