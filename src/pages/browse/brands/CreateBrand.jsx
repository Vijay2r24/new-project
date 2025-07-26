import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building,
  Info,
  Tag,
  Hash,
  LayoutList,
  Image,
  X,
} from "lucide-react";
import TextInputWithIcon from "../../../components/TextInputWithIcon";
import SelectWithIcon from "../../../components/SelectWithIcon";
import TextAreaWithIcon from "../../../components/TextAreaWithIcon";
import { useTranslation } from "react-i18next";
import { apiPost, apiGet, apiPut } from "../../../utils/ApiUtils";
import {
  CREATE_BRAND,
  GET_BRAND_BY_ID,
  UPDATE_BRAND_BY_ID,
} from "../../../contants/apiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories } from "../../../context/AllDataContext";
import { showEmsg } from "../../../utils/ShowEmsg";
import { STATUS } from "../../../contants/constants";
import { ToastContainer } from "react-toastify";
import Loader from "../../../components/Loader";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";
const CreateBrand = () => {
  const [oFormData, setFormData] = useState({
    TenantID: localStorage.getItem("tenantID"),
    BrandName: "",
    CategoryID: "",
    Heading: "",
    BrandCode: "",
    IsActive: true,
    BrandLogo: null,
    description: "",
    CreatedBy: "Admin",
    UpdatedBy: "Admin",
  });

  const [oErrors, setErrors] = useState({});
  const [sImagePreview, setImagePreview] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: brandId } = useParams();
  const [bSubmitting, setSubmitting] = useState(false);
  const isEditing = !!brandId;
  const categories = useCategories();
  const aCategories = categories.data || [];
  const bLoadingCategories = categories.loading;
  const sErrorCategories = categories.error;

  useEffect(() => {
    if (isEditing && brandId && !bLoadingCategories) {
      const fetchBrandDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const oResponse = await apiGet(
            `${GET_BRAND_BY_ID}/${brandId}`,
            {},
            token
          );
          if (
            oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase() &&
            oResponse.data.data
          ) {
            const brandData = oResponse.data.data.brand;
            setFormData((prev) => ({
              ...prev,
              TenantID: brandData.TenantID || localStorage.getItem("tenantID"),
              BrandName: brandData.BrandName || "",
              CategoryID: brandData.CategoryID || "",
              Heading: brandData.Heading || "",
              BrandCode: brandData.BrandCode || "",
              IsActive: brandData.Status,
              BrandLogo: brandData.BrandLogo || null,
              description: brandData.BrandDescription || "",
              CreatedBy: brandData.CreatedBy || t("COMMON.ADMIN"),
              UpdatedBy: t("COMMON.ADMIN"),
            }));
            if (brandData.BrandLogo) {
              setImagePreview(brandData.BrandLogo);
            }
          } else {
          }
        } catch (err) {}
      };
      fetchBrandDetails();
    }
  }, [brandId, isEditing, bLoadingCategories]);

  useEffect(() => {
    categories.fetchAll();
  }, []);

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
          BrandLogo: t("PRODUCT_SETUP.CREATE_BRAND.IMAGE_ERROR"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        BrandLogo: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, BrandLogo: null }));
      setImagePreview(null);
    }
  };
  const handleRemoveImage = () => {
    if (sImagePreview && sImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(sImagePreview);
    }
    setFormData((prev) => ({ ...prev, BrandLogo: null }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, BrandLogo: "" }));
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

    if (!oFormData.BrandName.trim()) {
      newErrors.BrandName = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_NAME_REQUIRED");
    }
    if (!oFormData.CategoryID) {
      newErrors.CategoryID = t("PRODUCT_SETUP.CREATE_BRAND.CATEGORY_REQUIRED");
    }
    if (!oFormData.Heading.trim()) {
      newErrors.Heading = t("PRODUCT_SETUP.CREATE_BRAND.HEADING_REQUIRED");
    }
    if (!oFormData.BrandCode.trim()) {
      newErrors.BrandCode = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_CODE_REQUIRED");
    }
    if (!oFormData.BrandLogo && !isEditing) {
      newErrors.BrandLogo = t("PRODUCT_SETUP.CREATE_BRAND.BRAND_LOGO_REQUIRED");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append("BrandName", oFormData.BrandName);
    dataToSend.append("CategoryID", oFormData.CategoryID);
    dataToSend.append("Heading", oFormData.Heading);
    dataToSend.append("BrandCode", oFormData.BrandCode);
    dataToSend.append("IsActive", oFormData.IsActive);
    dataToSend.append("BrandDescription", oFormData.description);

    if (oFormData.BrandLogo) {
      dataToSend.append("BrandLogo", oFormData.BrandLogo);
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      let response;
      if (isEditing) {
        dataToSend.append("UpdatedBy", userId);
        response = await apiPut(
          `${UPDATE_BRAND_BY_ID}/${brandId}`,
          dataToSend,
          token,
          true
        );
      } else {
        dataToSend.append("TenantID", oFormData.TenantID);
        dataToSend.append("CreatedBy", userId);
        response = await apiPost(CREATE_BRAND, dataToSend, token, true);
      }

      if (response.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS, 3000, async () => {
          navigate("/browse", { state: { fromBrandEdit: true } });
        });
      } else {
        showEmsg(response.data.MESSAGE, STATUS.WARNING);
        setErrors((prev) => ({
          ...prev,
          api: response.data.MESSAGE,
        }));
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {loaderOverlay}
      {isEditing && <ToastContainer />}
      <div className="w-full p-0 sm:p-0">
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <SelectWithIcon
                label={t("PRODUCT_SETUP.CREATE_CATEGORY.PARENT_LABEL")}
                id="CategoryID"
                name="CategoryID"
                value={oFormData.CategoryID}
                onChange={handleInputChange}
                options={aCategories.map((cat) => ({
                  value: cat.CategoryID,
                  label: cat.CategoryName,
                }))}
                loading={bLoadingCategories}
                error={oErrors.CategoryID || sErrorCategories}
                placeholder={t("PRODUCT_SETUP.CREATE_CATEGORY.SELECT_PARENT")}
                Icon={Tag}
                onInputChange={(value) =>
                  categories.fetch({ searchText: value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <TextInputWithIcon
                label={t("COMMON.HEADING_LABEL")}
                id="Heading"
                name="Heading"
                value={oFormData.Heading}
                onChange={handleInputChange}
                placeholder={t(
                  "PRODUCT_SETUP.CREATE_BRAND.HEADING_PLACEHOLDER"
                )}
                error={oErrors.Heading}
                Icon={LayoutList}
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
                Icon={Hash}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <SelectWithIcon
                label={t("PRODUCT_SETUP.CREATE_BRAND.STATUS_LABEL")}
                id="IsActive"
                name="IsActive"
                value={oFormData.IsActive}
                onChange={handleInputChange}
                options={[
                  { value: "Active", label: t("COMMON.ACTIVE") },
                  { value: "Inactive", label: t("COMMON.INACTIVE") },
                ]}
                Icon={Tag}
                error={oErrors.IsActive}
              />
            </div>
            <div className="w-full md:w-1/2">
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
                          name="BrandLogo"
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
          </div>
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
