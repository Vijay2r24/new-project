import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Building, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import { FaCamera } from 'react-icons/fa';
const AddUser = () => {
  const [oFormData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [nProfileImage, setProfileImage] = useState(null);
  const [nProfileImagePreview, setProfileImagePreview] = useState(null);
  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create user, including nProfileImage
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('addUser.add_new_user')}</h1>
        </div>
        <p className="text-gray-500">{t('addUser.create_new_user_description')}</p>
      </div>

      {/* Profile Image Upload */}
      <div className="flex items-center gap-6 mb-8">
        <div>
          <img
            src={nProfileImagePreview || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'}
            alt={t('addUser.profile_preview')}
            className="h-20 w-20 rounded-full object-cover border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('addUser.profile_image')}
          </label>

          {/* Hidden File Input */}
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Camera Icon Button */}
          <label
            htmlFor="profile-image-upload"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full cursor-pointer"
          >
            <FaCamera className="text-lg" />
            Upload
          </label>

          <p className="text-xs text-gray-400 mt-1">
            {t('addUser.image_upload_note')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('addUser.personal_info')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t('addUser.first_name')}
                id="firstName"
                name="firstName"
                value={oFormData.firstName}
                onChange={handleChange}
                placeholder={t('addUser.enter_first_name')}
                Icon={User}
                required
              />
              <TextInputWithIcon
                label={t('addUser.last_name')}
                id="lastName"
                name="lastName"
                value={oFormData.lastName}
                onChange={handleChange}
                placeholder={t('addUser.enter_last_name')}
                Icon={User}
                required
              />
              <TextInputWithIcon
                label={t('addUser.email_address')}
                id="email"
                name="email"
                value={oFormData.email}
                onChange={handleChange}
                placeholder={t('addUser.enter_email')}
                Icon={Mail}
                type="email"
                required
              />
              <TextInputWithIcon
                label={t('addUser.phone_number')}
                id="phone"
                name="phone"
                value={oFormData.phone}
                onChange={handleChange}
                placeholder={t('addUser.enter_phone')}
                Icon={Phone}
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('addUser.account_security')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t('addUser.password')}
                id="password"
                name="password"
                value={oFormData.password}
                onChange={handleChange}
                placeholder={t('addUser.enter_password')}
                Icon={Lock}
                type="password"
                required
              />
              <TextInputWithIcon
                label={t('addUser.confirm_password')}
                id="confirmPassword"
                name="confirmPassword"
                value={oFormData.confirmPassword}
                onChange={handleChange}
                placeholder={t('addUser.confirm_password')}
                Icon={Lock}
                type="password"
                required
              />
              <SelectWithIcon
                label={t('addUser.user_role')}
                id="role"
                name="role"
                value={oFormData.role}
                onChange={handleChange}
                options={[
                  { value: 'user', label: t('addUser.user') },
                  { value: 'admin', label: t('addUser.admin') },
                  { value: 'manager', label: t('addUser.manager') }
                ]}
                Icon={Building}
                required
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('addUser.address_info')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputWithIcon
                label={t('addUser.street_address')}
                id="streetAddress"
                name="streetAddress"
                value={oFormData.streetAddress}
                onChange={handleChange}
                placeholder={t('addUser.enter_street_address')}
                Icon={MapPin}
              />
              <TextInputWithIcon
                label={t('addUser.pincode')}
                id="pincode"
                name="pincode"
                value={oFormData.pincode}
                onChange={handleChange}
                placeholder={t('addUser.enter_pincode')}
                Icon={Building}
              />
              <TextInputWithIcon
                label={t('addUser.city')}
                id="city"
                name="city"
                value={oFormData.city}
                onChange={handleChange}
                placeholder={t('addUser.enter_city')}
                Icon={Building}
              />
              <TextInputWithIcon
                label={t('addUser.state')}
                id="state"
                name="state"
                value={oFormData.state}
                onChange={handleChange}
                placeholder={t('addUser.enter_state')}
                Icon={Building}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B45E0]"
          >
            {t('addUser.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {t('addUser.create_user')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser; 