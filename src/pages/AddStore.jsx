import { useState, useContext, useEffect, useCallback } from "react";
import { Building, MapPin, Phone, Mail } from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { LocationDataContext } from "../context/LocationDataProvider";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/ApiUtils";
import { GET_STORE_BY_ID, CREATE_OR_UPDATE_STORE } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { STATUS } from "../contants/constants";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import TextAreaWithIcon from "../components/TextAreaWithIcon";

const getArray = (data) =>
  Array.isArray(data)
    ? data
    : data && Array.isArray(data.data)
    ? data.data
    : [];

const AddStore = () => {
  const { t } = useTranslation();
  const { aCountriesData, aStatesData, aCitiesData } =
    useContext(LocationDataContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle, setBackButton } = useTitle();
  const [status, setStatus] = useState(false);
  const [oFormData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    status: "",
    countryName: "",
    stateName: "",
    cityName: "",
    StoreID: "",
  });

  const [oErrors, setErrors] = useState({});
  const [bSubmitting, setbSubmitting] = useState(false);

  const fetchStore = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiGet(`${GET_STORE_BY_ID}/${id}`, {}, token);
      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        const store = oResponse.data.data;

        const foundCountry = getArray(aCountriesData).find(
          (c) => c.CountryName === store.CountryName
        );
        const foundState = getArray(aStatesData).find(
          (s) =>
            s.StateName === store.StateName &&
            String(s.CountryID) === String(foundCountry?.CountryID)
        );
        const foundCity = getArray(aCitiesData).find(
          (c) =>
            c.CityName === store.CityName &&
            String(c.StateID) === String(foundState?.StateID)
        );
        setFormData({
          name: store.StoreName || "",
          address: store.AddressLine1 || "",
          country: foundCountry?.CountryID || "",
          state: foundState?.StateID || "",
          city: foundCity?.CityID || "",
          zipCode: store.Zipcode || "",
          phone: store.PhoneNumber || "",
          StoreID: store.StoreID || "",
          email: store.Email || "",
          countryName:
            store.CountryName || (foundCountry ? foundCountry.CountryName : ""),
          stateName:
            store.StateName || (foundState ? foundState.StateName : ""),
          cityName: store.CityName || (foundCity ? foundCity.CityName : ""),
        });
        setStatus(store.IsActive);

        setErrors({});
      } else {
        showEmsg(
          oResponse.data?.MESSAGE || t("COMMON.ERROR_MESSAGE"),
          STATUS.ERROR
        );
      }
    } catch (error) {
      showEmsg(
        error?.response?.data?.MESSAGE || t("COMMON.ERROR_MESSAGE"),
        STATUS.ERROR
      );
    }
  }, [id, aCountriesData, aStatesData, aCitiesData, t]);

  useEffect(() => {
    if (id) fetchStore();
  }, [id, fetchStore]);

  useEffect(() => {
    setTitle(id ? t("STORES.EDIT_STORE") : t("STORES.ADD_STORE"));
    setBackButton(<BackButton onClick={() => window.history.back()} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, id]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // When country changes, reset state and city
      if (name === "country") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          state: "",
          city: "",
          stateName: "",
          cityName: "",
        }));
      }
      // When state changes, reset city
      else if (name === "state") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          city: "",
          cityName: "",
        }));
      }
      // For all other fields
      else {
        setFormData((prev) => ({
          ...prev,
          [name]: name === "phone" ? value.replace(/\D/g, "") : value,
        }));
      }

      // Clear error for the changed field
      if (oErrors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [oErrors]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!oFormData.name.trim()) {
      newErrors.name = t("STORES.VALIDATION.STORE_NAME");
      isValid = false;
    }
    if (!oFormData.address.trim()) {
      newErrors.address = t("STORES.VALIDATION.ADDRESS");
      isValid = false;
    }
    if (!oFormData.country) {
      newErrors.country = t("STORES.VALIDATION.COUNTRY");
      isValid = false;
    }
    if (!oFormData.state) {
      newErrors.state = t("STORES.VALIDATION.STATE");
      isValid = false;
    }
    if (!oFormData.city) {
      newErrors.city = t("STORES.VALIDATION.CITY");
      isValid = false;
    }
    if (!oFormData.zipCode.trim()) {
      newErrors.zipCode = t("STORES.VALIDATION.ZIP_CODE");
      isValid = false;
    }
    if (!oFormData.phone.trim()) {
      newErrors.phone = t("STORES.VALIDATION.PHONE");
      isValid = false;
    } else if (oFormData.phone.replace(/\D/g, "").length !== 10) {
      newErrors.phone = t("STORES.VALIDATION.PHONE_LENGTH");
      isValid = false;
    }
    if (!oFormData.email.trim()) {
      newErrors.email = t("STORES.VALIDATION.EMAIL");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(oFormData.email)) {
      newErrors.email = t("STORES.VALIDATION.EMAIL_INVALID");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [oFormData, t]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setbSubmitting(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Get selected country, state, and city names
      const selectedCountry = getArray(aCountriesData).find(
        (c) => String(c.CountryID) === String(oFormData.country)
      );
      const selectedState = getArray(aStatesData).find(
        (s) => String(s.StateID) === String(oFormData.state)
      );
      const selectedCity = getArray(aCitiesData).find(
        (c) => String(c.CityID) === String(oFormData.city)
      );
      console.log(
        "Form status value:",
        oFormData.status,
        "Type:",
        oFormData.status
      );
      const payload = {
        StoreID: oFormData.StoreID,
        TenantID: localStorage.getItem("tenantID"),
        StoreName: oFormData.name,
        Email: oFormData.email,
        PhoneNumber: oFormData.phone,
        AddressLine1: oFormData.address,
        AddressLine2: oFormData.address2 || "",
        CityID: parseInt(oFormData.city, 10),
        StateID: parseInt(oFormData.state, 10),
        CountryID: parseInt(oFormData.country, 10),
        Zipcode: oFormData.zipCode,
        IsActive: status,
        CountryName: selectedCountry ? selectedCountry.CountryName : "",
        StateName: selectedState ? selectedState.StateName : "",
        CityName: selectedCity ? selectedCity.CityName : "",
        ...(id ? { UpdatedBy: userId } : { CreatedBy: userId }),
      };

      try {
        const oResponse = await apiPost(CREATE_OR_UPDATE_STORE, payload, token);
        if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
          showEmsg(oResponse.data?.message, STATUS.SUCCESS, 3000, async () => {
            navigate("/stores");
          });
        } else {
          showEmsg(oResponse.data?.message, STATUS.WARNING);
        }
      } catch (err) {
        showEmsg(
          err?.response?.data?.message || t("COMMON.API_ERROR"),
          STATUS.ERROR
        );
      } finally {
        hideLoaderWithDelay(setbSubmitting);
      }
    },
    [
      validateForm,
      oFormData,
      id,
      navigate,
      t,
      aCountriesData,
      aStatesData,
      aCitiesData,
    ]
  );

  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  return (
    <div className="max-w-8xl mx-auto">
      <ToastContainer />
      {loaderOverlay}

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Store Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("CREATE_STORE.STORE_INFORMATION")}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="w-full">
                  <TextInputWithIcon
                    label={t("CREATE_STORE.STORE_NAME")}
                    id="name"
                    name="name"
                    value={oFormData.name}
                    onChange={handleChange}
                    placeholder={t("CREATE_STORE.ENTER_STORE_NAME")}
                    Icon={Building}
                    error={oErrors.name}
                  />
                </div>
              </div>
              <div className="w-full mt-4 md:mt-0">
                <TextAreaWithIcon
                  label="Street Address"
                  name="address"
                  value={oFormData.address}
                  onChange={handleChange}
                  placeholder="Enter your street address"
                  icon={MapPin}
                  error={oErrors.address}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <SelectWithIcon
                    label={t("COMMON.COUNTRY")}
                    id="country"
                    name="country"
                    value={oFormData.country}
                    onChange={handleChange}
                    options={getArray(aCountriesData).map((c) => ({
                      value: c.CountryID,
                      label: c.CountryName,
                    }))}
                    Icon={Building}
                    error={oErrors.country}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.STATE")}
                    id="state"
                    name="state"
                    value={oFormData.state}
                    onChange={handleChange}
                    options={getArray(aStatesData)
                      .filter(
                        (s) => String(s.CountryID) === String(oFormData.country)
                      )
                      .map((s) => ({ value: s.StateID, label: s.StateName }))}
                    Icon={Building}
                    error={oErrors.state}
                    disabled={!oFormData.country}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.CITY")}
                    id="city"
                    name="city"
                    value={oFormData.city}
                    onChange={handleChange}
                    options={getArray(aCitiesData)
                      .filter(
                        (c) => String(c.StateID) === String(oFormData.state)
                      )
                      .map((c) => ({ value: c.CityID, label: c.CityName }))}
                    Icon={Building}
                    error={oErrors.city}
                    disabled={!oFormData.state}
                  />
                </div>
                <div>
                  <TextInputWithIcon
                    label={t("COMMON.ZIP_CODE")}
                    id="zipCode"
                    name="zipCode"
                    value={oFormData.zipCode}
                    onChange={handleChange}
                    placeholder={t("COMMON.ENTER_ZIP_CODE")}
                    Icon={MapPin}
                    error={oErrors.zipCode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("CREATE_STORE.CONTACT_INFORMATION")}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TextInputWithIcon
                    label={t("COMMON.PHONE_NUMBER")}
                    id="phone"
                    name="phone"
                    value={oFormData.phone}
                    onChange={handleChange}
                    placeholder={t("COMMON.ENTER_PHONE_NUMBER")}
                    Icon={Phone}
                    type="tel"
                    error={oErrors.phone}
                  />
                </div>
                <div>
                  <TextInputWithIcon
                    label={t("COMMON.EMAIL_ADDRESS")}
                    id="email"
                    name="email"
                    value={oFormData.email}
                    onChange={handleChange}
                    placeholder={t("COMMON.ENTER_EMAIL_ADDRESS")}
                    Icon={Mail}
                    type="email"
                    error={oErrors.email}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-cancel"
            >
              {t("COMMON.CANCEL")}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={bSubmitting}
            >
              {id ? t("COMMON.UPDATE") : t("COMMON.CREATE")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStore;
