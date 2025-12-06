import { useState, useEffect, useCallback, useRef } from "react";
import { Building, MapPin, Phone, Mail } from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import PhoneInputWithIcon from "../components/PhoneInputWithIcon"; // Import the phone input component
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../utils/ApiUtils";
import {
  GET_STORE_BY_ID,
  UPDATE_STORE,
  CREATE_STORE,
} from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { STATUS } from "../contants/constants";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import TextAreaWithIcon from "../components/TextAreaWithIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchResource,
  fetchStatesByCountryId,
  fetchCitiesByStateId,
  clearStates,
  clearCities,
} from "../store/slices/allDataSlice";
import FloatingFooter from "../components/FloatingFooter";

// Import phone validation
import { isValidPhoneNumber } from "react-phone-number-input";

const getArray = (data) =>
  Array.isArray(data)
    ? data
    : data && Array.isArray(data.data)
    ? data.data
    : [];

const AddStore = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    countries: countriesData,
    states: statesData,
    cities: citiesData,
  } = useSelector((state) => state.allData.resources);

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
    CountryCode: "", // New field for country code
  });

  const [oErrors, setErrors] = useState({});
  const [bSubmitting, setbSubmitting] = useState(false);
  const [isFetchingStore, setIsFetchingStore] = useState(false);

  // Refs to track what has been loaded
  const hasFetchedStore = useRef(false);
  const hasFetchedCountries = useRef(false);

  // Fetch countries on component mount - only once
  useEffect(() => {
    if (!hasFetchedCountries.current && !countriesData.data.length) {
      dispatch(fetchResource({ key: "countries" }));
      hasFetchedCountries.current = true;
    }
  }, [dispatch, countriesData.data.length]);

  // Fetch states when country changes - only when country is selected
  useEffect(() => {
    if (oFormData.country && oFormData.country !== "") {
      dispatch(fetchStatesByCountryId(oFormData.country));
    } else {
      dispatch(clearStates());
    }
  }, [dispatch, oFormData.country]);

  // Fetch cities when state changes - only when state is selected
  useEffect(() => {
    if (oFormData.state && oFormData.state !== "") {
      dispatch(fetchCitiesByStateId(oFormData.state));
    } else {
      dispatch(clearCities());
    }
  }, [dispatch, oFormData.state]);

  // Extract country code from phone number
  const extractCountryCode = (phoneNumber) => {
    if (!phoneNumber) return "";
    
    // The phone number from react-phone-number-input is in E.164 format (+911234567890)
    // Extract the country code (everything between + and the first set of digits)
    const match = phoneNumber.match(/^\+(.+?)(?=\d)/);
    return match ? match[1] : "";
  };

  // Updated handleChange for phone input
  const handlePhoneChange = useCallback((phoneNumber) => {
    const countryCode = extractCountryCode(phoneNumber);
    
    setFormData((prev) => ({
      ...prev,
      phone: phoneNumber,
      CountryCode: countryCode,
    }));

    // Clear error when user starts typing
    if (oErrors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  }, [oErrors.phone]);

  // Optimized fetchStore function without circular dependencies
  const fetchStore = useCallback(async () => {
    if (!id || isFetchingStore || hasFetchedStore.current) return;

    setIsFetchingStore(true);
    hasFetchedStore.current = true;

    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiGet(`${GET_STORE_BY_ID}/${id}`, {}, token);

      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        const store = oResponse.data.data;

        // Extract phone number and country code if available
        let phoneNumber = store.PhoneNumber || "";
        let countryCode = "";
        
        if (phoneNumber && phoneNumber.startsWith('+')) {
          const match = phoneNumber.match(/^\+(.+?)(?=\d)/);
          countryCode = match ? match[1] : "";
        }

        // Set basic form data immediately
        setFormData((prev) => ({
          ...prev,
          name: store.StoreName || "",
          address: store.AddressLine1 || "",
          zipCode: store.Zipcode || "",
          phone: phoneNumber,
          CountryCode: countryCode,
          StoreID: store.StoreID || "",
          email: store.Email || "",
          countryName: store.CountryName || "",
          stateName: store.StateName || "",
          cityName: store.CityName || "",
        }));
        setStatus(store.IsActive);

        // Find and set country ID
        const countriesArray = getArray(countriesData.data);
        if (countriesArray.length > 0) {
          const foundCountry = countriesArray.find(
            (c) => c.CountryName === store.CountryName
          );
          if (foundCountry) {
            setFormData((prev) => ({
              ...prev,
              country: foundCountry.CountryID,
            }));
          }
        }
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
    } finally {
      setIsFetchingStore(false);
    }
  }, [id, isFetchingStore, countriesData.data, t]);

  // Effect to populate state when states are loaded and we have state name
  useEffect(() => {
    if (!id || !oFormData.country || !oFormData.stateName || oFormData.state)
      return;

    const statesArray = getArray(statesData.data);
    if (statesArray.length > 0) {
      const foundState = statesArray.find(
        (s) => s.StateName === oFormData.stateName
      );

      if (foundState) {
        setFormData((prev) => ({
          ...prev,
          state: foundState.StateID,
        }));
      }
    }
  }, [
    id,
    oFormData.country,
    oFormData.stateName,
    oFormData.state,
    statesData.data,
  ]);

  // Effect to populate city when cities are loaded and we have city name
  useEffect(() => {
    if (!id || !oFormData.state || !oFormData.cityName || oFormData.city)
      return;

    const citiesArray = getArray(citiesData.data);
    if (citiesArray.length > 0) {
      const foundCity = citiesArray.find(
        (c) => c.CityName === oFormData.cityName
      );

      if (foundCity) {
        setFormData((prev) => ({
          ...prev,
          city: foundCity.CityID,
        }));
      }
    }
  }, [
    id,
    oFormData.state,
    oFormData.cityName,
    oFormData.city,
    citiesData.data,
  ]);

  // Fetch store only once when component mounts with ID and countries are loaded
  useEffect(() => {
    if (id && !hasFetchedStore.current && countriesData.data.length > 0) {
      fetchStore();
    }
  }, [id, countriesData.data.length, fetchStore]);

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
          [name]: value,
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // Enhanced Phone validation with country code check
    if (!oFormData.phone?.trim()) {
      newErrors.phone = t("STORES.VALIDATION.PHONE");
      isValid = false;
    } else {
      // Validate phone number format using react-phone-number-input
      if (!isValidPhoneNumber(oFormData.phone)) {
        newErrors.phone = t("STORES.VALIDATION.PHONE_INVALID");
        isValid = false;
      }
      
      // Additional validation for country code presence
      // The phone number should start with + followed by country code
      if (!oFormData.phone.startsWith('+')) {
        newErrors.phone = t("STORES.VALIDATION.COUNTRY_CODE_REQUIRED");
        isValid = false;
      }
      
      // Validate minimum phone number length (country code + number)
      // Most countries have at least 8 digits after country code
      const phoneWithoutSpaces = oFormData.phone.replace(/\s/g, '');
      const digitsAfterPlus = phoneWithoutSpaces.substring(1); // Remove the +
      if (digitsAfterPlus.length < 8) {
        newErrors.phone = t("STORES.VALIDATION.PHONE_TOO_SHORT");
        isValid = false;
      }
      
      // Validate country code length (typically 1-3 digits)
      const countryCodeMatch = oFormData.phone.match(/^\+\d{1,3}/);
      if (!countryCodeMatch) {
        newErrors.phone = t("STORES.VALIDATION.INVALID_COUNTRY_CODE");
        isValid = false;
      }
    }

    if (!oFormData.email.trim()) {
      newErrors.email = t("STORES.VALIDATION.EMAIL");
      isValid = false;
    } else if (!emailRegex.test(oFormData.email)) {
      newErrors.email = t("STORES.VALIDATION.EMAIL_INVALID");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [oFormData, t]);

  const handleClose = useCallback(() => {
    navigate("/stores");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault(); // Make it optional for the footer button
      if (!validateForm()) return;

      setbSubmitting(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Get selected country, state, and city names
      const selectedCountry = getArray(countriesData.data).find(
        (c) => String(c.CountryID) === String(oFormData.country)
      );
      const selectedState = getArray(statesData.data).find(
        (s) => String(s.StateID) === String(oFormData.state)
      );
      const selectedCity = getArray(citiesData.data).find(
        (c) => String(c.CityID) === String(oFormData.city)
      );

      const payload = {
        TenantID: localStorage.getItem("tenantID"),
        StoreName: oFormData.name,
        Email: oFormData.email,
        PhoneNumber: oFormData.phone,
        CountryCode: oFormData.CountryCode || "", // Send country code to API
        AddressLine1: oFormData.address,
        AddressLine2: oFormData.addressLine2 || "", // Include AddressLine2
        CityID: parseInt(oFormData.city, 10),
        StateID: parseInt(oFormData.state, 10),
        CountryID: parseInt(oFormData.country, 10),
        Zipcode: oFormData.zipCode,
        IsActive: status,
        CountryName: selectedCountry ? selectedCountry.CountryName : "",
        StateName: selectedState ? selectedState.StateName : "",
        CityName: selectedCity ? selectedCity.CityName : "",
        ...(id
          ? {
              StoreID: oFormData.StoreID || 0,
              UpdatedBy: userId,
            }
          : {
              CreatedBy: userId,
            }),
      };

      try {
        let oResponse;

        if (id) {
          // Use PUT for update with updateStore endpoint
          oResponse = await apiPut(UPDATE_STORE, payload, token);
        } else {
          // Use POST for create with createStore endpoint
          oResponse = await apiPost(CREATE_STORE, payload, token);
        }

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
      status,
      countriesData.data,
      statesData.data,
      citiesData.data,
    ]
  );

  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  return (
    <div className="max-w-8xl mx-auto pb-20">
      {" "}
      {/* Added padding-bottom */}
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
                    options={getArray(countriesData.data).map((c) => ({
                      value: c.CountryID,
                      label: c.CountryName,
                    }))}
                    Icon={Building}
                    error={oErrors.country}
                    loading={countriesData.loading}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.STATE")}
                    id="state"
                    name="state"
                    value={oFormData.state}
                    onChange={handleChange}
                    options={getArray(statesData.data).map((s) => ({
                      value: s.StateID,
                      label: s.StateName,
                    }))}
                    Icon={Building}
                    error={oErrors.state}
                    disabled={!oFormData.country || statesData.loading}
                    loading={statesData.loading}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    label={t("COMMON.CITY")}
                    id="city"
                    name="city"
                    value={oFormData.city}
                    onChange={handleChange}
                    options={getArray(citiesData.data).map((c) => ({
                      value: c.CityID,
                      label: c.CityName,
                    }))}
                    Icon={Building}
                    error={oErrors.city}
                    disabled={!oFormData.state || citiesData.loading}
                    loading={citiesData.loading}
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
                  {/* Replace TextInputWithIcon with PhoneInputWithIcon */}
                  <PhoneInputWithIcon
                    label={t("COMMON.PHONE_NUMBER")}
                    id="phone"
                    name="phone"
                    value={oFormData.phone}
                    onChange={handlePhoneChange} // Use the custom phone change handler
                    placeholder={t("COMMON.ENTER_PHONE_NUMBER")}
                    Icon={Phone}
                    error={oErrors.phone}
                    defaultCountry="IN"
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
        </div>
      </form>
      {/* Floating Footer */}
      <FloatingFooter
        onCancel={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={bSubmitting}
        isEditMode={!!id}
      />
    </div>
  );
};

export default AddStore;