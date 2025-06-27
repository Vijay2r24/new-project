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
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../utils/ApiUtils";
import { getUserById, userCreateOrUpdate } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { LocationDataContext } from "../context/LocationDataProvider";
import { useTitle } from "../context/TitleContext";
import { useRoles } from "../context/AllDataContext";
import { STATUS } from "../contants/constants";
import md5 from "md5";

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
  useEffect(() => {
    setTitle(id ? t("users.edit_user", "Update User") : t("users.add_new_user", "Add New User"));
    setBackButton(
      <button
        onClick={() => window.history.back()}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-2"
      >
        <ArrowLeft className="h-5 w-5 text-gray-500" />
      </button>
    );
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, id]);
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
          const oResponse = await apiGet(`${getUserById}/${id}`, {}, token);
          const resData = oResponse.data;

          if (
            resData &&
            resData.STATUS === STATUS.SUCCESS_1 &&
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
            setFetchUserError(resData?.MESSAGE || t("common.failedOperation"));
          }
        } catch (error) {
          const backendMessage = error?.response?.data?.MESSAGE;
          setFetchUserError(backendMessage || t("common.errorMessage"));
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
      setImgLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!oFormData.firstName)
      newErrors.firstName = t("addUser.validation.firstName");
    if (!oFormData.lastName)
      newErrors.lastName = t("addUser.validation.lastName");
    if (!oFormData.email)
      newErrors.email = t("addUser.validation.email");
    if (!oFormData.phone)
      newErrors.phone = t("addUser.validation.phone");
    if (oFormData.phone && oFormData.phone.replace(/\D/g, '').length !== 10)
      newErrors.phone = t("addUser.validation.phoneLength");
    if (!oFormData.password)
      newErrors.password = t("addUser.validation.password");
    if (!oFormData.confirmPassword)
      newErrors.confirmPassword = t("addUser.validation.confirmPassword");
    if (id && (oFormData.password || oFormData.confirmPassword)) {
      if (!oFormData.password)
        newErrors.password = t("addUser.validation.password");
      if (!oFormData.confirmPassword)
        newErrors.confirmPassword = t("addUser.validation.confirmPassword");
      if (oFormData.password !== oFormData.confirmPassword)
        newErrors.confirmPassword = t("addUser.validation.passwordMatch");
    }
    if (oFormData.password && oFormData.confirmPassword && oFormData.password !== oFormData.confirmPassword)
      newErrors.confirmPassword = t("addUser.validation.passwordMatch");
    if (!oFormData.role)
      newErrors.role = t("addUser.validation.role");
    if (!oFormData.streetAddress)
      newErrors.streetAddress = t("addUser.validation.streetAddress");
    if (!oFormData.country)
      newErrors.country = t("addUser.validation.country");
    if (!oFormData.state)
      newErrors.state = t("addUser.validation.state");
    if (!oFormData.city)
      newErrors.city = t("addUser.validation.city");
    const passwordStrength = getPasswordStrength(oFormData.password);
    if (oFormData.password && passwordStrength !== "strong") {
      newErrors.password = t("addUser.validation.strongPassword");
    }
    return newErrors;
  };

  const getPasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password) return null;
    if (strongRegex.test(password)) return "strong";
    if (password.length >= 6) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(oFormData.password);

  const passwordRequirements = [
    {
      label: t("addUser.passwordReqLength"),
      test: (pw) => pw.length >= 8,
    },
    {
      label: t("addUser.passwordReqUpper"),
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: t("addUser.passwordReqLower"),
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: t("addUser.passwordReqNumber"),
      test: (pw) => /\d/.test(pw),
    },
    {
      label: t("addUser.passwordReqSpecial"),
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
    formData.append("Password", oFormData.password ? md5(oFormData.password) : "");
    formData.append("PhoneNumber", oFormData.phone || "");
    formData.append("AddressLine", oFormData.streetAddress || "");
    formData.append("CityID", oFormData.city ? parseInt(oFormData.city, 10) : 0);
    formData.append("StateID", oFormData.state ? parseInt(oFormData.state, 10) : 0);
    formData.append("CountryID", oFormData.country ? parseInt(oFormData.country, 10) : 0);
    formData.append("Pincode", oFormData.pincode || "");
    formData.append("RoleID", oFormData.role || "");
    if (nProfileImage) {
      formData.append("ProfileImage", nProfileImage);
    }
    if (id) {
      formData.append("UpdatedBy", parseInt(userId, 10));
    } else {
      formData.append("CreatedBy", parseInt(userId, 10));
    }

    try {
      const oResponse = await apiPost(
        userCreateOrUpdate,
        formData,
        token,
        true
      );
      const resData = oResponse?.data;

      if (resData?.STATUS === STATUS.SUCCESS_1) {
        showEmsg(resData.MESSAGE, "success");
      } else {
        showEmsg(resData?.MESSAGE || t("common.failedOperation"), "error");
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.MESSAGE;
      showEmsg(backendMessage || t("common.errorMessage"), "error");
    }
  };

  if (fetchUserError) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow text-center text-red-600 text-lg font-semibold">
        {fetchUserError}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-gray-500">
            {id ? t("users.edit_user_description") : t("users.description")}
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
                : "../../assets/images/download.jpg"
            }
            alt={t("addUser.profile_preview")}
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
            {t("addUser.profile_image")}
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
            {t("common.upload")}
          </label>

          <p className="text-xs text-gray-400 mt-1">
            {t("addUser.image_upload_note")}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("addUser.personal_info")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t("addUser.first_name")}
                id="firstName"
                name="firstName"
                value={oFormData.firstName}
                onChange={handleChange}
                placeholder={t("addUser.enter_first_name")}
                Icon={User}
                error={oErrors.firstName}
              />
              <TextInputWithIcon
                label={t("addUser.last_name")}
                id="lastName"
                name="lastName"
                value={oFormData.lastName}
                onChange={handleChange}
                placeholder={t("addUser.enter_last_name")}
                Icon={User}
                error={oErrors.lastName}
              />
              <TextInputWithIcon
                label={t("addUser.email_address")}
                id="email"
                name="email"
                value={oFormData.email}
                onChange={handleChange}
                placeholder={t("addUser.enter_email")}
                Icon={Mail}
                type="email"
                error={oErrors.email}
              />
              <TextInputWithIcon
                label={t("addUser.phone_number")}
                id="phone"
                name="phone"
                value={oFormData.phone}
                onChange={handleChange}
                placeholder={t("addUser.enter_phone")}
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
              {t("addUser.account_security")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t("addUser.password")}
                id="password"
                name="password"
                value={oFormData.password}
                onChange={handleChange}
                placeholder={t("addUser.enter_password")}
                Icon={Lock}
                type="password"
                error={oErrors.password}
              />
              {typeof oFormData.password === "string" && oFormData.password.length > 0 && (
                <div style={{ marginTop: 4 }}>
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
                      ? t("addUser.passwordStrong")
                      : passwordStrength === "medium"
                      ? t("addUser.passwordMedium")
                      : t("addUser.passwordWeak")}
                  </span>
                  <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                    {passwordRequirements.map((req, idx) => {
                      const passed = req.test(oFormData.password);
                      return (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', color: passed ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 2 }}>
                          {passed ? (
                            <CheckCircle size={16} color="#16a34a" style={{ marginRight: 6 }} />
                          ) : (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: 6 }} />
                          )}
                          {req.label}
                        </li>
                      );
                    })}
                  </ul>
                  {passwordStrength !== "strong" && (
                    <div style={{ color: "#dc2626", fontSize: 12, marginTop: 2 }}>
                      {t("addUser.passwordSuggestion")}
                    </div>
                  )}
                </div>
              )}
              <TextInputWithIcon
                label={t("addUser.confirm_password")}
                id="confirmPassword"
                name="confirmPassword"
                value={oFormData.confirmPassword}
                onChange={handleChange}
                placeholder={t("addUser.confirm_password")}
                Icon={Lock}
                type="password"
                error={oErrors.confirmPassword}
              />
              <SelectWithIcon
                label={t("addUser.user_role")}
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
                  rolesLoading ? t("common.loading") : t("addUser.select_role")
                }
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("addUser.address_info")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <TextInputWithIcon
              label={t("addUser.street_address")}
              id="streetAddress"
              name="streetAddress"
              value={oFormData.streetAddress}
              onChange={handleChange}
              placeholder={t("addUser.enter_street_address")}
              Icon={MapPin}
              error={oErrors.streetAddress}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label={t("createStore.country")}
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
                  label={t("createStore.state")}
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
                  label={t("createStore.city")}
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
                label={t("addUser.pincode")}
                id="pincode"
                name="pincode"
                value={oFormData.pincode}
                onChange={handleChange}
                placeholder={t("addUser.enter_pincode")}
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
            {t("addUser.cancel")}
          </button>
          <button type="submit" className="btn-primary">
            {id ? t("common.saveButton") : t("addUser.create_user")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
