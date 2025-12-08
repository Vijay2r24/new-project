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

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  passwordRules,
  validatePassword,
  validateNewPassword,
  validateConfirmPassword
} from "../utils/passwordUtils";

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

  // Dummy credentials with roles and permissions
  const dummyCredentials = [
    {
      email: "admin@gmail.com",
      password: "admin@123",
      role: "admin",
      name: "Administrator",
      permissions: ["dashboard", "products", "orders", "users", "roles", "employees", "analytics", "settings"],
      avatar: "A"
    },
    {
      email: "hr@gmail.com",
      password: "hr@123",
      role: "hr",
      name: "HR Manager",
      permissions: ["dashboard", "users", "employees", "settings"],
      avatar: "H"
    },
    {
      email: "user@gmail.com",
      password: "user@123",
      role: "user",
      name: "Regular User",
      permissions: ["dashboard", "products", "orders"],
      avatar: "U"
    }
  ];

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

  const loginUser = async () => {
    const { email, password } = oFormData;

    let newErrors = {};
    let authenticatedUser = null;

    // Check against dummy credentials
    const user = dummyCredentials.find(
      cred => cred.email === email.trim() && cred.password === password.trim()
    );

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!user) {
      newErrors.email = "Invalid email or password";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!user) {
      newErrors.password = "Invalid email or password";
    }

    setError((prev) => ({ ...prev, ...newErrors }));

    // Stop if errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Login failed! Check your credentials.");
      return;
    }

    // Success - Store user info in localStorage
    if (user) {
      // Store user data (excluding password for security)
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      
      toast.success(`Welcome ${user.name}! Login Successful!`);

      setTimeout(() => {
        navigate("/dashboard/dashBoard");
      }, 1500);
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
    if (!sForgotPasswordEmail) {
      setError((prev) => ({ ...prev, email: t("LOGIN.ERRORS.EMAIL_REQUIRED") }));
      return;
    }
    
    const emailError = validateEmail(sForgotPasswordEmail);
    if (emailError) {
      setError((prev) => ({ ...prev, email: emailError }));
      return;
    }

    // Dummy OTP for demo
    setOtp("123456");
    setbShowOtpDialog(true);
    setTimerActive(true);
    setTimerCount(60);
    setResendEnabled(false);
    
    toast.info(`OTP sent to ${sForgotPasswordEmail} (Demo: 123456)`);
  };

  const handleVerifyOtp = async () => {
    if (sOtp.length !== 6) {
      setError((prev) => ({ ...prev, otp: "Please enter 6-digit OTP" }));
      return;
    }

    // Demo verification - accept 123456
    if (sOtp === "123456") {
      toast.success("OTP Verified Successfully!");
      setbShowOtpDialog(false);
      setCurrentView("resetPassword");
      setError((prev) => ({ ...prev, otp: "" }));
    } else {
      setError((prev) => ({ ...prev, otp: "Invalid OTP. Try 123456 for demo." }));
      toast.error("Invalid OTP. Try 123456 for demo.");
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
    if (sError.newPassword || sError.confirmPassword) {
      toast.error("Please fix password errors before resetting.");
      return;
    }

    if (sNewPassword !== sConfirmPassword) {
      setError((prev) => ({ 
        ...prev, 
        confirmPassword: "Passwords do not match" 
      }));
      return;
    }

    // Demo password reset
    toast.success("Password reset successfully! You can now login with new password.");
    setCurrentView("login");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordEmail("");
    setError({
      email: "",
      password: "",
      submit: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
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
            className={`w-full py-2 px-4 rounded-md transition-colors duration-200 bg-custom-bg text-white ${isLoginDisabled
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
              className={`w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md transition-colors duration-200 ${isSendOtpDisabled
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
              className={`w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md transition-colors duration-200 ${isResetDisabled
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

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-custom-bg to-blue-100">
        {/* Left Side - Compact E-commerce Preview */}
        <div className="hidden lg:flex flex-col justify-center items-center px-8 bg-gradient-to-br from-custom-bg to-purple-600 text-white relative overflow-hidden py-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="text-center max-w-sm z-10">
            {/* Logo */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <ShoppingBag className="w-8 h-8 text-custom-bg" />
              </div>
            </div>
            
            {/* Title & Subtitle */}
            <h1 className="text-2xl font-bold mb-3">
              {t("ECOMMERCE_TITLE", "ShopSphere Admin")}
            </h1>
            <p className="text-white/80 text-sm mb-8">
              {t("ECOMMERCE_DESCRIPTION", "E-Commerce Management Dashboard")}
            </p>
            
            {/* Compact Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                <Package className="h-4 w-4 text-white" />
                <span className="text-sm">{t("FEATURES.PRODUCT_MANAGEMENT", "Products")}</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-white" />
                <span className="text-sm">{t("FEATURES.ORDER_PROCESSING", "Orders")}</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                <Users className="h-4 w-4 text-white" />
                <span className="text-sm">{t("FEATURES.CUSTOMER_MANAGEMENT", "Customers")}</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                <BarChart2 className="h-4 w-4 text-white" />
                <span className="text-sm">{t("FEATURES.SALES_ANALYTICS", "Analytics")}</span>
              </div>
            </div>
            
            {/* Stats in a single row */}
            <div className="flex justify-between mb-6 px-4">
              <div className="text-center">
                <div className="text-lg font-bold">10K+</div>
                <div className="text-white/60 text-xs">Products</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">500+</div>
                <div className="text-white/60 text-xs">Orders/Day</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">99.9%</div>
                <div className="text-white/60 text-xs">Uptime</div>
              </div>
            </div>
            
            {/* Simple testimonial */}
            <div className="text-xs text-white/70 italic border-t border-white/20 pt-4">
              "Streamlined our e-commerce operations"
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl border border-custom-bg/30 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(255,90,95,0.35)] transition-all hover:scale-[1.02]">
            {sCurrentView === "login" && renderLogin()}
            {sCurrentView === "forgotPassword" && renderForgotPassword()}
            {sCurrentView === "resetPassword" && renderResetPassword()}
          </div>
        </div>
        
        {/* OTP Dialog */}
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
                  className={`w-1/2 bg-custom-bg text-white py-2 rounded-md transition-colors duration-200 ${!sOtp || sOtp.length !== 6
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
                    className={`text-custom-bg hover:underline ${!bResendEnabled ? "opacity-50 cursor-not-allowed" : ""
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