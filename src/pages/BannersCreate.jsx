import { useState, useEffect, useCallback } from "react";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { Tag, Layers, Users,Percent } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useBrands, useCategories } from "../context/AllDataContext";
import { apiPost, apiPut, apiGet } from "../utils/ApiUtils";
import {
  POST_BANNERS,
  UPDATE_BANNER,
  GET_BANNERS_BY_ID,
} from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { STATUS } from "../contants/constants";
import { ToastContainer } from "react-toastify";

const BannerForm = () => {
  const { t } = useTranslation();
  const { setTitle, setBackButton } = useTitle();
  const navigate = useNavigate();
  const { bannerId } = useParams();

  const [oFormData, setFormData] = useState({
    BannerName: "",
    banners: [],
  });
  const [bShowInputField, setShowInputField] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const { data: aCategories, fetch: fetchAllCategories } = useCategories();
  const { data: aBrands, fetch: fetchAllBrands } = useBrands();
  const [bLoading] = useState(false);

  const fetchBanner = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiGet(
        `${GET_BANNERS_BY_ID}/${bannerId}`,
        {},
        token
      );

      if (oResponse?.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        const bannerData = oResponse.data.data?.data;

        setFormData({
          BannerName: bannerData.BannerName || "",
          banners:
            bannerData.BannerImages?.map((image) => ({
              preview: image.BannerImage || "",
              sequence: image.Sequence?.toString() || "",
              category: image.CategoryIDs || "",
              brand: image.BrandIDs || "",
              gender: image.Gender || "",
              discount: image.Discount || "",
              price: image.Price?.toString() || "",
              file: null,
            })) || [],
        });

        setError(null);
      } else {
        setError(oResponse?.data?.MESSAGE);
      }
    } catch (error) {
      setError(error?.response?.data?.MESSAGE);
    }
  }, [bannerId]);

  useEffect(() => {
    setTitle(
      bannerId
        ? t("BANNER_FORM.EDIT_BANNER")
        : t("BANNER_FORM.UPLOAD_BANNER")
    );
    setBackButton(<BackButton onClick={() => navigate("/banners")} />);
    if (bannerId) {
      fetchBanner();
    }
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [
    setTitle,
    setBackButton,
    t,
    navigate,
    fetchAllCategories,
    fetchAllBrands,
    bannerId,
    fetchBanner,
  ]);

  useEffect(() => {
    fetchAllCategories();
    fetchAllBrands();
  }, []);
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          banners: [
            ...prev.banners,
            {
              preview: reader.result,
              sequence: "",
              file,
              BannerImage: file,
              Brand: "",
              Category: "",
              banners: [],
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const validateForm = () => {
    const errors = {};
    let firstErrorField = "";

    const addError = (field, message) => {
      if (!errors[field]) {
        errors[field] = message;
        if (!firstErrorField) firstErrorField = field;
      }
    };

    if (!oFormData.BannerName)
      addError("BannerName", t("BANNER_FORM.BANNER_NAME") + " " + t("COMMON.REQUIRED"));

    if (!oFormData.banners.length)
      addError("banners", t("BANNER_FORM.UPLOAD_BANNERS_LABEL") + " " + t("COMMON.REQUIRED"));

    oFormData.banners.forEach((banner, index) => {
      if (!banner.preview)
        addError(`banners_${index}_preview`, t("BANNER_FORM.CHOOSE_IMAGE") + " " + t("COMMON.REQUIRED"));
      if (!banner.sequence)
        addError(`banners_${index}_sequence`, t("BANNER_FORM.SEQUENCE_NUMBER") + " " + t("COMMON.REQUIRED"));
      if (!banner.category)
        addError(`banners_${index}_category`, t("COMMON.CATEGORY") + " " + t("COMMON.REQUIRED"));
      if (!banner.brand)
        addError(`banners_${index}_brand`, t("COMMON.BRAND") + " " + t("COMMON.REQUIRED"));
      if (!banner.gender)
        addError(`banners_${index}_gender`, t("COMMON.GENDER") + " " + t("COMMON.REQUIRED"));
      if (!banner.discount)
        addError(`banners_${index}_discount`, t("BANNER_FORM.DISCOUNT_PERCENTAGE") + " " + t("COMMON.REQUIRED"));
      if (!banner.price)
        addError(`banners_${index}_price`, t("COMMON.PRICE") + " " + t("COMMON.REQUIRED"));
    });

    setValidationErrors(errors);
    return firstErrorField;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstError = validateForm();
    if (firstError) {
      return;
    }

    const token = localStorage.getItem("token");
    const data = new FormData();

    const BannerDetails = oFormData.banners.map((banner, idx) => ({
      CategoryIDs: banner.category ? [banner.category] : [],
      BrandIDs: banner.brand ? [banner.brand] : [],
      Discount: banner.discount,
      Price: banner.price,
      Gender: banner.gender,
      BannerImages: [{ Sequence: banner.sequence }],
    }));

    const mainData = {
      TenantID: 1,
      BannerName: oFormData.BannerName,
      Status:"",
      CreatedBy: "admin",
      BannerDetails,
    };
    if (bannerId) {
      mainData.BannerID = bannerId;
    }

    data.append("Data", JSON.stringify(mainData));

    oFormData.banners.forEach((banner, idx) => {
      if (banner.file) {
        data.append(`images_${idx}`, banner.file);
      }
    });

    try {
      const oResponse = bannerId
        ? await apiPut(`${UPDATE_BANNER}/${bannerId}`, data, token, true)
        : await apiPost(POST_BANNERS, data, token, true);

      if (oResponse?.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse?.data?.MESSAGE, STATUS.SUCCESS, 3000, () => {
          navigate("/banners");
        });
      } else {
        showEmsg(oResponse?.data?.MESSAGE, STATUS.ERROR);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.data?.error ||
        error?.response?.data?.MESSAGE ||
        error?.message;

      showEmsg(errorMessage, STATUS.ERROR);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen">
      <ToastContainer />
      <div className="flex items-center gap-3 mb-4">
        <p className="mt-1 text-secondary">
          {t("BANNER_FORM.CREATE_BANNER_DESCRIPTION")}
        </p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <TextInputWithIcon
          label={t("BANNER_FORM.BANNER_NAME")}
          id="bannerName"
          name="BannerName"
          value={oFormData.BannerName}
          onChange={e => {
            setFormData(prev => ({ ...prev, BannerName: e.target.value }));
            setValidationErrors(prev => ({ ...prev, BannerName: undefined }));
          }}
          placeholder={t("BANNER_FORM.ENTER_BANNER_NAME")}
          Icon={Tag}
          error={validationErrors.BannerName}
        />
        <div className="flex flex-col space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-sm">
              {t("BANNER_FORM.UPLOAD_BANNERS_LABEL")}
            </label>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowInputField(true)}
            >
              <FaPlus aria-hidden="true" className="icon" />
              <span>{t("BANNER_FORM.ADD_BANNER_IMAGE")}</span>
            </button>
          </div>
          {oFormData.banners?.map((banner, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border p-4 rounded-md"
            >
              <div className="relative w-40 h-40 group overflow-hidden border rounded-md flex-shrink-0">
                {banner.preview ? (
                  <>
                    <img
                      src={banner.preview}
                      alt={`${t("BANNER_FORM.UPLOAD_BANNER")} ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-red-200"
                      onClick={() => {
                        setFormData(prev => {
                          const updatedBanners = [...prev.banners];
                          updatedBanners[index].file = null;
                          updatedBanners[index].preview = null;
                          return { ...prev, banners: updatedBanners };
                        });
                      }}
                    >
                      <MdOutlineCancel className="h-4 w-4" />
                    </button>
                    <label
                      htmlFor={`bannerUpload_${index}`}
                      className="absolute bottom-1 left-1 bg-white/80 rounded-full p-1 text-custom-bg hover:bg-gray-200 cursor-pointer"
                      style={{ fontSize: 12 }}
                    >
                      <FiUpload className="h-4 w-4 inline" />
                      <input
                        id={`bannerUpload_${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => {
                                const updatedBanners = [...prev.banners];
                                updatedBanners[index].file = file;
                                updatedBanners[index].preview = reader.result;
                                return { ...prev, banners: updatedBanners };
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </>
                ) : (
                  <label
                    htmlFor={`bannerUpload_${index}`}
                    className="flex items-center justify-center w-full h-full bg-gray-200 cursor-pointer"
                  >
                    <FiUpload size={30} className="text-gray-400 mr-2" />
                    <span className="text-gray-700 text-sm">{t('BANNER_FORM.CHOOSE_IMAGE')}</span>
                    <input
                      id={`bannerUpload_${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => {
                              const updatedBanners = [...prev.banners];
                              updatedBanners[index].file = file;
                              updatedBanners[index].preview = reader.result;
                              return { ...prev, banners: updatedBanners };
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {banner.preview && (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInputWithIcon
                    label={t("BANNER_FORM.SEQUENCE_NUMBER")}
                    id={`sequence_${index}`}
                    name="sequence"
                    value={banner.sequence}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].sequence = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_sequence`]: undefined }));
                    }}
                    placeholder={t("BANNER_FORM.ENTER_SEQUENCE_NUMBER")}
                    Icon={Layers}
                    error={validationErrors[`banners_${index}_sequence`]}
                  />
                  <SelectWithIcon
                    label={t("COMMON.CATEGORY")}
                    id={`category_${index}`}
                    name="category"
                    value={banner.category || ""}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].category = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_category`]: undefined }));
                    }}
                    options={aCategories.map((cat) => ({
                      value: cat.CategoryID,
                      label: cat.CategoryName,
                    }))}
                    Icon={Layers}
                    onInputChange={(value) =>
                      fetchAllCategories({ searchText: value })
                    }
                    error={validationErrors[`banners_${index}_category`]}
                  />
                  <SelectWithIcon
                    label={t("COMMON.BRAND")}
                    id={`brand_${index}`}
                    name="brand"
                    value={banner.brand || ""}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].brand = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_brand`]: undefined }));
                    }}
                    options={aBrands.map((b) => ({
                      value: b.BrandID,
                      label: b.BrandName,
                    }))}
                    Icon={Users}
                    onInputChange={(value) =>
                      fetchAllBrands({ searchText: value })
                    }
                    error={validationErrors[`banners_${index}_brand`]}
                  />
                  <SelectWithIcon
                    label={t("COMMON.GENDER")}
                    id={`gender_${index}`}
                    name="gender"
                    value={banner.gender || ""}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].gender = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_gender`]: undefined }));
                    }}
                    options={[
                      { value: "Male", label: t("PRODUCT_CREATION.MALE") },
                      { value: "Female", label: t("PRODUCT_CREATION.FEMALE") },
                      { value: "Unisex", label: t("PRODUCT_CREATION.UNISEX") },
                      { value: "Other", label: t("PRODUCT_CREATION.OTHER") },
                    ]}
                    Icon={Users}
                    error={validationErrors[`banners_${index}_gender`]}
                  />
                  <TextInputWithIcon
                    label={t("BANNER_FORM.DISCOUNT_PERCENTAGE")}
                    id={`discount_${index}`}
                    name="discount"
                    value={banner.discount || ""}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].discount = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_discount`]: undefined }));
                    }}
                    placeholder={t("BANNER_FORM.ENTER_DISCOUNT_PERCENTAGE")}
                    Icon={Percent}
                    error={validationErrors[`banners_${index}_discount`]}
                  />
                  <TextInputWithIcon
                    label={t("COMMON.PRICE")}
                    id={`price_${index}`}
                    name="price"
                    value={banner.price || ""}
                    onChange={e => {
                      setFormData(prev => {
                        const updatedBanners = [...prev.banners];
                        updatedBanners[index].price = e.target.value;
                        return { ...prev, banners: updatedBanners };
                      });
                      setValidationErrors(prev => ({ ...prev, [`banners_${index}_price`]: undefined }));
                    }}
                    placeholder={t("BANNER_FORM.ENTER_PRICE")}
                    Icon={() => <span className="text-lg font-bold text-gray-400" style={{ fontFamily: 'inherit' }}>₹</span>}
                    error={validationErrors[`banners_${index}_price`]}
                  />
                  <div className="flex items-end">
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          banners: prev.banners.filter((_, i) => i !== index),
                        }))
                      }
                      className="flex items-center space-x-1 mt-6 ml-2 text-red hover:text-white border border-red-600 hover:bg-red-600 transition-colors duration-200 px-2 py-1 rounded"
                      type="button"
                    >
                      <MdOutlineCancel aria-hidden="true" className="h-4 w-4" />
                      <span>{t("COMMON.DELETE")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {bShowInputField && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="bannerUpload"
                className="flex items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-md cursor-pointer mb-6"
              >
                <FiUpload size={30} className="text-gray-400 mr-2" />
                <span className="text-gray-700 text-sm">
                  {t("BANNER_FORM.CHOOSE_IMAGE")}
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleBannerUpload(e);
                  setShowInputField(false);
                }}
                className="hidden"
                id="bannerUpload"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8 gap-4">
          <button type="submit" className="btn-secondry" disabled={bLoading}>
            {t("COMMON.SUBMIT")}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
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
