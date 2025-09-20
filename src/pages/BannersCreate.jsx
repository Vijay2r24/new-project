import { useState, useEffect, useCallback } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, Layers, Percent } from "lucide-react";
import { toast } from "react-toastify";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import BackButton from "../components/BackButton";
import ImageCropperModal from "../components/ImageCropperModal";
import { useTitle } from "../context/TitleContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource } from "../store/slices/allDataSlice";
import { apiPost, apiGet } from "../utils/ApiUtils";
import { CREATE_UPDATE_BANNERS, GET_BANNERS_BY_ID } from "../contants/apiRoutes";
import { STATUS,DEFAULT_PAGE,BANNER_WIDTH,BANNER_HEIGHT } from "../contants/constants";
import { ToastContainer } from "react-toastify";
import Loader from "../components/Loader";

const BannerForm = () => {
  const { t } = useTranslation();
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();
  const { bannerId } = useParams();
  const dispatch = useDispatch();

  // Redux selectors for categories and brands
  const categories = useSelector(
    (state) => state.allData.resources.categories?.data || []
  );
  const brands = useSelector(
    (state) => state.allData.resources.brands?.data || []
  );

  const [formData, setFormData] = useState({
    BannerName: "",
    preview: "",
    file: null,
    category: [],
    brand: [],
    discount: "",
    price: "",
    isActive: true,
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [croppingImage, setCroppingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingImageData, setExistingImageData] = useState(null);

  const fetchBanner = useCallback(async () => {
    if (!bannerId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await apiGet(`${GET_BANNERS_BY_ID}/${bannerId}`, {}, token);

      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        const bannerData = response.data.data;
        const firstImage = bannerData.BannerImage?.[0] || {};

        setFormData({
          BannerName: bannerData.BannerName || "",
          preview: firstImage.documentUrl || "",
          category: bannerData.CategoryIDs || [],
          brand: bannerData.BrandIDs || [],
          discount: bannerData.Discount || "",
          price: bannerData.Price?.toString() || "",
          file: null,
          isActive: bannerData.IsActive !== undefined ? bannerData.IsActive : true,
        });

        setExistingImageData(firstImage);
        setError(null);
      } else {
        setError(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (error) {
      setError(error?.response?.data?.message || t("COMMON.API_ERROR"));
    }
  }, [bannerId, t]);

  useEffect(() => {
    setTitle(
      bannerId ? t("BANNER_FORM.EDIT_BANNER") : t("BANNER_FORM.UPLOAD_BANNER")
    );
    setBackButton(<BackButton onClick={() => navigate("/banners")} />);
    
    if (bannerId) {
      fetchBanner();
    }

    // Fetch categories and brands
    dispatch(fetchResource({ key: "categories" }));
    dispatch(fetchResource({ key: "brands" }));

    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, navigate, bannerId, fetchBanner, dispatch]);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match("image.*")) {
      toast.error(t("BANNER_FORM.INVALID_IMAGE_TYPE"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < BANNER_WIDTH || img.height < BANNER_HEIGHT) {
          toast.error(
            t("BANNER_FORM.IMAGE_DIMENSIONS_TOO_SMALL", {
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
            })
          );
          return;
        }
        setCroppingImage(reader.result);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob) => {
    const croppedFile = new File([blob], `cropped-image-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        preview: reader.result,
        file: croppedFile,
      }));
      setCroppingImage(null);
    };
    reader.readAsDataURL(blob);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.BannerName) {
      errors.BannerName = t("BANNER_FORM.BANNER_NAME") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }

    if (!formData.preview) {
      errors.preview = t("BANNER_FORM.CHOOSE_IMAGE") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }


    if (!formData.category || formData.category.length === 0) {
      errors.category = t("COMMON.CATEGORY") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }

    if (!formData.brand || formData.brand.length === 0) {
      errors.brand = t("COMMON.BRAND") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }
    if (!formData.discount) {
      errors.discount = t("BANNER_FORM.DISCOUNT_PERCENTAGE") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }

    if (!formData.price) {
      errors.price = t("COMMON.PRICE") + " " + t("COMMON.REQUIRED");
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("token");
    const data = new FormData();

    const mainData = {
      TenantID: localStorage.getItem("tenantID") || "1",
      BannerName: formData.BannerName,
      IsActive: formData.isActive,
      CategoryIDs: formData.category || [],
      BrandIDs: formData.brand || [],
      Discount: formData.discount,
      SortOrder: DEFAULT_PAGE,
      Price: parseFloat(formData.price) || 0,
      CreatedBy: localStorage.getItem("userId") || "admin",
    };

    if (bannerId) {
      mainData.BannerID = bannerId;
      mainData.UpdatedBy = localStorage.getItem("userId") || "admin";
    }
  
    //  Add document metadata only if new image is uploaded
    if (formData.file) {
      mainData.documentMetadata = [
        {
          image: "image_0",
          sortOrder: parseInt(formData.sequence) || 1,
          ...(bannerId && existingImageData?.documentId
            ? { DocumentID: existingImageData.documentId } // keep DocumentID if updating existing image
            : {}),
        },
      ];
    }
  
    data.append("data", JSON.stringify(mainData));
  
    //  Append file only if user selected a new one
    if (formData.file) {
      data.append("image_0", formData.file);
    }

    try {
      const response = await apiPost(CREATE_UPDATE_BANNERS, data, token, true);
  
      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        toast.success(response?.data?.message || t("BANNER_FORM.SAVE_SUCCESS"));
        setTimeout(() => navigate("/banners"), 2000);
      } else {
        toast.error(response?.data?.message || t("COMMON.API_ERROR"));
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        t("COMMON.API_ERROR");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <ToastContainer />

      {croppingImage && (
        <ImageCropperModal
          key={croppingImage}
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            if (croppingImage?.startsWith("blob:")) {
              URL.revokeObjectURL(croppingImage);
            }
            setCroppingImage(null);
          }}
          aspectRatio={BANNER_WIDTH / BANNER_HEIGHT}
          minWidth={BANNER_WIDTH}
          minHeight={BANNER_HEIGHT}
          title={t("COMMON.CROP_IMAGE")}
          cancelText={t("COMMON.CANCEL")}
          saveText={t("COMMON.OK")}
        />
      )}

      <form onSubmit={handleSubmit}>
        <TextInputWithIcon
          label={t("BANNER_FORM.BANNER_NAME")}
          id="bannerName"
          name="BannerName"
          value={formData.BannerName}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, BannerName: e.target.value }));
            setValidationErrors((prev) => ({ ...prev, BannerName: undefined }));
          }}
          placeholder={t("BANNER_FORM.ENTER_BANNER_NAME")}
          Icon={Tag}
          error={validationErrors.BannerName}
        />

        <div className="flex flex-col space-y-4 mt-4">
          <label className="font-semibold text-sm">
            {t("BANNER_FORM.UPLOAD_BANNERS_LABEL")}
          </label>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border p-4 rounded-md">
            <div className="relative w-40 h-40 group overflow-hidden border rounded-md flex-shrink-0">
              {formData.preview ? (
                <>
                  <img
                    src={formData.preview}
                    alt={t("BANNER_FORM.UPLOAD_BANNER")}
                    className="object-contain w-full h-full"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-red-200"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        file: null,
                        preview: "",
                      }));
                    }}
                  >
                    <MdOutlineCancel className="h-4 w-4" />
                  </button>
                  <label
                    htmlFor="bannerUpload"
                    className="absolute bottom-1 left-1 bg-white/80 rounded-full p-1 text-custom-bg hover:bg-gray-200 cursor-pointer"
                    style={{ fontSize: 12 }}
                  >
                    <FiUpload className="h-4 w-4 inline" />
                    <input
                      id="bannerUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                  </label>
                </>
              ) : (
                <label
                  htmlFor="bannerUpload"
                  className="flex items-center justify-center w-full h-full bg-gray-200 cursor-pointer"
                >
                  <FiUpload size={30} className="text-gray-400 mr-2" />
                  <span className="text-gray-700 text-sm">
                    {t("BANNER_FORM.CHOOSE_IMAGE")}
                  </span>
                  <input
                    id="bannerUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </label>
              )}
            </div>

            {formData.preview && (
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectWithIcon
                  label={t("PRODUCT_CREATION.CATEGORY_ID")}
                  id="category"
                  name="category"
                  value={formData.category || []}
                  onChange={(e) => {
                    const selectedValues = Array.isArray(e.target.value)
                      ? e.target.value
                      : [e.target.value].filter(Boolean);
                    setFormData((prev) => ({
                      ...prev,
                      category: selectedValues,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      category: undefined,
                    }));
                  }}
                  options={categories.map((cat) => ({
                    value: cat.CategoryID,
                    label: cat.CategoryName,
                  }))}
                  Icon={Layers}
                  onInputChange={(value) =>
                    dispatch(
                      fetchResource({
                        key: "categories",
                        params: value && value.trim() !== "" ? { searchText: value } : {},
                      })
                    )
                  }
                  error={validationErrors.category}
                  multiple
                  placeholder={t("PRODUCT_CREATION.CATEGORY_ID_PLACEHOLDER")}
                />

                <SelectWithIcon
                  label={t("COMMON.BRAND")}
                  id="brand"
                  name="brand"
                  value={formData.brand || []}
                  onChange={(e) => {
                    const selectedValues = Array.isArray(e.target.value)
                      ? e.target.value
                      : [e.target.value].filter(Boolean);
                    setFormData((prev) => ({
                      ...prev,
                      brand: selectedValues,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      brand: undefined,
                    }));
                  }}
                  options={brands.map((b) => ({
                    value: b.BrandID,
                    label: b.BrandName,
                  }))}
                  Icon={Tag}
                  onInputChange={(value) =>
                    dispatch(
                      fetchResource({
                        key: "brands",
                        params: value && value.trim() !== "" ? { searchText: value } : {},
                      })
                    )
                  }
                  error={validationErrors.brand}
                  multiple
                  placeholder={t("PRODUCT_CREATION.BRAND_ID_PLACEHOLDER")}
                />

                <TextInputWithIcon
                  label={t("BANNER_FORM.DISCOUNT_PERCENTAGE")}
                  id="discount"
                  name="discount"
                  value={formData.discount || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      discount: undefined,
                    }));
                  }}
                  placeholder={t("BANNER_FORM.ENTER_DISCOUNT_PERCENTAGE")}
                  Icon={Percent}
                  error={validationErrors.discount}
                />

                <TextInputWithIcon
                  label={t("COMMON.PRICE")}
                  id="price"
                  name="price"
                  value={formData.price || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      price: undefined,
                    }));
                  }}
                  placeholder={t("BANNER_FORM.ENTER_PRICE")}
                  Icon={() => (
                    <span className="text-lg font-bold text-gray-400" style={{ fontFamily: "inherit" }}>
                      ₹
                    </span>
                  )}
                  error={validationErrors.price}
                />

                <SelectWithIcon
                  label={t("COMMON.STATUS")}
                  id="isActive"
                  name="isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      isActive: undefined,
                    }));
                  }}
                  options={[
                    { value: "true", label: t("COMMON.ACTIVE") },
                    { value: "false", label: t("COMMON.INACTIVE") },
                  ]}
                  Icon={Tag}
                  error={validationErrors.isActive}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {t("COMMON.SUBMIT")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/banners")}
            className="btn-cancel ml-4"
          >
            {t("COMMON.CANCEL")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;