import { useState, useEffect, useContext } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Building,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { FaCamera } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/ApiUtils";
import { GET_USER_BY_ID, USER_CREATE_OR_UPDATE } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { LocationDataContext } from "../context/LocationDataProvider";
import { useTitle } from "../context/TitleContext";
import { useRoles } from "../context/AllDataContext";
import { STATUS } from "../contants/constants";
import md5 from "md5";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import userProfile from '../../assets/images/userProfile.svg';
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
    role: "User",
    password: "",
    confirmPassword: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    status: "Active",
    country: "",
    countryName: "",
    stateName: "",
    cityName: "",
  });
  const [nProfileImage, setProfileImage] = useState(null);
  const [nProfileImagePreview, setProfileImagePreview] = useState(null);
  const { t } = useTranslation();
  const { id } = useParams();
  const { aCountriesData, aStatesData, aCitiesData } =
    useContext(LocationDataContext);
  const [bImgLoading, setImgLoading] = useState(true);
  const [bImgError, setImgError] = useState(false);
  const {
    data: roles,
    loading: rolesLoading,
    error: rolesError,
    fetch: fetchRoles,
  } = useRoles();
  const [oErrors, setErrors] = useState({});
  const { setTitle, setBackButton } = useTitle();
  const [fetchUserError, setFetchUserError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setTitle(id ? t("USERS.EDIT_USER") : t("USERS.ADD_NEW_USER"));
    setBackButton(<BackButton onClick={() => navigate("/users")} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, id, navigate]);
  useEffect(() => {
    if (
      id &&
      getArray(aCountriesData).length > 0 &&
      getArray(aStatesData).length > 0 &&
      getArray(aCitiesData).length > 0
    ) {
      const fetchUser = async () => {
        const token = localStorage.getItem("token");
        try {
          const oResponse = await apiGet(`${GET_USER_BY_ID}/${id}`, {}, token);
          const resData = oResponse.data;

          if (
            resData &&
            resData.STATUS === STATUS.SUCCESS.toUpperCase() &&
            resData.data?.user
          ) {
            const user = resData.data.user;

            const foundCountry = getArray(aCountriesData).find(
              (c) => c.CountryName === user.CountryName
            );
            const foundState = getArray(aStatesData).find(
              (s) =>
                s.StateName === user.StateName &&
                String(s.CountryID) === String(foundCountry?.CountryID)
            );
            const foundCity = getArray(aCitiesData).find(
              (c) =>
                c.CityName === user.CityName &&
                String(c.StateID) === String(foundState?.StateID)
            );

            setFormData((prevFormData) => ({
              ...prevFormData,
              firstName: user.FirstName || "",
              lastName: user.LastName || "",
              email: user.Email || "",
              phone: user.PhoneNumber || "",
              role: user.RoleID || "",
              streetAddress: user.AddressLine || "",
              city: foundCity?.CityID || "",
              state: foundState?.StateID || "",
              pincode: user.Pincode || "",
              status: user.Status || "Active",
              country: foundCountry?.CountryID || "",
              countryName: user.CountryName || "",
              stateName: user.StateName || "",
              cityName: user.CityName || "",
            }));

            if (user.ProfileImageUrl) {
              setImgLoading(true);
              setProfileImagePreview(user.ProfileImageUrl);
            }
            setFetchUserError("");
          } else {
            setFetchUserError(resData?.MESSAGE || t("COMMON.FAILED_OPERATION"));
          }
        } catch (error) {
          const backendMessage = error?.response?.data?.MESSAGE;
          setFetchUserError(backendMessage || t("COMMON.ERROR_MESSAGE"));
        }
      };
      fetchUser();
    }
  }, [id, t, aCountriesData, aStatesData, aCitiesData]);

  useEffect(() => {
    if ((!roles || roles.length === 0) && !rolesLoading) {
      fetchRoles({ pageNumber: 1, pageSize: 10 });
    }
  }, [fetchRoles, roles, rolesLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImgError(false); // Reset error state on new upload
      setImgLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setImgLoading(false); // Set loading false after preview is ready
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
      setImgError(false);
      setImgLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!oFormData.firstName)
      newErrors.firstName = t("ADD_USER.VALIDATION.FIRST_NAME");
    if (!oFormData.lastName)
      newErrors.lastName = t("ADD_USER.VALIDATION.LAST_NAME");
    if (!oFormData.email) newErrors.email = t("ADD_USER.VALIDATION.EMAIL");
    if (!oFormData.phone) newErrors.phone = t("ADD_USER.VALIDATION.PHONE");
    if (oFormData.phone && oFormData.phone.replace(/\D/g, "").length !== 10)
      newErrors.phone = t("ADD_USER.VALIDATION.PHONE_LENGTH");
    if (!oFormData.password)
      newErrors.password = t("ADD_USER.VALIDATION.PASSWORD");
    if (!oFormData.confirmPassword)
      newErrors.confirmPassword = t("ADD_USER.VALIDATION.CONFIRM_PASSWORD");
    if (id && (oFormData.password || oFormData.confirmPassword)) {
      if (!oFormData.password)
        newErrors.password = t("ADD_USER.VALIDATION.PASSWORD");
      if (!oFormData.confirmPassword)
        newErrors.confirmPassword = t("ADD_USER.VALIDATION.CONFIRM_PASSWORD");
      if (oFormData.password !== oFormData.confirmPassword)
        newErrors.confirmPassword = t("ADD_USER.VALIDATION.PASSWORD_MATCH");
    }
    if (
      oFormData.password &&
      oFormData.confirmPassword &&
      oFormData.password !== oFormData.confirmPassword
    )
      newErrors.confirmPassword = t("ADD_USER.VALIDATION.PASSWORD_MATCH");
    if (!oFormData.role) newErrors.role = t("ADD_USER.VALIDATION.ROLE");
    if (!oFormData.streetAddress)
      newErrors.streetAddress = t("ADD_USER.VALIDATION.STREET_ADDRESS");
    if (!oFormData.country)
      newErrors.country = t("ADD_USER.VALIDATION.COUNTRY");
    if (!oFormData.state) newErrors.state = t("ADD_USER.VALIDATION.STATE");
    if (!oFormData.city) newErrors.city = t("ADD_USER.VALIDATION.CITY");
    const passwordStrength = getPasswordStrength(oFormData.password);
    if (oFormData.password && passwordStrength !== "strong") {
      newErrors.password = t("ADD_USER.VALIDATION.STRONG_PASSWORD");
    }
    return newErrors;
  };

  const getPasswordStrength = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password) return null;
    if (strongRegex.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(oFormData.password);

  const passwordRequirements = [
    {
      label: t("COMMON.PASSWORD_REQ_LENGTH"),
      test: (pw) => pw.length >= 8,
    },
    {
      label: t("COMMON.PASSWORD_REQ_UPPER"),
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: t("COMMON.PASSWORD_REQ_LOWER"),
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: t("COMMON.PASSWORD_REQ_NUMBER"),
      test: (pw) => /\d/.test(pw),
    },
    {
      label: t("COMMON.PASSWORD_REQ_SPECIAL"),
      test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const formData = new FormData();
    if (id) formData.append("UserID", parseInt(id, 10));
    formData.append("TenantID", 1);
    formData.append("FirstName", oFormData.firstName || "");
    formData.append("LastName", oFormData.lastName || "");
    formData.append("Email", oFormData.email || "");
    formData.append(
      "Password",
      oFormData.password ? md5(oFormData.password) : ""
    );
    formData.append("PhoneNumber", oFormData.phone || "");
    formData.append("AddressLine", oFormData.streetAddress || "");
    formData.append(
      "CityID",
      oFormData.city ? parseInt(oFormData.city, 10) : 0
    );
    formData.append(
      "StateID",
      oFormData.state ? parseInt(oFormData.state, 10) : 0
    );
    formData.append(
      "CountryID",
      oFormData.country ? parseInt(oFormData.country, 10) : 0
    );
    formData.append("Pincode", oFormData.pincode || "");
    formData.append("RoleID", oFormData.role || "");
    if (nProfileImage) {
      formData.append("ProfileImage", nProfileImage);
    }

    try {
      const oResponse = await apiPost(
      USER_CREATE_OR_UPDATE,
        formData,
        token,
        true
      );
      const resData = oResponse?.data;

      if (resData?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(resData.MESSAGE, STATUS.SUCCESS);
      } else {
        showEmsg(
          resData?.MESSAGE || t("COMMON.FAILED_OPERATION"),
          STATUS.WARNING
        );
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.MESSAGE;
      showEmsg(backendMessage || t("COMMON.ERROR_MESSAGE"), STATUS.ERROR);
    }
  };

  if (fetchUserError) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow text-center text-red text-lg font-semibold">
        {fetchUserError}
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer />
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-gray-500">
            {id ? t("USERS.EDIT_USER_DESCRIPTION") : t("USERS.DESCRIPTION")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div style={{ minWidth: 80, minHeight: 80 }}>
          {bImgLoading && !bImgError && (
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <img
            src={
              !bImgError && nProfileImagePreview
                ? nProfileImagePreview
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
                searchPlaceholder={t('COMMON.SEARCH_ROLE') || 'Search role'}
                onInputChange={(inputValue) => fetchRoles({ searchText: inputValue })}
              />

              {/* Password and Confirm Password side by side */}
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

              {/* Password strength & requirements stay full width */}
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
                      {passwordStrength === "strong"
                        ? t("ADD_USER.PASSWORD_STRONG")
                        : passwordStrength === "medium"
                        ? t("ADD_USER.PASSWORD_MEDIUM")
                        : t("ADD_USER.PASSWORD_WEAK")}
                    </span>
                    <ul
                      style={{
                        margin: "8px 0 0 0",
                        padding: 0,
                        listStyle: "none",
                      }}
                    >
                      {passwordRequirements.map((req, idx) => {
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
          <button type="submit" className="btn-primary">
            {id ? t("COMMON.SAVE_BUTTON") : t("ADD_USER.CREATE_USER")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
