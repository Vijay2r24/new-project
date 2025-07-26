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
} from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import cheGuevaraImg from "../../assets/images/che-guevara.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/ApiUtils";
import { UPDATEUSERPASSWORD } from "../contants/apiRoutes";
import md5 from "md5";
import { STATUS } from "../contants/constants";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import { X } from "lucide-react";
import { useTitle } from "../context/TitleContext";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { useUserDetails } from "../../src/context/AllDataContext";

const ProfileDetails = () => {
  const { t } = useTranslation();
  const [nModalType, setModalType] = useState(null);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
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
  const [error, setError] = useState("");
  const [Ssuccess, setSuccess] = useState("");
  const { setBackButton, setTitle } = useTitle();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const userId = 1;
 const { data: userDetails, fetch: fetchUserDetails } = useUserDetails();
const [state, setState] = useState({
  userDetails: null,
  userDetailsError: null,
});

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userDetails");
      if (!state.userDetails && storedUser) {
        setState((prev) => ({
          ...prev,
          userDetails: JSON.parse(storedUser),
        }));
      }
      await fetchUserDetails(userId, token);
    } catch (err) {
      setFetchError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [fetchUserDetails, userId]);

const user = userDetails?.user
  ? {
      name: `${userDetails.user.FirstName} ${userDetails.user.LastName}`,
      email: userDetails.user.Email,
      phone: userDetails.user.PhoneNumber,
      address: userDetails.user.AddressLine || "",
      city: userDetails.user.CityName || "",
      state: userDetails.user.StateName || "",
      zipCode: userDetails.user.Pincode || "",
      joinDate: userDetails.user.CreatedDate || new Date().toISOString(),
      avatar: userDetails.user.ProfileImageUrl || cheGuevaraImg,
      role: userDetails.user.RoleName || "",
      gender: userDetails.user.Gender,
      country: userDetails.user.CountryName,
      employeeId: userDetails.user.UserEmployeeID,
    }
  : null;


  useEffect(() => {
    setTitle(t("HEADER.YOUR_PROFILE"));
  }, [setTitle, t]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setSubmitting(true);

    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };

    let hasError = false;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t("PROFILE.CURRENT_PASSWORD_REQUIRED");
      hasError = true;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t("PROFILE.NEW_PASSWORD_REQUIRED");
      hasError = true;
    }

    if (!passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = t("PROFILE.CONFIRM_NEW_PASSWORD_REQUIRED");
      hasError = true;
    }

    if (
      passwordForm.newPassword &&
      passwordForm.confirmNewPassword &&
      passwordForm.newPassword !== passwordForm.confirmNewPassword
    ) {
      errors.confirmNewPassword = t("PROFILE.PASSWORDS_DO_NOT_MATCH");
      hasError = true;
    }

    if (hasError) {
      setPasswordErrors(errors);
      hideLoaderWithDelay(setSubmitting);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const hashedOldPassword = md5(passwordForm.currentPassword).toString();
      const hashedNewPassword = md5(passwordForm.newPassword).toString();
      const hashedConfirmPassword = md5(
        passwordForm.confirmNewPassword
      ).toString();

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

      if (response.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS);
        setSuccess(response.data.MESSAGE);
        setModalType(null);
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
        setError("");
      } else {
        showEmsg(response.data.MESSAGE, STATUS.SUCCESS);
        setError(response.data.MESSAGE);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.MESSAGE || t("COMMON.SOMETHING_WENT_WRONG");
      showEmsg(errMsg, STATUS.ERROR);
      setError(errMsg);
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
    }

    hideLoaderWithDelay(setSubmitting);
  };

  const securityPrefModals = {
    changePassword: {
      title: t("PROFILE.CHANGE_PASSWORD"),
      content: (
        <form className="space-y-4" onSubmit={handleChangePassword}>
          <div>
            <TextInputWithIcon
              label={t("PROFILE.CURRENT_PASSWORD")}
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder={t("PROFILE.ENTER_CURRENT_PASSWORD")}
              Icon={Key}
              value={passwordForm.currentPassword}
              onChange={(e) => {
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                });
                if (passwordErrors.currentPassword) {
                  setPasswordErrors((prev) => ({
                    ...prev,
                    currentPassword: "",
                  }));
                }
              }}
              error={passwordErrors.currentPassword}
            />
          </div>
          <div>
            <TextInputWithIcon
              label={t("PROFILE.NEW_PASSWORD")}
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={t("PROFILE.ENTER_NEW_PASSWORD")}
              Icon={Lock}
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                });
                if (passwordErrors.newPassword) {
                  setPasswordErrors((prev) => ({
                    ...prev,
                    newPassword: "",
                  }));
                }
              }}
              error={passwordErrors.newPassword}
            />
          </div>
          <div>
            <TextInputWithIcon
              label={t("PROFILE.CONFIRM_NEW_PASSWORD")}
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              placeholder={t("PROFILE.CONFIRM_NEW_PASSWORD_PLACEHOLDER")}
              Icon={Lock}
              value={passwordForm.confirmNewPassword}
              onChange={(e) => {
                setPasswordForm({
                  ...passwordForm,
                  confirmNewPassword: e.target.value,
                });
                if (passwordErrors.confirmNewPassword) {
                  setPasswordErrors((prev) => ({
                    ...prev,
                    confirmNewPassword: "",
                  }));
                }
              }}
              error={passwordErrors.confirmNewPassword}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-custom-bg to-custom-bg/80 text-white font-medium hover:from-custom-bg/90 hover:to-custom-bg/60 border border-custom-bg/20"
            >
              {t("COMMON.SAVE")}
            </button>
          </div>
        </form>
      ),
    },
  };

  const handleOpenModal = (type) => setModalType(type);
  const handleCloseModal = () => setModalType(null);
  const loaderOverlay = submitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;
  if (fetchError) return <div>Error: {fetchError}</div>;
  if (!user) return <div>No user data found</div>;

  return (
    <div className="max-w-7xl mx-auto mt-5">
      <ToastContainer />
      {loaderOverlay}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-custom-bg/30">
        <div className="absolute inset-0 bg-gradient-to-br from-custom-bg/40 via-white to-custom-bg/20" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-custom-bg/30 via-transparent to-custom-bg/10" />

        <div className="absolute top-0 right-0 w-72 h-72 bg-custom-bg/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-custom-bg/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-custom-bg to-custom-bg/80 bg-clip-text text-gray-900">
                  {user?.name}
                </h1>
                <p className="mt-1 text-gray-900 font-medium">{user?.role}</p>
                <p className="mt-2 text-sm text-text-gray-900/80 flex items-center justify-center md:justify-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-custom-bg/60 mr-2"></span>
                  {t("PROFILE.MEMBER_SINCE")}{" "}
                  {new Date(user?.joinDate).toLocaleDateString()}
                </p>
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
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("PROFILE.PREFERENCES")}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => handleOpenModal("notifications")}
                disabled
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl group cursor-not-allowed opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg">
                    <Bell className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t("PROFILE.NOTIFICATION_SETTINGS")}
                  </span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleOpenModal("language")}
                disabled
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl group cursor-not-allowed opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg">
                    <Globe className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t("PROFILE.LANGUAGE_REGION")}
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