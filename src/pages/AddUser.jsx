import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, MapPin, Lock, Building, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import { FaCamera } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../utils/ApiUtils';
import { getUserById, userCreateOrUpdate } from '../contants/apiRoutes';
import { showEmsg } from '../utils/ShowEmsg';
import { LocationDataContext } from '../context/LocationDataProvider';
import { useTitle } from '../context/TitleContext';
import { useRoles } from '../context/RolesContext';

const getArray = (data) =>
  Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

const AddUser = () => {
  const [oFormData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'User',
    password: '',
    confirmPassword: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    status: 'Active',
    country: '',
    countryName: '',
    stateName: '',
    cityName: ''
  });
  const [nProfileImage, setProfileImage] = useState(null);
  const [nProfileImagePreview, setProfileImagePreview] = useState(null);
  const { t } = useTranslation();
  const { id } = useParams();
  const { countriesData, statesData, citiesData } = useContext(LocationDataContext);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const { roles, loading: rolesLoading, error: rolesError, fetchRoles } = useRoles();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await apiGet(`${getUserById}/${id}`, {}, token);
          if (response.data && response.data.status === 'SUCCESS' && response.data.user) {
            const user = response.data.user;
            const foundCountry = getArray(countriesData).find(c => c.CountryName === user.CountryName);
            const foundState = getArray(statesData).find(s => s.StateName === user.StateName && String(s.CountryID) === String(foundCountry?.CountryID));
            const foundCity = getArray(citiesData).find(c => c.CityName === user.CityName && String(c.StateID) === String(foundState?.StateID));
            setFormData(prevFormData => ({
              ...prevFormData,
              firstName: user.FirstName || '',
              lastName: user.LastName || '',
              email: user.Email || '',
              phone: user.PhoneNumber || '',
              role: user.RoleName || 'User',
              streetAddress: user.AddressLine || '',
              city: foundCity?.CityID || '',
              state: foundState?.StateID || '',
              pincode: user.Pincode || '',
              status: user.Status || 'Active',
              country: foundCountry?.CountryID || '',
              countryName: user.CountryName || '',
              stateName: user.StateName || '',
              cityName: user.CityName || ''
            }));
            if (user.ProfileImageUrl) {
              setProfileImagePreview(user.ProfileImageUrl);
            }
          } else {
            showEmsg(response.data?.message || t('common.failedOperation'), 'error');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          showEmsg(t('common.errorMessage'), 'error');
        }
      };
      fetchUser();
    }
  }, [id, t]);

  useEffect(() => {
    if (!roles || roles.length === 0) {
      fetchRoles({ pageNumber: 1, pageSize: 100 });
    }
  }, [fetchRoles, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Remove error for this field as soon as user types
    setErrors(prevErrors => {
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
    if (!oFormData.firstName) newErrors.firstName = t('addUser.validation.firstName', 'First name is required');
    if (!oFormData.lastName) newErrors.lastName = t('addUser.validation.lastName', 'Last name is required');
    if (!oFormData.email) newErrors.email = t('addUser.validation.email', 'Email is required');
    if (!oFormData.password && !id) newErrors.password = t('addUser.validation.password', 'Password is required');
    if (!oFormData.confirmPassword && !id) newErrors.confirmPassword = t('addUser.validation.confirmPassword', 'Confirm password is required');
    if (oFormData.password !== oFormData.confirmPassword) newErrors.confirmPassword = t('addUser.validation.passwordMatch', 'Passwords do not match');
    if (!oFormData.role) newErrors.role = t('addUser.validation.role', 'Role is required');
    if (!oFormData.streetAddress) newErrors.streetAddress = t('addUser.validation.streetAddress', 'Street address is required');
    if (!oFormData.country) newErrors.country = t('addUser.validation.country', 'Country is required');
    if (!oFormData.state) newErrors.state = t('addUser.validation.state', 'State is required');
    if (!oFormData.city) newErrors.city = t('addUser.validation.city', 'City is required');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const userData = {
      TenantID: 1,
      FirstName: oFormData.firstName,
      LastName: oFormData.lastName,
      Email: oFormData.email,
      Password: oFormData.password,
      PhoneNumber: oFormData.phone,
      AddressLine: oFormData.streetAddress,
      CityID: parseInt(oFormData.city, 10),
      StateID: parseInt(oFormData.state, 10),
      CountryID: parseInt(oFormData.country, 10),
      Pincode: oFormData.pincode,
      RoleID: oFormData.role,
      ...(id && { UserID: parseInt(id, 10) })
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(userData));
    if (nProfileImage) {
      formData.append("ProfileImage", nProfileImage);
    }

    if (oFormData.password && oFormData.password === oFormData.confirmPassword) {
      formData.append('Password', oFormData.password);
    } else if (!id && (!oFormData.password || !oFormData.confirmPassword)) {
      showEmsg('Password and Confirm Password are required for new user creation.', 'error');
      return;
    } else if (id && oFormData.password !== oFormData.confirmPassword && (oFormData.password || oFormData.confirmPassword)) {
      showEmsg('Password and Confirm Password do not match.', 'error');
      return;
    }

    if (id) {
      formData.append('UpdatedBy', parseInt(userId, 10));
    } else {
      formData.append('CreatedBy', parseInt(userId, 10));
    }

    try {
      const response = await apiPost(userCreateOrUpdate, formData, token, true);
      if (response.data && response.data.status === 'SUCCESS') {
        showEmsg(response.data?.message || (id ? 'User updated successfully!' : 'User added successfully!'), 'success');
        window.history.back();
      } else {
        showEmsg(response.data?.message || t('common.failedOperation'), 'error');
      }
    } catch (error) {
      console.error('API Error:', error);
      showEmsg(t('common.errorMessage'), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <p className="text-gray-500">
            {id
              ? t('users.edit_user_description')
              : t('users.description')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div style={{ minWidth: 80, minHeight: 80 }}>
          {imgLoading && !imgError && (
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <img
            src={
              !imgError && nProfileImagePreview
                ? nProfileImagePreview
                : 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
            }
            alt={t('addUser.profile_preview')}
            className={`h-20 w-20 rounded-full object-cover border ${imgLoading ? 'hidden' : ''}`}
            style={{ display: imgLoading ? 'none' : 'block' }}
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgError(true); setImgLoading(false); }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('addUser.profile_image')}
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
            {t('common.upload')}
          </label>

          <p className="text-xs text-gray-400 mt-1">
            {t('addUser.image_upload_note')}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
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
                error={errors.firstName}
              />
              <TextInputWithIcon
                label={t('addUser.last_name')}
                id="lastName"
                name="lastName"
                value={oFormData.lastName}
                onChange={handleChange}
                placeholder={t('addUser.enter_last_name')}
                Icon={User}
                error={errors.lastName}
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
                error={errors.email}
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
                error={errors.password}
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
                error={errors.confirmPassword}
              />
              <SelectWithIcon
                label={t('addUser.user_role')}
                id="role"
                name="role"
                value={oFormData.role}
                onChange={handleChange}
                options={roles.map(r => ({ value: r.RoleID, label: r.RoleName }))}
                Icon={Building}
                disabled={rolesLoading}
                error={errors.role || rolesError}
                placeholder={rolesLoading ? t('common.loading') : t('addUser.select_role')}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('addUser.address_info')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <TextInputWithIcon
              label={t('addUser.street_address')}
              id="streetAddress"
              name="streetAddress"
              value={oFormData.streetAddress}
              onChange={handleChange}
              placeholder={t('addUser.enter_street_address')}
              Icon={MapPin}
              error={errors.streetAddress}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label={t('createStore.country')}
                  id="country"
                  name="country"
                  value={oFormData.country}
                  onChange={handleChange}
                  options={getArray(countriesData).map(c => ({ value: c.CountryID, label: c.CountryName }))}
                  Icon={Building}
                  error={errors.country}
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t('createStore.state')}
                  id="state"
                  name="state"
                  value={oFormData.state}
                  onChange={handleChange}
                  options={getArray(statesData).filter(s => String(s.CountryID) === String(oFormData.country)).map(s => ({ value: s.StateID, label: s.StateName }))}
                  Icon={Building}
                  error={errors.state}
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t('createStore.city')}
                  id="city"
                  name="city"
                  value={oFormData.city}
                  onChange={handleChange}
                  options={getArray(citiesData).filter(c => String(c.StateID) === String(oFormData.state)).map(c => ({ value: c.CityID, label: c.CityName }))}
                  Icon={Building}
                  error={errors.city}
                />
              </div>
              <TextInputWithIcon
                label={t('addUser.pincode')}
                id="pincode"
                name="pincode"
                value={oFormData.pincode}
                onChange={handleChange}
                placeholder={t('addUser.enter_pincode')}
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
            {t('addUser.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {id ? t('common.saveButton') : t('addUser.create_user')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser; 