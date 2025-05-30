import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Shield, Bell, Globe, Lock, Key } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import cheGuevaraImg from '../../assets/images/che-guevara.jpg';
import { useTranslation } from 'react-i18next';
  const oDefaultUser = {
  name: "Guest User",
  email: "guest@example.com",
  phone: "Not provided",
  address: "Not provided",
  city: "Not provided",
  state: "Not provided",
  zipCode: "Not provided",
  joinDate: new Date().toISOString(),
  avatar: cheGuevaraImg,
  role: "Guest"
};
const ProfileDetails = ({ user = oDefaultUser }) => {
const { t } = useTranslation();

const securityPrefModals = {
  
  'changePassword': {
    title: 'Change Password',
    content: (
      <form className="space-y-4">
        <div>
          <TextInputWithIcon
            label={t('profile.current_password')}
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder={t('profile.enter_current_password')}
            Icon={Key}
          />
        </div>
        <div>
          <TextInputWithIcon
            label={t('new_password')}
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder={t('peofile.enter_new_password')}
            Icon={Lock}
          />
        </div>
        <div>
           <TextInputWithIcon
            label={t('profile.confirm_new_password')}
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            placeholder={t('profile.confirm_new_password_placeholder')}
            Icon={Lock}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium" onClick={null}> {t('profile.cancel')}</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-medium hover:from-sky-400 hover:to-indigo-400 border border-sky-400/20"> {t('profile.save')}</button>
        </div>
      </form>
    )
  },
  twoFactor: {
    title: t('profile.two_factor_authentication'),
    content: <div className="py-4">{t('profile.coming_soon')}</div>,
  },
  privacy: {
    title: t('profile.privacy_settings'),
    content: <div className="py-4">{t('profile.coming_soon')}</div>,
  },
  notifications: {
    title: t('profile.notification_settings'),
    content: <div className="py-4">{t('profile.coming_soon')}</div>,
  },
  language: {
    title: t('profile.language_region'),
    content: <div className="py-4">{t('profile.coming_soon')}</div>,
  },
};
  const [bEditOpen, setEditOpen] = useState(false);
  const [nModalType, setModalType] = useState(null);

  const handleOpenModal = (type) => setModalType(type);
  const handleCloseModal = () => setModalType(null);

  return (
    <div className="max-w-7xl mx-auto mt-5">
      {/* Header Section with Background */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-sky-100/50">
        {/* Background with enhanced pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-indigo-100" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 via-transparent to-indigo-200/40" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white ring-2 ring-sky-200/50 transition-all duration-300 group-hover:scale-105">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full text-sky-500 hover:bg-sky-50 transition-all duration-200 border border-sky-200 hover:scale-110">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-custom-bg to-custom-bg/80 bg-clip-text text-transparent">{user.name}</h1>
              <p className="mt-1 text-custom-bg font-medium">{user.role}</p>
              <p className="mt-2 text-sm text-custom-bg/80 flex items-center">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-custom-bg/60 mr-2"></span>
                 {t('profile.member_since')}{new Date(user.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div className="md:ml-auto">
              <button 
                className="btn-primary"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
               {t('profile.edit_profile')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Security/Preferences Modal */}
      {nModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{securityPrefModals[nModalType].title}</h2>
            {securityPrefModals[nModalType].content}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t('profile.personal_information')}</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <User className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.full_name')}</p>
                    <p className="mt-1 text-base text-gray-900">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Mail className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.email_address')}</p>
                    <p className="mt-1 text-base text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Phone className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.phone_number')}</p>
                    <p className="mt-1 text-base text-gray-900">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-custom-bg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('profile.member_since')}</p>
                    <p className="mt-1 text-base text-gray-900">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t('profile.address_info')}</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-2.5 bg-custom-bg/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-custom-bg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('profile.streetAddress')}</p>
                  <p className="mt-1 text-base text-gray-900">{user.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('profile.city')}</p>
                  <p className="mt-1 text-base text-gray-900">{user.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('profile.state')}</p>
                  <p className="mt-1 text-base text-gray-900">{user.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('profile.zipCode')}</p>
                  <p className="mt-1 text-base text-gray-900">{user.zipCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Preferences */}
        <div className="space-y-8">
          {/* Security Settings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t('profile.securitySettings')}</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group" onClick={() => handleOpenModal('changePassword')}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20 transition-colors duration-200">
                    <Key className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('profile.changePassword')}</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group" onClick={() => handleOpenModal('twoFactor')}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20 transition-colors duration-200">
                    <Shield className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('profile.twoFactorAuth')}</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group" onClick={() => handleOpenModal('privacy')}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20 transition-colors duration-200">
                    <Lock className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('profile.privacySettings')}</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t('profile.preferences')}</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group" onClick={() => handleOpenModal('notifications')}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20 transition-colors duration-200">
                    <Bell className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('profile.notificationSettings')}</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group" onClick={() => handleOpenModal('language')}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-custom-bg/10 rounded-lg group-hover:bg-custom-bg/20 transition-colors duration-200">
                    <Globe className="h-5 w-5 text-custom-bg" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('profile.languageRegion')}</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails; 