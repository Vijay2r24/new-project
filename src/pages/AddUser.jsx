import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Building,
  CheckCircle,
  XCircle,
  Store,
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { FaCamera, FaTimes } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/ApiUtils";
import { GET_USER_BY_ID, USER_CREATE_OR_UPDATE } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { LocationDataContext } from "../context/LocationDataProvider";
import { useTitle } from "../context/TitleContext";
import { STATUS } from "../contants/constants";
import md5 from "md5";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import userProfile from "../../assets/images/userProfile.svg";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { 
  fetchResource, 
  fetchStatesByCountryId, 
  fetchCitiesByStateId,
  clearStates,
  clearCities 
} from "../store/slices/allDataSlice";

// Import password utilities
import {
  passwordRequirements,
  calculatePasswordStrength,
  getPasswordStrengthText,
  validateFormPassword
} from "../utils/passwordUtils";

const getArray = (data) =>
  Array.isArray(data)
    ? data
    : data && Array.isArray(data.data)
    ? data.data
    : [];

const AddUser = () => {
  const [oFormData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    stores: [],
    password: "",
    confirmPassword: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    countryName: "",
    stateName: "",
    cityName: "",
    documentIds: [],
  });
  const [nProfileImage, setProfileImage] = useState(null);
  const [nProfileImagePreview, setProfileImagePreview] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState([]);
  const { t } = useTranslation();
  const { id } = useParams();
  const { aCountriesData, aStatesData, aCitiesData } =
    useContext(LocationDataContext);
  const [bImgLoading, setImgLoading] = useState(true);
  const [bImgError, setImgError] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();

  // Get data from the allDataSlice
  const rolesData = useSelector((state) => state.allData.resources.roles || {});
  const storesData = useSelector((state) => state.allData.resources.stores || {});
  const countriesData = useSelector((state) => state.allData.resources.countries || {});
  const statesData = useSelector((state) => state.allData.resources.states || {});
  const citiesData = useSelector((state) => state.allData.resources.cities || {});

  const roles = rolesData.data || [];
  const stores = storesData.data || [];
  const countries = countriesData.data || [];
  const states = statesData.data || [];
  const cities = citiesData.data || [];
  
  const rolesLoading = rolesData.loading || false;
  const storesLoading = storesData.loading || false;
  const countriesLoading = countriesData.loading || false;
  const statesLoading = statesData.loading || false;
  const citiesLoading = citiesData.loading || false;
  
  const rolesError = rolesData.error || null;
  const storesError = storesData.error || null;
  const countriesError = countriesData.error || null;
  const statesError = statesData.error || null;
  const citiesError = citiesData.error || null;

  const [oErrors, setErrors] = useState({});
  const { setTitle, setBackButton } = useTitle();
  const [fetchUserError, setFetchUserError] = useState("");
  const navigate = useNavigate();
  const [bSubmitting, setSubmitting] = useState(false);

  // Refs to track if data has been fetched to prevent multiple API calls
  const hasFetchedRoles = useRef(false);
  const hasFetchedStores = useRef(false);
  const hasFetchedCountries = useRef(false);
  const hasFetchedUser = useRef(false);
  const hasFetchedInitialData = useRef(false);

  // Password strength calculation using the imported utility
  const passwordStrength = useMemo(() => 
    calculatePasswordStrength(oFormData.password), 
    [oFormData.password]
  );

  // Get password strength text using the imported utility
  const passwordStrengthText = useMemo(() => 
    getPasswordStrengthText(passwordStrength, t), 
    [passwordStrength, t]
  );

  useEffect(() => {
    setTitle(id ? t("USERS.EDIT_USER") : t("USERS.ADD_NEW_USER"));
    setBackButton(<BackButton onClick={() => navigate("/users")} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, id, navigate]);

  // Validation function - simplified using imported utilities
  const validate = useCallback(() => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (!oFormData.firstName?.trim()) {
      errors.firstName = t("ADD_USER.VALIDATION.FIRST_NAME_REQUIRED");
    }

    if (!oFormData.lastName?.trim()) {
      errors.lastName = t("ADD_USER.VALIDATION.LAST_NAME_REQUIRED");
    }

    if (!oFormData.email?.trim()) {
      errors.email = t("ADD_USER.VALIDATION.EMAIL_REQUIRED");
    } else if (!emailRegex.test(oFormData.email)) {
      errors.email = t("ADD_USER.VALIDATION.EMAIL_INVALID");
    }

    if (!oFormData.phone?.trim()) {
      errors.phone = t("ADD_USER.PHONE_REQUIRED");
    } else if (!phoneRegex.test(oFormData.phone)) {
      errors.phone = t("ADD_USER.VALIDATION.PHONE_INVALID");
    }

    if (!oFormData.role) {
      errors.role = t("ADD_USER.VALIDATION.ROLE_REQUIRED");
    }

    if (!oFormData.stores || oFormData.stores.length === 0) {
      errors.stores = t("ADD_USER.VALIDATION.STORES_REQUIRED");
    }

    // Use imported password validation
    const passwordErrors = validateFormPassword(
      oFormData.password, 
      oFormData.confirmPassword, 
      t, 
      !id // isNewUser = true when creating new user
    );
    
    Object.assign(errors, passwordErrors);

    if (!oFormData.streetAddress?.trim()) {
      errors.streetAddress = t("ADD_USER.VALIDATION.ADDRESS_REQUIRED");
    }

    if (!oFormData.country) {
      errors.country = t("ADD_USER.VALIDATION.COUNTRY_REQUIRED");
    }

    if (!oFormData.state) {
      errors.state = t("ADD_USER.VALIDATION.STATE_REQUIRED");
    }

    if (!oFormData.city) {
      errors.city = t("ADD_USER.VALIDATION.CITY_REQUIRED");
    }

    if (!oFormData.pincode?.trim()) {
      errors.pincode = t("ADD_USER.VALIDATION.PINCODE_REQUIRED");
    }

    return errors;
  }, [oFormData, t, id]);

  // Fetch initial data when component mounts - only once
  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      
      // Fetch countries if not loaded
      if (!countries.length && !countriesLoading) {
        hasFetchedCountries.current = true;
        dispatch(fetchResource({ key: "countries" }));
      }

      // Fetch roles if not loaded
      if (!roles.length && !rolesLoading && !hasFetchedRoles.current) {
        hasFetchedRoles.current = true;
        dispatch(
          fetchResource({
            key: "roles",
            params: { pageNumber: 1, pageSize: 100 },
          })
        );
      }

      // Fetch stores if not loaded
      if (!stores.length && !storesLoading && !hasFetchedStores.current) {
        hasFetchedStores.current = true;
        dispatch(
          fetchResource({
            key: "stores",
            params: { pageNumber: 1, pageSize: 100 },
          })
        );
      }
    }
  }, [dispatch, countries, countriesLoading, roles, rolesLoading, stores, storesLoading]);

  useEffect(() => {
    if (oFormData.country) {
      dispatch(fetchStatesByCountryId(oFormData.country))
        .unwrap()
        .then((result) => {
          // States loaded successfully
        })
        .catch((error) => {
          console.error("Error fetching states:", error);
        });
    } else {
      dispatch(clearStates());
      setFormData(prev => ({ ...prev, state: "", city: "" }));
    }
  }, [dispatch, oFormData.country]);

  useEffect(() => {
    if (oFormData.state) {
      dispatch(fetchCitiesByStateId(oFormData.state))
        .unwrap()
        .then((result) => {
          // Cities loaded successfully
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
        });
    } else {
      // Clear cities when no state is selected
      dispatch(clearCities());
      setFormData(prev => ({ ...prev, city: "" }));
    }
  }, [dispatch, oFormData.state]);

  // Optimized fetchUser function without circular dependencies
  const fetchUser = useCallback(async () => {
    if (!id || hasFetchedUser.current) return;

    hasFetchedUser.current = true;
    const token = localStorage.getItem("token");
    
    try {
      const oResponse = await apiGet(`${GET_USER_BY_ID}/${id}`, {}, token);
      const resData = oResponse.data;

      if (resData?.status === STATUS.SUCCESS.toUpperCase() && resData.data) {
        const user = resData.data;

        // Set basic form data immediately
        setFormData(prev => ({
          ...prev,
          firstName: user.FirstName || "",
          lastName: user.LastName || "",
          email: user.Email || "",
          phone: user.PhoneNumber || "",
          role: user.RoleID || "",
          IsActive: true,
          stores: user.Stores ? user.Stores.map((store) => store.StoreId) : [],
          streetAddress: user.AddressLine || "",
          pincode: user.Zipcode || "",
          countryName: user.CountryName || "",
          stateName: user.StateName || "",
          cityName: user.CityName || "",
          documentId: user.ProfileImageUrl
            ? user.ProfileImageUrl.map((doc) => doc.documentId)
            : [],
        }));

        // For the profile image
        if (user.ProfileImageUrl && user.ProfileImageUrl.length > 0) {
          setImgLoading(true);
          setProfileImagePreview(user.ProfileImageUrl[0].documentUrl);
          setExistingDocuments(user.ProfileImageUrl);
        } else {
          setImgLoading(false);
          setExistingDocuments([]);
        }

        // Store location names for later population
        const locationData = {
          countryName: user.CountryName,
          stateName: user.StateName,
          cityName: user.CityName
        };

        // Find and set country ID if available
        const countriesArray = getArray(countries);
        if (countriesArray.length > 0) {
          const foundCountry = countriesArray.find(
            (c) => c.CountryName === user.CountryName
          );
          if (foundCountry) {
            setFormData(prev => ({
              ...prev,
              country: foundCountry.CountryID
            }));
          }
        } else {
          // If countries aren't loaded yet, store the names for later
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              countryName: user.CountryName,
              stateName: user.StateName,
              cityName: user.CityName
            }));
          }, 100);
        }

        setRemovedDocumentIds([]);
        setFetchUserError("");
      } else {
        setFetchUserError(resData?.MESSAGE || t("COMMON.FAILED_OPERATION"));
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.MESSAGE;
      setFetchUserError(backendMessage || t("COMMON.ERROR_MESSAGE"));
    }
  }, [id, t, countries]);

  // Effect to populate state and city after country is set and states are loaded
  useEffect(() => {
    const populateStateAndCity = async () => {
      if (!id || !oFormData.country || !oFormData.stateName || !oFormData.countryName) return;

      try {
        // Ensure states are loaded for the current country
        const statesArray = getArray(states);
        const foundState = statesArray.find(
          (s) => s.StateName === oFormData.stateName
        );

        if (foundState && !oFormData.state) {
          setFormData(prev => ({
            ...prev,
            state: foundState.StateID
          }));
        }
      } catch (error) {
        console.error("Error populating state:", error);
      }
    };

    populateStateAndCity();
  }, [id, oFormData.country, oFormData.stateName, oFormData.countryName, states]);

  useEffect(() => {
    const populateCity = async () => {
      if (!id || !oFormData.state || !oFormData.cityName) return;

      try {
        const citiesArray = getArray(cities);
        const foundCity = citiesArray.find(
          (c) => c.CityName === oFormData.cityName
        );

        if (foundCity && !oFormData.city) {
          setFormData(prev => ({
            ...prev,
            city: foundCity.CityID
          }));
        }
      } catch (error) {
        console.error("Error populating city:", error);
      }
    };

    populateCity();
  }, [id, oFormData.state, oFormData.cityName, cities]);

  useEffect(() => {
    if (id && !hasFetchedUser.current && countries.length > 0) {
      const timer = setTimeout(() => {
        fetchUser();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [id, countries.length, fetchUser]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
    
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
      
      // Clear error when user starts typing
      if (oErrors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [oErrors]
  );

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setRemovedDocumentIds([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validationErrors = validate();
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      setSubmitting(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const formData = new FormData();

      let documentMetadata = [];
      if (nProfileImage) {
        if (existingDocuments.length > 0 && existingDocuments[0]?.documentId) {
          documentMetadata.push({
            image: "profile-image",
            sortOrder: 1,
            DocumentID: existingDocuments[0].documentId,
          });
        } else {
          documentMetadata.push({
            image: "profile-image",
            sortOrder: 1,
          });
        }
      } else if (removedDocumentIds.length > 0) {
        const remainingDocuments = existingDocuments.filter(
          (doc) => !removedDocumentIds.includes(doc.documentId)
        );
        documentMetadata = remainingDocuments.map((doc, index) => ({
          image: "profile-image",
          sortOrder: doc.sortOrder || index + 1,
          DocumentID: doc.documentId,
        }));
      }

      const userData = {
        UserID: id || "",
        FirstName: oFormData.firstName || "",
        LastName: oFormData.lastName || "",
        Email: oFormData.email || "",
        Password: oFormData.password ? md5(oFormData.password) : "",
        PhoneNumber: oFormData.phone || "",
        AddressLine: oFormData.streetAddress || "",
        CityID: oFormData.city ? parseInt(oFormData.city, 10) : 0,
        StateID: oFormData.state ? parseInt(oFormData.state, 10) : 0,
        CountryID: oFormData.country ? parseInt(oFormData.country, 10) : 0,
        Zipcode: oFormData.pincode || "",
        RoleID: oFormData.role || "",
        StoreIDs: oFormData.stores || [],
        IsActive: oFormData.status,
        documentMetadata: documentMetadata,
      };

      if (id) {
        userData.UpdatedBy = userId;
      } else {
        userData.CreatedBy = userId;
      }

      formData.append("data", JSON.stringify(userData));

      if (nProfileImage) {
        formData.append("profile-image", nProfileImage);
      }

      try {
        const oResponse = await apiPost(
          USER_CREATE_OR_UPDATE,
          formData,
          token,
          true
        );
        const resData = oResponse?.data;

        if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
          setRemovedDocumentIds([]);
          showEmsg(resData?.message, STATUS.SUCCESS, 3000, async () => {
            navigate("/users");
          });
        } else {
          showEmsg(
            resData?.message || t("COMMON.FAILED_OPERATION"),
            STATUS.WARNING
          );
        }
      } catch (error) {
        console.error("API Error:", error);
        const backendMessage = error?.response?.data?.message;
        showEmsg(backendMessage || t("COMMON.ERROR_MESSAGE"), STATUS.ERROR);
      } finally {
        hideLoaderWithDelay(setSubmitting);
      }
    },
    [
      validate,
      id,
      oFormData,
      nProfileImage,
      existingDocuments,
      removedDocumentIds,
      t,
      navigate,
    ]
  );

  const loaderOverlay = bSubmitting && <Loader />;

  return (
    <div className="max-w-8xl mx-auto">
      <ToastContainer />
      {loaderOverlay}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-gray-500">
            {id ? t("USERS.EDIT_USER_DESCRIPTION") : t("USERS.DESCRIPTION")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 relative">
        <div className="relative" style={{ minWidth: 80, minHeight: 80 }}>
          {bImgLoading && !bImgError && (
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <img
            src={
              !bImgError &&
              (nProfileImagePreview ||
                (existingDocuments.length > 0 &&
                  existingDocuments[0].documentUrl))
                ? nProfileImagePreview || existingDocuments[0].documentUrl
                : userProfile
            }
            alt={t("ADD_USER.PROFILE_PREVIEW")}
            className={`h-20 w-20 rounded-full object-cover border ${
              bImgLoading ? "hidden" : ""
            }`}
            style={{ display: bImgLoading ? "none" : "block" }}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("ADD_USER.PROFILE_IMAGE")}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="profile-image-upload"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full cursor-pointer"
          >
            <FaCamera className="text-lg" />
            {t("COMMON.UPLOAD")}
          </label>

          <p className="text-xs text-gray-400 mt-1">
            {t("ADD_USER.IMAGE_UPLOAD_NOTE")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("ADD_USER.PERSONAL_INFO")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t("ADD_USER.FIRST_NAME")}
                id="firstName"
                name="firstName"
                value={oFormData.firstName}
                onChange={handleChange}
                placeholder={t("ADD_USER.ENTER_FIRST_NAME")}
                Icon={User}
                error={oErrors.firstName}
              />
              <TextInputWithIcon
                label={t("ADD_USER.LAST_NAME")}
                id="lastName"
                name="lastName"
                value={oFormData.lastName}
                onChange={handleChange}
                placeholder={t("ADD_USER.ENTER_LAST_NAME")}
                Icon={User}
                error={oErrors.lastName}
              />
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("ADD_USER.ACCOUNT_SECURITY")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectWithIcon
                label={t("ADD_USER.USER_ROLE")}
                id="role"
                name="role"
                value={oFormData.role}
                onChange={handleChange}
                options={roles.map((r) => ({
                  value: r.RoleID,
                  label: r.RoleName,
                }))}
                Icon={Building}
                disabled={rolesLoading}
                error={oErrors.role || rolesError}
                placeholder={
                  rolesLoading ? t("COMMON.LOADING") : t("ADD_USER.SELECT_ROLE")
                }
                searchable
                searchPlaceholder={t("COMMON.SEARCH_ROLE") || "Search role"}
                onInputChange={(inputValue) => {
                  dispatch(
                    fetchResource({
                      key: "roles",
                      params: {
                        searchText: inputValue,
                      },
                    })
                  );
                }}
              />

              <SelectWithIcon
                label={t("ADD_USER.ASSIGNED_STORES")}
                id="stores"
                name="stores"
                value={oFormData.stores}
                onChange={handleChange}
                options={stores.map((s) => ({
                  value: s.StoreID,
                  label: s.StoreName,
                }))}
                Icon={Store}
                disabled={storesLoading}
                error={oErrors.stores || storesError}
                placeholder={
                  storesLoading
                    ? t("COMMON.LOADING")
                    : t("ADD_USER.SELECT_STORES")
                }
                multiple={true}
                searchable
                searchPlaceholder={t("COMMON.SEARCH_STORES") || "Search stores"}
                onInputChange={(inputValue) => {
                  dispatch(
                    fetchResource({
                      key: "stores",
                      params: {
                        searchText: inputValue,
                      },
                    })
                  );
                }}
              />

              <div className="col-span-1 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInputWithIcon
                    label={t("COMMON.PASSWORD")}
                    id="password"
                    name="password"
                    value={oFormData.password}
                    onChange={handleChange}
                    placeholder={t("COMMON.ENTER_PASSWORD")}
                    Icon={Lock}
                    type="password"
                    error={oErrors.password}
                  />
                  <TextInputWithIcon
                    label={t("COMMON.CONFIRM_PASSWORD")}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={oFormData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t("COMMON.CONFIRM_PASSWORD")}
                    Icon={Lock}
                    type="password"
                    error={oErrors.confirmPassword}
                  />
                </div>
              </div>

              {typeof oFormData.password === "string" &&
                oFormData.password.length > 0 && (
                  <div
                    className="col-span-1 md:col-span-2"
                    style={{ marginTop: 4 }}
                  >
                    <span
                      style={{
                        color:
                          passwordStrength === "strong"
                            ? "#16a34a"
                            : passwordStrength === "medium"
                            ? "#f59e42"
                            : "#dc2626",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {passwordStrengthText}
                    </span>
                    <ul
                      style={{
                        margin: "8px 0 0 0",
                        padding: 0,
                        listStyle: "none",
                      }}
                    >
                      {passwordRequirements(t).map((req, idx) => {
                        const passed = req.test(oFormData.password);
                        return (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              color: passed ? "#16a34a" : "#dc2626",
                              fontSize: 13,
                              marginBottom: 2,
                            }}
                          >
                            {passed ? (
                              <CheckCircle
                                size={16}
                                color="#16a34a"
                                style={{ marginRight: 6 }}
                              />
                            ) : (
                              <XCircle
                                size={16}
                                color="#dc2626"
                                style={{ marginRight: 6 }}
                              />
                            )}
                            {req.label}
                          </li>
                        );
                      })}
                    </ul>
                    {passwordStrength !== "strong" && (
                      <div
                        style={{ color: "#dc2626", fontSize: 12, marginTop: 2 }}
                      >
                        {t("COMMON.PASSWORD_SUGGESTION")}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("ADD_USER.ADDRESS_INFO")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <TextInputWithIcon
              label={t("COMMON.STREET_ADDRESS")}
              id="streetAddress"
              name="streetAddress"
              value={oFormData.streetAddress}
              onChange={handleChange}
              placeholder={t("COMMON.ENTER_STREET_ADDRESS")}
              Icon={MapPin}
              error={oErrors.streetAddress}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label={t("COMMON.COUNTRY")}
                  id="country"
                  name="country"
                  value={oFormData.country}
                  onChange={handleChange}
                  options={countries.map((c) => ({
                    value: c.CountryID,
                    label: c.CountryName,
                  }))}
                  Icon={Building}
                  error={oErrors.country || countriesError}
                  placeholder={
                    countriesLoading ? t("COMMON.LOADING") : t("COMMON.SELECT_COUNTRY")
                  }
                  disabled={countriesLoading}
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t("COMMON.STATE")}
                  id="state"
                  name="state"
                  value={oFormData.state}
                  onChange={handleChange}
                  options={states.map((s) => ({ value: s.StateID, label: s.StateName }))}
                  Icon={Building}
                  error={oErrors.state || statesError}
                  placeholder={
                    statesLoading ? t("COMMON.LOADING") : t("COMMON.SELECT_STATE")
                  }
                  disabled={statesLoading || !oFormData.country}
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t("COMMON.CITY")}
                  id="city"
                  name="city"
                  value={oFormData.city}
                  onChange={handleChange}
                  options={cities.map((c) => ({ value: c.CityID, label: c.CityName }))}
                  Icon={Building}
                  error={oErrors.city || citiesError}
                  placeholder={
                    citiesLoading ? t("COMMON.LOADING") : t("COMMON.SELECT_CITY")
                  }
                  disabled={citiesLoading || !oFormData.state}
                />
              </div>
              <TextInputWithIcon
                label={t("COMMON.PINCODE")}
                id="pincode"
                name="pincode"
                value={oFormData.pincode}
                onChange={handleChange}
                placeholder={t("ADD_USER.ENTER_PINCODE")}
                Icon={MapPin}
                error={oErrors.pincode}
              />
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
          <button type="submit" className="btn-primary" disabled={bSubmitting}>
            {bSubmitting
              ? t("COMMON.SAVING")
              : id
              ? t("COMMON.SAVE_BUTTON")
              : t("ADD_USER.CREATE_USER")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;