import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextInputWithIcon from '../components/TextInputWithIcon';
import { useTranslation } from 'react-i18next';
import md5 from "md5";
import { apiPost } from '../utils/ApiUtils';
import { LOGIN, FORGOT_USER_PASSWORD, VALIDATE_UPDATE_PASSWORD, VALIDATE_OTP } from "../contants/apiRoutes";
import { showEmsg } from '../utils/ShowEmsg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchApiData } from './FetchApiData';
import { STATUS } from '../contants/constants'
const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [bShowPassword, setShowPassword] = useState(false);
  const [oFormData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [sError, setError] = useState({
    email: '',
    password: '',
    submit: ''
  });

  const [sCurrentView, setCurrentView] = useState('login');
  const [sForgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [sOtp, setOtp] = useState('');
  const [bShowOtpDialog, setbShowOtpDialog] = useState(false);
  const [nTimerCount, setTimerCount] = useState(60);
  const [bTimerActive, setTimerActive] = useState(false);
  const [bResendEnabled, setResendEnabled] = useState(false);
  const [sNewPassword, setNewPassword] = useState('');
  const [sConfirmPassword, setConfirmPassword] = useState('');
  const [bShowNewPassword, setShowNewPassword] = useState(false);
  const [bShowConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    if (!email.trim()) return t('login.errors.emailRequired');
    return '';
  };

  const validatePassword = (password) => {
    if (!password.trim()) return t('login.errors.passwordRequired');
    return '';
  };

  const validateNewPassword = (password) => {
    if (!password.trim()) return t('resetPassword.errors.passwordRequired');
    if (password.length < 6) return t('resetPassword.errors.passwordShort');
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!strongRegex.test(password)) return t('resetPassword.errors.passwordWeak');
    return '';
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    if (!confirmPassword.trim()) return t('resetPassword.errors.confirmPasswordRequired');
    if (confirmPassword !== newPassword) return t('resetPassword.errors.passwordsMismatch');
    return '';
  };

  const handleChange = (field, value) => {
    let fieldError = '';
    let updatedFormData = { ...oFormData };

    if (sCurrentView === 'login') {
      updatedFormData = { ...oFormData, [field]: value };
      setFormData(updatedFormData);
      if (field === 'email') {
        fieldError = validateEmail(value);
      } else if (field === 'password') {
        fieldError = validatePassword(value);
      }

    } else if (sCurrentView === 'forgotPassword' && field === 'email') {
      setForgotPasswordEmail(value);
      fieldError = validateEmail(value);
    } else if (sCurrentView === 'resetPassword') {
      if (field === 'newPassword') {
        setNewPassword(value);
        fieldError = validateNewPassword(value);
        setError(prev => ({ ...prev, confirmPassword: validateConfirmPassword(sConfirmPassword, value) }));
      } else if (field === 'confirmPassword') {
        setConfirmPassword(value);
        fieldError = validateConfirmPassword(value, sNewPassword);
      }
    }

    setError(prev => ({ ...prev, [field]: fieldError, submit: '' }));
  };

  const loginUser = async () => {
    const emailError = validateEmail(oFormData.email);
    const passwordError = validatePassword(oFormData.password);

    if (emailError || passwordError) {
      setError(prev => ({
        ...prev,
        email: emailError,
        password: passwordError,
      }));
      return;
    }

    setError(prev => ({ ...prev, email: '', password: '' }));

    try {
      const hashedPassword = md5(oFormData.password);

      const response = await apiPost(
        LOGIN,
        {
          Email: oFormData.email,
          Password: hashedPassword,
        },
        null,
        false
      );

      const data = response?.data?.data;
      const message = response?.data?.MESSAGE;
      const status = response?.data?.STATUS;

      if (data?.token && data?.UserID && status === STATUS.SUCCESS_1) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.UserID);

        await fetchApiData();
        if (message) {
          showEmsg(message, 'success');
        }
        navigate("/dashboard");
      } else {
        const fallbackMessage = t('login.errors.invalidCredentials');
        setError(prev => ({ ...prev, submit: fallbackMessage }));
        showEmsg(message || fallbackMessage, 'warning');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.MESSAGE || t('login.errors.invalidCredentials');
      setError(prev => ({ ...prev, submit: errorMessage }));
      showEmsg(errorMessage, 'error');
    }
  };


  const handleForgotPasswordClick = () => {
    setCurrentView('forgotPassword');
    setError({ email: '', password: '', submit: '', otp: '', newPassword: '', confirmPassword: '' });
  };
  const handleSendOtp = async () => {
    const emailError = validateEmail(sForgotPasswordEmail);
    if (emailError) {
      setError(prev => ({ ...prev, email: emailError }));
      return;
    }
    try {
      const payload = { email: sForgotPasswordEmail };
      const response = await apiPost(`${FORGOT_USER_PASSWORD}`, payload, null, false);
      const message = response?.data?.MESSAGE;
      if (response.data.STATUS === STATUS.SUCCESS_1) {
        showEmsg(message, 'success');
        setbShowOtpDialog(true);
        setTimerCount(60);
        setTimerActive(true);
        setResendEnabled(false);
        setOtp('');
        setError({ email: '', password: '', submit: '' });
      } else {
        showEmsg(message, 'warning');
      }
    } catch (error) {
      const errMsg = error?.response?.data?.MESSAGE;
      showEmsg(errMsg ||t('otp.error'), 'error');
    }
  };
  const handleVerifyOtp = async () => {
       if (!sOtp.trim()) {
      setError(prev => ({ ...prev, otp: t('login.errors.otpRequired') }));
      return;
    }
    if (sOtp.length !== 6) {
      setError(prev => ({ ...prev, otp: t('login.errors.otpInvalidLength') }));
      return;
    }


    try {
      const payload = {
        email: sForgotPasswordEmail,
        OTP: Number(sOtp)
      };
      const response = await apiPost(VALIDATE_OTP, payload, null, false);
      const message = response?.data?.MESSAGE;

      if (response.data && response.data.STATUS === STATUS.SUCCESS_1) {
        showEmsg(message, 'success');
        setbShowOtpDialog(false);
        setTimerActive(false);
        setOtp('');
        setCurrentView('resetPassword');
        setError({ email: '', password: '', submit: '', otp: '', newPassword: '', confirmPassword: '' });
      } else {
        const errMsg = message || t('login.errors.otpInvalid');
        showEmsg(message || errMsg, 'warning');
        setError(prev => ({ ...prev, otp: message }));
      }
    } catch (error) {
      const errMsg = error?.response?.data?.MESSAGE;
      showEmsg(errMsg, 'error');
      setError(prev => ({ ...prev, otp: errMsg }));
    }
  };
  const handleOtpInputChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) {
      setError(prev => ({ ...prev, otp: 'OTP must only contain digits.' }));
      return;
    }
    setError(prev => ({ ...prev, otp: '' }));
    const newOtp = sOtp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));
    if (value !== '' && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleOtpInputKeyDown = (index, e) => {
    if (e.key === 'Backspace' && sOtp[index] === '' && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };
  const handlePasswordReset = async () => {
    const newPasswordError = validateNewPassword(sNewPassword);
    const confirmPasswordError = validateConfirmPassword(sConfirmPassword, sNewPassword);
    if (newPasswordError || confirmPasswordError) {
      setError(prev => ({ ...prev, newPassword: newPasswordError, confirmPassword: confirmPasswordError }));
      return;
    }
    try {
      const hashedNewPassword = md5(sNewPassword);
      const hashedConfirmPassword = md5(sConfirmPassword);
      const payload = {
        email: sForgotPasswordEmail,
        NewPassword: hashedNewPassword,
        ConfirmPassword: hashedConfirmPassword
      };
      const response = await apiPost(VALIDATE_UPDATE_PASSWORD, payload, null, false);
      const message = response?.data?.MESSAGE;
      if (response.data && response.data.STATUS === STATUS.SUCCESS_1) {
        showEmsg(message, 'success');
        setCurrentView('login');
        setForgotPasswordEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setError({ email: '', password: '', submit: '', otp: '', newPassword: '', confirmPassword: '' });
      } else {
        showEmsg(message || t('login.errors.passwordResetFailed'), 'warning');
      }
    } catch (error) {
      const errMsg = error?.response?.data?.MESSAGE;
      showEmsg(errMsg || t('login.errors.passwordResetFailed'), 'error');
    }
  };
  useEffect(() => {
    let timer;
    if (bTimerActive && nTimerCount > 0) {
      timer = setTimeout(() => {
        setTimerCount(prevCount => prevCount - 1);
      }, 1000);
    } else if (!bTimerActive || nTimerCount === 0) {
      setTimerActive(false);
      setResendEnabled(true);
    }
    return () => clearTimeout(timer);
  }, [bTimerActive, nTimerCount]);

  const renderLogin = () => (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{t('login.title')}</h2>
        <p className="text-sm text-gray-600">{t('login.subtitle')}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <TextInputWithIcon
            label={t('login.email')}
            id="email"
            name="email"
            type="email"
            placeholder={t('login.email-placeholder')}
            value={oFormData.email}
            onChange={e => handleChange('email', e.target.value)}
            Icon={Mail}
            required
          />
          {sError.email && (<p className="text-sm text-red-500 mt-1">{sError.email}</p>)}
        </div>
        <div className="space-y-1">
          <TextInputWithIcon
            label={t('login.passWord')}
            id="password"
            name="password"
            type={bShowPassword ? 'text' : 'password'}
            placeholder={t('login.passWord-placeholder')}
            value={oFormData.password}
            onChange={e => handleChange('password', e.target.value)}
            Icon={Lock}
            required
            inputSlot={
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="text-gray-500 hover:text-custom-bg"
                aria-label={bShowPassword ? 'Hide password' : 'Show password'}
              >
              </button>
            }
          />
          {sError.password && (<p className="text-sm text-red-500 mt-1">{sError.password}</p>)}
        </div>
        <div className="text-sm text-right">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-custom-bg hover:underline hover:text-red-500 transition-all duration-200"
          >
            {t('login.forgotPassword')}
          </button>
        </div>
        <button
          type="button"
          onClick={loginUser}
          className="w-full bg-custom-bg text-white py-2 px-4 rounded-md hover:bg-custom-bg-dark transition-colors duration-200"
        >
          {t('login.loginButton')}
        </button>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{t('login.forgotPasswordTitle')}</h2>
        <p className="text-sm text-gray-600">{t('login.forgotPasswordSubtitle')}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <TextInputWithIcon
            label={t('login.email')}
            id="forgotPasswordEmail"
            name="forgotPasswordEmail"
            type="email"
            placeholder={t('login.email-placeholder')}
            value={sForgotPasswordEmail}
            onChange={e => handleChange('email', e.target.value)}
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
            className="w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md hover:bg-custom-bg-dark transition-colors duration-200"
          >
            {t('login.sendOtpButton')}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="w-1/2 text-custom-bg border border-custom-bg py-2 px-4 rounded-md hover:bg-custom-bg/10 transition-colors duration-200"
          >
            {t('common.cancel')}
          </button>
        </div>

      </div>
    </>
  );

  const renderResetPassword = () => (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{t('resetPassword.title')}</h2>
        <p className="text-sm text-gray-600">{t('resetPassword.subtitle')}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <TextInputWithIcon
            label={t('resetPassword.newPassword')}
            id="newPassword"
            name="newPassword"
            type={bShowNewPassword ? 'text' : 'password'}
            placeholder={t('resetPassword.newPassword-placeholder')}
            value={sNewPassword}
            onChange={e => handleChange('newPassword', e.target.value)}
            Icon={Lock}
            required
            inputSlot={
              <button
                type="button"
                onClick={() => setShowNewPassword(v => !v)}
                className="text-gray-500 hover:text-custom-bg"
                aria-label={bShowNewPassword ? 'Hide password' : 'Show password'}
              >
              </button>
            }
          />
          {sError.newPassword && (
            <p className="text-sm text-red-500 mt-1">{sError.newPassword}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{t('resetPassword.passwordSuggestion')}</p>
        </div>
        <div className="space-y-1">
          <TextInputWithIcon
            label={t('resetPassword.confirmPassword')}
            id="confirmPassword"
            name="confirmPassword"
            type={bShowConfirmPassword ? 'text' : 'password'}
            placeholder={t('resetPassword.confirmPassword-placeholder')}
            value={sConfirmPassword}
            onChange={e => handleChange('confirmPassword', e.target.value)}
            Icon={Lock}
            required
            inputSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                className="text-gray-500 hover:text-custom-bg"
                aria-label={bShowConfirmPassword ? 'Hide password' : 'Show password'}
              >
              </button>
            }
          />
          {sError.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{sError.confirmPassword}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="w-1/2 bg-custom-bg text-white py-2 px-4 rounded-md hover:bg-custom-bg-dark transition-colors duration-200"
          >
            {t('resetPassword.resetButton')}
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="w-1/2 text-custom-bg border border-custom-bg py-2 px-4 rounded-md hover:bg-custom-bg/10 transition-colors duration-200"
          >
            {t('common.cancel')}
          </button>
        </div>

      </div>
    </>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-custom-bg to-blue-100">
      <div className="hidden lg:flex flex-col justify-center items-center px-12 bg-custom-bg/50 text-white relative overflow-hidden">
        <ToastContainer />
        <div className="absolute inset-0 bg-repeat opacity-20" style={{ backgroundImage: 'url("/path/to/subtle-pattern.png")' }}></div>
        <div className="text-center max-w-md animate-fade-in z-10 relative">
          <Settings className="w-14 h-14 text-white mb-6 mx-auto drop-shadow-md" />
          <h1
            className="text-4xl font-bold mb-5 leading-tight drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: t('admin.title') }}
          />
          <p className="text-white/90 text-lg mb-10 drop-shadow-sm">
            {t('admin.description')}
          </p>
          <div className="grid grid-cols-1 gap-4 text-left text-sm mt-8">
            <div className="flex items-center space-x-3 drop-shadow-sm"><Package className="h-5 w-5 text-white" /><span>{t('admin.features.product')}</span></div>
            <div className="flex items-center space-x-3 drop-shadow-sm"><ShoppingCart className="h-5 w-5 text-white" /><span>{t('admin.features.order')}</span></div>
            <div className="flex items-center space-x-3 drop-shadow-sm"><Users className="h-5 w-5 text-white" /><span>{t('admin.features.userRole')}</span></div>
            <div className="flex items-center space-x-3 drop-shadow-sm"><BarChart2 className="h-5 w-5 text-white" /><span>{t('admin.features.analytics')}</span></div>
            <div className="flex items-center space-x-3 drop-shadow-sm"><Shield className="h-5 w-5 text-white" /><span>{t('admin.features.security')}</span></div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl border border-custom-bg/30 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(255,90,95,0.35)] transition-all hover:scale-[1.02]">
          {sCurrentView === 'login' && renderLogin()}
          {sCurrentView === 'forgotPassword' && renderForgotPassword()}
          {sCurrentView === 'resetPassword' && renderResetPassword()}
        </div>
      </div>
      {bShowOtpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{t('otpDialog.title')}</h3>
              <h4 className="text-lg font-medium text-gray-700 mb-1">{t('otpDialog.subtitle')}</h4>
              <p className="text-sm text-gray-500">{t('otpDialog.instruction')}</p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {Array(6).fill(0).map((_, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-150"
                  value={sOtp[index] || ''}
                  onChange={(e) => handleOtpInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpInputKeyDown(index, e)}
                />
              ))}
            </div>

            {sError.otp && (
              <p className="text-sm text-red-500 text-center mb-4">{sError.otp}</p>
            )}

            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-1/2 bg-custom-bg text-white py-2 rounded-md hover:bg-custom-bg-dark transition-colors duration-200"
              >
                {t('otpDialog.verifyButton')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setbShowOtpDialog(false);
                  setOtp('');
                  setTimerActive(false);
                  setResendEnabled(false);
                  setError({ ...sError, otp: '' });
                }}
                className="w-1/2 border border-gray-400 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                {t('otpDialog.cancelButton')}
              </button>
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
              {bTimerActive ? (
                <p>{t('otpDialog.timer')}{' '}{nTimerCount}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!bResendEnabled}
                  className={`text-custom-bg hover:underline ${!bResendEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('otpDialog.resend')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
