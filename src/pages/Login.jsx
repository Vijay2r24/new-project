import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ShoppingBag,
  Settings,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Shield,
  CheckCircle,
  XCircle,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TextInputWithIcon from "../components/TextInputWithIcon";
import { useTranslation } from "react-i18next";
import md5 from "md5";
import { apiPost, apiGet } from "../utils/ApiUtils";
import {
  LOGIN,
  FORGOT_USER_PASSWORD,
  VALIDATE_UPDATE_PASSWORD,
  VALIDATE_OTP,
  GET_ALL_PERMISSIONS,
  GET_USER_BY_ID,
} from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { STATUS, TOAST_DURATION } from "../contants/constants";
import { useUserDetails } from "../../src/context/AllDataContext";
import { useDispatch } from "react-redux";
import { 
  passwordRules, 
  validatePassword, 
  validateNewPassword, 
  validateConfirmPassword 
} from "../utils/passwordUtils";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bShowPassword, setShowPassword] = useState(false);

  const [oFormData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [sError, setError] = useState({
    email: "",
    password: "",
    submit: "",
  });

  const [sCurrentView, setCurrentView] = useState("login");
  const [sForgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [sOtp, setOtp] = useState("");
  const [bShowOtpDialog, setbShowOtpDialog] = useState(false);
  const [nTimerCount, setTimerCount] = useState(60);
  const [bTimerActive, setTimerActive] = useState(false);
  const [bResendEnabled, setResendEnabled] = useState(false);
  const [sNewPassword, setNewPassword] = useState("");
  const [sConfirmPassword, setConfirmPassword] = useState("");
  const [bShowNewPassword, setShowNewPassword] = useState(false);
  const [bShowConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { fetchUserDetails } = useUserDetails();

  const validateEmail = (email) => {
    if (!email.trim()) return t("LOGIN.ERRORS.EMAIL_REQUIRED");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t("LOGIN.ERRORS.EMAIL_INVALID");
    return "";
  };

  const handleChange = (field, value) => {
    let fieldError = "";
    let updatedFormData = { ...oFormData };
    
    if (field === "phone") {
      value = value.replace(/\D/g, "");
    }

    if (sCurrentView === "login") {
      updatedFormData = { ...oFormData, [field]: value };
      setFormData(updatedFormData);
      if (field === "email") {
        fieldError = validateEmail(value);
      } else if (field === "password") {
        fieldError = validatePassword(value, t);
      }
    } else if (sCurrentView === "forgotPassword" && field === "email") {
      setForgotPasswordEmail(value);
      fieldError = validateEmail(value);
    } else if (sCurrentView === "resetPassword") {
      if (field === "newPassword") {
        setNewPassword(value);
        fieldError = validateNewPassword(value, t);
        setError((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(sConfirmPassword, value, t),
        }));
      } else if (field === "confirmPassword") {
        setConfirmPassword(value);
        fieldError = validateConfirmPassword(value, sNewPassword, t);
      }
    }

    setError((prev) => ({ ...prev, [field]: fieldError, submit: "" }));
  };

  const fetchUserDetailsDirectly = async (userId, token) => {
    try {
      const response = await apiGet(`${GET_USER_BY_ID}/${userId}`, {}, token);
    
      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        const userData = response.data.data;
        localStorage.setItem("userDetails", JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(response?.data?.message || "Failed to fetch user details");
      }
    } catch (err) {
      localStorage.removeItem("userDetails");
      throw err;
    }
  };

  const loginUser = async () => {
    const emailError = validateEmail(oFormData.email);
    const passwordError = validatePassword(oFormData.password, t);

    if (emailError || passwordError) {
      setError((prev) => ({
        ...prev,
        email: emailError,
        password: passwordError,
      }));
      return;
    }

    setError((prev) => ({ ...prev, email: "", password: "" }));
    setSubmitting(true);

    try {
      const hashedPassword = md5(oFormData.password);

      const oResponse = await apiPost(
        LOGIN,
        {
          Email: oFormData.email,
          Password: hashedPassword,
        },
        null,
        false
      );

      const data = oResponse?.data?.data;
      const message = oResponse?.data?.message;
      const status = oResponse?.data?.status;

      if (
        data?.token &&
        data?.UserID &&
        status === STATUS.SUCCESS.toUpperCase()
      ) {
        showEmsg(message, STATUS.SUCCESS, TOAST_DURATION.SHORT, async () => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.UserID);
          localStorage.setItem("tenantID", data.TenantID);
          localStorage.setItem(
            "PermissionIDs",
            JSON.stringify(data.PermissionIDs || [])
          );

          try {
            const token = data.token;
            const permResponse = await apiGet(GET_ALL_PERMISSIONS, {}, token);
            if (permResponse?.data?.status === STATUS.SUCCESS.toUpperCase()) {
              localStorage.setItem(
                "AllPermissions",
                JSON.stringify(permResponse.data.data)
              );
            }
          } catch (e) {
          }

          try {
            if (fetchUserDetails) {
              await fetchUserDetails(data.UserID, data.token);
            } else {
              await fetchUserDetailsDirectly(data.UserID, data.token);
            }
          } catch (error) {
          }
          navigate("/dashboard");
        });
      } else {
        const fallbackMessage = t("LOGIN.ERRORS.INVALID_CREDENTIALS");
        setError((prev) => ({ ...prev, submit: fallbackMessage }));
        showEmsg(message || fallbackMessage, STATUS.WARNING);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || t("LOGIN.ERRORS.INVALID_CREDENTIALS");
      setError((prev) => ({ ...prev, submit: errorMessage }));
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleForgotPasswordClick = () => {
    setCurrentView("forgotPassword");
    setError({
      email: "",
      password: "",
      submit: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSendOtp = async () => {
    const emailError = validateEmail(sForgotPasswordEmail);
    if (emailError) {
      setError((prev) => ({ ...prev, email: emailError }));
      return;
    }
    setSubmitting(true);
    try {
      const oPayload = { email: sForgotPasswordEmail };
      const oResponse = await apiPost(
        `${FORGOT_USER_PASSWORD}`,
        oPayload,
        null,
        false
      );
      const message = oResponse?.data?.message;
      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(message, STATUS.SUCCESS);
        setbShowOtpDialog(true);
        setTimerCount(60);
        setTimerActive(true);
        setResendEnabled(false);
        setOtp("");
        setError({ email: "", password: "", submit: "" });
      } else {
        showEmsg(message, STATUS.WARNING);
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message;
      showEmsg(errMsg || t("OTP.ERROR"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleVerifyOtp = async () => {
    if (!sOtp.trim()) {
      setError((prev) => ({ ...prev, otp: t("LOGIN.ERRORS.OTP_REQUIRED") }));
      return;
    }
    if (sOtp.length !== 6) {
      setError((prev) => ({
        ...prev,
        otp: t("LOGIN.ERRORS.OTP_INVALID_LENGTH"),
      }));
      return;
    }

    setSubmitting(true);
    try {
      const oPayload = {
        email: sForgotPasswordEmail,
        OTP: Number(sOtp),
      };
      const oResponse = await apiPost(VALIDATE_OTP, oPayload, null, false);
      const message = oResponse?.data?.message;

      if (
        oResponse.data &&
        oResponse.data.status === STATUS.SUCCESS.toUpperCase()
      ) {
        showEmsg(message, STATUS.SUCCESS);
        setbShowOtpDialog(false);
        setTimerActive(false);
        setOtp("");
        setCurrentView("resetPassword");
        setError({
          email: "",
          password: "",
          submit: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errMsg = message || t("LOGIN.ERRORS.OTP_INVALID");
        showEmsg(message || errMsg, STATUS.WARNING);
        setError((prev) => ({ ...prev, otp: message }));
        setOtp("");
      }
    } catch (error) {
      const errMsg = error?.response?.data?.MESSAGE;
      showEmsg(errMsg, STATUS.ERROR);
      setError((prev) => ({ ...prev, otp: errMsg }));
      setOtp("");
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleOtpInputChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) {
      setError((prev) => ({ ...prev, otp: "OTP must only contain digits." }));
      return;
    }
    setError((prev) => ({ ...prev, otp: "" }));
    const newOtp = sOtp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpInputKeyDown = (index, e) => {
    if (e.key === "Backspace" && sOtp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePasswordReset = async () => {
    const newPasswordError = validateNewPassword(sNewPassword, t);
    const confirmPasswordError = validateConfirmPassword(
      sConfirmPassword,
      sNewPassword,
      t
    );
    if (newPasswordError || confirmPasswordError) {
      setError((prev) => ({
        ...prev,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      }));
      return;
    }
    setSubmitting(true);
    try {
      const hashedNewPassword = md5(sNewPassword);
      const hashedConfirmPassword = md5(sConfirmPassword);
      const oPayload = {
        email: sForgotPasswordEmail,
        NewPassword: hashedNewPassword,
        ConfirmPassword: hashedConfirmPassword,
      };
      const oResponse = await apiPost(
        VALIDATE_UPDATE_PASSWORD,
        oPayload,
        null,
        false
      );
      const message = oResponse?.data?.message;
      if (
        oResponse.data &&
        oResponse.data.status === STATUS.SUCCESS.toUpperCase()
      ) {
        showEmsg(message, STATUS.SUCCESS);
        setCurrentView("login");
        setForgotPasswordEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setError({
          email: "",
          password: "",
          submit: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showEmsg(
          message || t("LOGIN.ERRORS.PASSWORD_RESET_FAILED"),
          STATUS.WARNING
        );
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message;
      showEmsg(errMsg || t("LOGIN.ERRORS.PASSWORD_RESET_FAILED"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  useEffect(() => {
    let timer;
    if (bTimerActive && nTimerCount > 0) {
      timer = setTimeout(() => {
        setTimerCount((prevCount) => prevCount - 1);
      }, 1000);
    } else if (!bTimerActive || nTimerCount === 0) {
      setTimerActive(false);
      setResendEnabled(true);
    }
    return () => clearTimeout(timer);
  }, [bTimerActive, nTimerCount]);

  const renderLogin = () => {
    const isLoginDisabled =
      !oFormData.email ||
      !oFormData.password ||
      !!sError.email ||
      !!sError.password;
    return (
      <>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            {t("LOGIN.TITLE")}
          </h2>
          <p className="text-sm text-muted">{t("LOGIN.SUBTITLE")}</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("LOGIN.EMAIL")}
              id="email"
              name="email"
              type="email"
              placeholder={t("LOGIN.EMAIL_PLACEHOLDER")}
              value={oFormData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              Icon={Mail}
              required
            />
            {sError.email && (
              <p className="text-sm text-red-500 mt-1">{sError.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("LOGIN.PASSWORD")}
              id="password"
              name="password"
              type={bShowPassword ? "text" : "password"}
              placeholder={t("LOGIN.PASSWORD_PLACEHOLDER")}
              value={oFormData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              Icon={Lock}
              required
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-500 hover:text-custom-bg"
                  aria-label={bShowPassword ? "Hide password" : "Show password"}
                >
                  {bShowPassword ? "Hide" : "Show"}
                </button>
              }
            />
            {sError.password && (
              <p className="text-sm text-red-500 mt-1">{sError.password}</p>
            )}
          </div>
          <div className="text-sm text-right">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-custom-bg hover:underline hover:text-red-500 transition-all duration-200"
            >
              {t("LOGIN.FORGOT_PASSWORD")}
            </button>
          </div>
          <button
            type="button"
            onClick={loginUser}
            className={`w-full py-2 px-4 rounded-md transition-colors duration-200 bg-custom-bg text-white ${
              isLoginDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-custom-bg-dark"
            }`}
            disabled={isLoginDisabled}
          >
            {t("LOGIN.LOGIN_BUTTON")}
          </button>
        </div>
      </>
    );
  };

  const renderForgotPassword = () => {
    const isSendOtpDisabled = !sForgotPasswordEmail || !!sError.email;
    return (
      <>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            {t("LOGIN.FORGOT_PASSWORD_TITLE")}
          </h2>
          <p className="text-sm text-muted">
            {t("LOGIN.FORGOT_PASSWORD_SUBTITLE")}
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("LOGIN.EMAIL")}
              id="forgotPasswordEmail"
              name="forgotPasswordEmail"
              type="email"
              placeholder={t("LOGIN.EMAIL_PLACEHOLDER")}
              value={sForgotPasswordEmail}
              onChange={(e) => handleChange("email", e.target.value)}
              Icon={Mail}
              required
            />
            {sError.email && (
              <p className="text-sm text-red-500 mt-1">{sError.email}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSendOtp}
              className={`w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md transition-colors duration-200 ${
                isSendOtpDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-custom-bg-dark"
              }`}
              disabled={isSendOtpDisabled}
            >
              {t("LOGIN.SEND_OTP_BUTTON")}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("login")}
              className="w-1/2 text-custom-bg border border-custom-bg py-2 px-4 rounded-md hover:bg-custom-bg/10 transition-colors duration-200"
            >
              {t("COMMON.CANCEL")}
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderResetPassword = () => {
    const isResetDisabled =
      !sNewPassword ||
      !sConfirmPassword ||
      !!sError.newPassword ||
      !!sError.confirmPassword;
    return (
      <>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            {t("RESET_PASSWORD.TITLE")}
          </h2>
          <p className="text-sm text-muted">{t("RESET_PASSWORD.SUBTITLE")}</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("RESET_PASSWORD.NEW_PASSWORD")}
              id="newPassword"
              name="newPassword"
              type={bShowNewPassword ? "text" : "password"}
              placeholder={t("RESET_PASSWORD.NEW_PASSWORD_PLACEHOLDER")}
              value={sNewPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              Icon={Lock}
              required
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="text-gray-500 hover:text-custom-bg"
                  aria-label={
                    bShowNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {bShowNewPassword ? "Hide" : "Show"}
                </button>
              }
            />
            {sError.newPassword && (
              <p className="text-sm text-red-500 mt-1">{sError.newPassword}</p>
            )}
            <ul className="text-xs mt-2 space-y-1">
              {passwordRules(t).map((rule, idx) => {
                const passed = rule.test(sNewPassword);
                return (
                  <li key={idx} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span
                      className={passed ? "text-green-600" : "text-gray-500"}
                    >
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="space-y-1">
            <TextInputWithIcon
              label={t("RESET_PASSWORD.CONFIRM_PASSWORD")}
              id="confirmPassword"
              name="confirmPassword"
              type={bShowConfirmPassword ? "text" : "password"}
              placeholder={t("RESET_PASSWORD.CONFIRM_PASSWORD_PLACEHOLDER")}
              value={sConfirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              Icon={Lock}
              required
              inputSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="text-gray-500 hover:text-custom-bg"
                  aria-label={
                    bShowConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {bShowConfirmPassword ? "Hide" : "Show"}
                </button>
              }
            />
            {sError.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {sError.confirmPassword}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePasswordReset}
              className={`w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md transition-colors duration-200 ${
                isResetDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-custom-bg-dark"
              }`}
              disabled={isResetDisabled}
            >
              {t("RESET_PASSWORD.RESET_BUTTON")}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("login")}
              className="w-1/2 text-custom-bg border border-custom-bg py-2 px-4 rounded-md hover:bg-custom-bg/10 transition-colors duration-200"
            >
              {t("COMMON.CANCEL")}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <ToastContainer />
      {submitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-custom-bg to-blue-100">
        <div className="hidden lg:flex flex-col justify-center items-center px-12 bg-custom-bg/50 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 bg-repeat opacity-20"
            style={{ backgroundImage: 'url("/path/to/subtle-pattern.png")' }}
          ></div>
          <div className="text-center max-w-md animate-fade-in z-10 relative">
            <Settings className="w-14 h-14 text-white mb-6 mx-auto drop-shadow-md" />
            <h1
              className="text-4xl font-bold mb-5 leading-tight drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: t("ADMIN.TITLE") }}
            />
            <p className="text-white/90 text-lg mb-10 drop-shadow-sm">
              {t("ADMIN.DESCRIPTION")}
            </p>
            <div className="grid grid-cols-1 gap-4 text-left text-sm mt-8">
              <div className="flex items-center space-x-3 drop-shadow-sm">
                <Package className="h-5 w-5 text-white" />
                <span>{t("ADMIN.FEATURES.PRODUCT")}</span>
              </div>
              <div className="flex items-center space-x-3 drop-shadow-sm">
                <ShoppingCart className="h-5 w-5 text-white" />
                <span>{t("ADMIN.FEATURES.ORDER")}</span>
              </div>
              <div className="flex items-center space-x-3 drop-shadow-sm">
                <Users className="h-5 w-5 text-white" />
                <span>{t("ADMIN.FEATURES.USER_ROLE")}</span>
              </div>
              <div className="flex items-center space-x-3 drop-shadow-sm">
                <BarChart2 className="h-5 w-5 text-white" />
                <span>{t("ADMIN.FEATURES.ANALYTICS")}</span>
              </div>
              <div className="flex items-center space-x-3 drop-shadow-sm">
                <Shield className="h-5 w-5 text-white" />
                <span>{t("ADMIN.FEATURES.SECURITY")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl border border-custom-bg/30 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(255,90,95,0.35)] transition-all hover:scale-[1.02]">
            {sCurrentView === "login" && renderLogin()}
            {sCurrentView === "forgotPassword" && renderForgotPassword()}
            {sCurrentView === "resetPassword" && renderResetPassword()}
          </div>
        </div>
        {bShowOtpDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {t("OTP_DIALOG.TITLE")}
                </h3>
                <h4 className="text-lg font-medium text-gray-700 mb-1">
                  {t("OTP_DIALOG.SUBTITLE")}
                </h4>
                <p className="text-secondary">{t("OTP_DIALOG.INSTRUCTION")}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-custom-bg" />
                  <span className="text-gray-700 text-sm font-medium">
                    {sForgotPasswordEmail}
                  </span>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-gray-100"
                    title={t("COMMON.EDIT")}
                    onClick={() => {
                      setbShowOtpDialog(false);
                      setCurrentView("forgotPassword");
                    }}
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-150"
                      value={sOtp[index] || ""}
                      onChange={(e) =>
                        handleOtpInputChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpInputKeyDown(index, e)}
                    />
                  ))}
              </div>

              {sError.otp && (
                <p className="text-sm text-red-500 text-center mb-4">
                  {sError.otp}
                </p>
              )}

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className={`w-1/2 bg-custom-bg text-white py-2 rounded-md transition-colors duration-200 ${
                    !sOtp || sOtp.length !== 6
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-custom-bg-dark"
                  }`}
                  disabled={!sOtp || sOtp.length !== 6}
                >
                  {t("OTP_DIALOG.VERIFY_BUTTON")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setbShowOtpDialog(false);
                    setOtp("");
                    setTimerActive(false);
                    setResendEnabled(false);
                    setError({ ...sError, otp: "" });
                  }}
                  className="w-1/2 border border-gray-400 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  {t("OTP_DIALOG.CANCEL_BUTTON")}
                </button>
              </div>
              <div className="text-center mt-4 text-sm text-muted">
                {bTimerActive ? (
                  <p>
                    {t("OTP_DIALOG.TIMER")} {nTimerCount}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!bResendEnabled}
                    className={`text-custom-bg hover:underline ${
                      !bResendEnabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {t("OTP_DIALOG.RESEND")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;