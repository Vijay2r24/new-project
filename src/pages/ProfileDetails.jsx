import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Shield,
  Bell,
  Globe,
  Lock,
  Key,
  CheckCircle,
  XCircle,
  X,
  Store
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import cheGuevaraImg from "../../assets/images/che-guevara.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/ApiUtils";
import { UPDATEUSERPASSWORD } from "../contants/apiRoutes";
import md5 from "md5";
import { PASSWORD_LABELS, PASSWORD_VISIBILITY, STATUS } from "../contants/constants";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../context/TitleContext";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails, clearUserDetailsError } from "../store/slices/allDataSlice";
import {
  passwordRules,
  validatePassword,
  validateNewPassword,
  validateConfirmPassword
} from "../utils/passwordUtils";

const ProfileDetails = () => {
  const { t } = useTranslation();
  const [nModalType, setModalType] = useState(null);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Password states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [error, setError] = useState("");
  const [Ssuccess, setSuccess] = useState("");
  const { setBackButton, setTitle } = useTitle();
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { userDetails, userDetailsLoading, userDetailsError } = useSelector(
    (state) => state.allData
  );

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Clear any previous errors
        dispatch(clearUserDetailsError());
        
        // Fetch user details using Redux thunk
        await dispatch(fetchUserDetails(userId)).unwrap();
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userId]);

  // Map the user data to match your component's expected structure
  const user = userDetails
    ? {
        name: `${userDetails.FirstName} ${userDetails.LastName}`,
        email: userDetails.Email,
        phone: userDetails.PhoneNumber,
        address: userDetails.AddressLine || "",
        city: userDetails.CityName || "",
        state: userDetails.StateName || "",
        zipCode: userDetails.Zipcode || "",
        joinDate: userDetails.CreatedDate || new Date().toISOString(),
        avatar: userDetails.ProfileImageUrl && userDetails.ProfileImageUrl.length > 0 
          ? userDetails.ProfileImageUrl[0].documentUrl 
          : cheGuevaraImg,
        role: userDetails.RoleName || "",
        gender: userDetails.Gender,
        country: userDetails.CountryName,
        employeeId: userDetails.EmployeeID,
        stores: userDetails.Stores || [],
      }
    : null;

  useEffect(() => {
    setTitle(t("HEADER.YOUR_PROFILE"));
  }, [setTitle, t]);

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Reset errors
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    // Validate all fields
    const currentPasswordError = validatePassword(passwordForm.currentPassword, t);
    const newPasswordError = validateNewPassword(passwordForm.newPassword, t);
    const confirmPasswordError = validateConfirmPassword(
      passwordForm.confirmNewPassword,
      passwordForm.newPassword,
      t
    );

    // Check if there are any validation errors
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setPasswordErrors({
        currentPassword: currentPasswordError,
        newPassword: newPasswordError,
        confirmNewPassword: confirmPasswordError,
      });
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const hashedOldPassword = md5(passwordForm.currentPassword).toString();
      const hashedNewPassword = md5(passwordForm.newPassword).toString();
      const hashedConfirmPassword = md5(passwordForm.confirmNewPassword).toString();

      const response = await apiPost(
        UPDATEUSERPASSWORD,
        {
          UserID: userId,
          OldPassword: hashedOldPassword,
          NewPassword: hashedNewPassword,
          ConfirmPassword: hashedConfirmPassword,
        },
        token,
        false
      );

      if (response.data?.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.message, STATUS.SUCCESS);
        setSuccess(response.data.message);
        setModalType(null);
        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setPasswordErrors({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setShowPasswords({ current: false, new: false, confirm: false });
        setError("");
      } else {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS);
        setError(response.data.message);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || t("COMMON.SOMETHING_WENT_WRONG");
      showEmsg(errMsg, STATUS.ERROR);
      setError(errMsg);
    }

    hideLoaderWithDelay(setSubmitting);
  };

  // Check if password form is valid
  const isPasswordFormValid = 
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmNewPassword &&
    !passwordErrors.currentPassword &&
    !passwordErrors.newPassword &&
    !passwordErrors.confirmNewPassword;

  const securityPrefModals = {
    changePassword: {
      title: t("PROFILE.CHANGE_PASSWORD"),
      content: (
        <form className="space-y-4" onSubmit={handleChangePassword}>
          {/* Current Password */}
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("PROFILE.CURRENT_PASSWORD")}
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              placeholder={t("PROFILE.ENTER_CURRENT_PASSWORD")}
              Icon={Key}
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="text-gray-500 hover:text-custom-bg"
                >
                  {showPasswords.current ? "Hide" : "Show"}
                </button>
              }
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("PROFILE.NEW_PASSWORD")}
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? "text" : "password"}
              placeholder={t("PROFILE.ENTER_NEW_PASSWORD")}
              Icon={Lock}
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="text-gray-500 hover:text-custom-bg"
                >
                  {showPasswords.new ? "Hide" : "Show"}
                </button>
              }
            />
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
            )}
            
            {/* Password Rules */}
            <ul className="text-xs mt-2 space-y-1">
              {passwordRules(t).map((rule, idx) => {
                const passed = rule.test(passwordForm.newPassword);
                return (
                  <li key={idx} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passed ? "text-green-600" : "text-gray-500"}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("PROFILE.CONFIRM_NEW_PASSWORD")}
              id="confirmNewPassword"
              name="confirmNewPassword"
              type={showPasswords.confirm ? PASSWORD_LABELS.SHOW : PASSWORD_LABELS.HIDE}
              placeholder={t("PROFILE.CONFIRM_NEW_PASSWORD_PLACEHOLDER")}
              Icon={Lock}
              value={passwordForm.confirmNewPassword}
              onChange={(e) => handlePasswordFieldChange("confirmNewPassword", e.target.value)}
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="text-gray-500 hover:text-custom-bg"
                >
                  {showPasswords.confirm ? PASSWORD_VISIBILITY.HIDE : PASSWORD_VISIBILITY.SHOW}
                </button>
              }
            />
            {passwordErrors.confirmNewPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmNewPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              disabled={!isPasswordFormValid || submitting}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r from-custom-bg to-custom-bg/80 text-white font-medium hover:from-custom-bg/90 hover:to-custom-bg/60 border border-custom-bg/20 ${
                !isPasswordFormValid || submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? t("COMMON.SAVING") : t("COMMON.SAVE")}
            </button>
          </div>
        </form>
      ),
    },
  };

  const handleOpenModal = (type) => setModalType(type);
  const handleCloseModal = () => {
    setModalType(null);
    // Reset password form when closing modal
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowPasswords({ current: false, new: false, confirm: false });
    setError("");
    setSuccess("");
  };
  
  const loaderOverlay = submitting || userDetailsLoading ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;

  if (userDetailsError) return <div>Error: {userDetailsError}</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <div className="max-w-8xl mx-auto mt-2">
      <ToastContainer />
      {loaderOverlay}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-gray-200 bg-white">
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 w-full">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white ring-2 ring-custom-bg/50 transition-all duration-300 group-hover:scale-105">
                <img
                  src={user?.avatar || cheGuevaraImg}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full text-custom-bg hover:bg-sky-50 transition-all duration-200 border border-custom-bg hover:scale-110">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between w-full">
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.name}
                </h1>
                <p className="mt-1 text-gray-900 font-medium">{user?.role}</p>
                <p className="mt-2 text-sm text-gray-600 flex items-center justify-center md:justify-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-custom-bg/60 mr-2"></span>
                  {t("PROFILE.MEMBER_SINCE")}{" "}
                  {new Date(user?.joinDate).toLocaleDateString()}
                </p>
                {user?.stores && user.stores.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {t("PROFILE.ASSIGNED_STORES")}: {user.stores.map(store => store.StoreName).join(", ")}
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <button
                  className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-custom-bg to-custom-bg/80 text-white font-medium hover:from-custom-bg/90 hover:to-custom-bg/60"
                  onClick={() => navigate(`/editUser/${userId}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("PROFILE.EDIT_PROFILE")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-caption text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {securityPrefModals[nModalType].title}
            </h2>
            {securityPrefModals[nModalType].content}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("PROFILE.PERSONAL_INFORMATION")}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <User className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.FULL_NAME")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Mail className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.EMAIL_ADDRESS")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Phone className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.PHONE_NUMBER")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">{user?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <User className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.GENDER")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">{user?.gender}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.MEMBER_SINCE")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">
                      {new Date(user?.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <User className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {t("PROFILE.EMPLOYEE_ID")}
                    </p>
                    <p className="mt-1 text-base text-gray-900">{user?.employeeId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("PROFILE.ADDRESS_INFO")}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-custom-bg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("PROFILE.STREET_ADDRESS")}
                  </p>
                  <p className="mt-1 text-base text-gray-900">{user?.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("PROFILE.CITY")}
                  </p>
                  <p className="mt-1 text-base text-gray-900">{user?.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("PROFILE.STATE")}
                  </p>
                  <p className="mt-1 text-base text-gray-900">{user?.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("PROFILE.ZIP_CODE")}
                  </p>
                  <p className="mt-1 text-base text-gray-900">{user?.zipCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("PROFILE.COUNTRY")}
                  </p>
                  <p className="mt-1 text-base text-gray-900">{user?.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">

          {/* Store Details Section - Replaced Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("PROFILE.STORE_DETAILS")}
              </h2>
            </div>
            <div className="p-6">
              {user?.stores && user.stores.length > 0 ? (
                <div 
                  className={`space-y-4 ${
                    user.stores.length > 5 
                      ? 'max-h-80 overflow-y-auto pr-2' 
                      : ''
                  }`}
                >
                  {/* Custom scrollbar styling */}
                  <style jsx>{`
                    .max-h-80::-webkit-scrollbar {
                      width: 6px;
                    }
                    .max-h-80::-webkit-scrollbar-track {
                      background: #f1f5f9;
                      border-radius: 3px;
                    }
                    .max-h-80::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 3px;
                    }
                    .max-h-80::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                  `}</style>
                  
                  {user.stores.map((store, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-custom-bg/10 rounded-lg">
                        <Store className="h-4 w-4 text-custom-bg" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{store.StoreName}</h3>
                        {store.StoreAddress && (
                          <p className="text-xs text-gray-600 mt-1">{store.StoreAddress}</p>
                        )}
                        {store.StorePhone && (
                          <p className="text-xs text-gray-600 mt-1">{store.StorePhone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {t("PROFILE.NO_STORES_ASSIGNED")}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("PROFILE.SECURITY_SETTINGS")}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => handleOpenModal("changePassword")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20">
                    <Key className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t("PROFILE.CHANGE_PASSWORD")}
                  </span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-caption" />
              </button>
              <button
                onClick={() => handleOpenModal("twoFactor")}
                disabled
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl group cursor-not-allowed opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg">
                    <Shield className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t("PROFILE.TWO_FACTOR_AUTH")}
                  </span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleOpenModal("privacy")}
                disabled
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl group cursor-not-allowed opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg">
                    <User className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t("PROFILE.PRIVACY_SETTINGS")}
                  </span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;