import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Users, Package, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
const AddStore = () => {
  const [oFormData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    status: 'Active',
    products: '',
    employees: ''
  });
  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create store
    console.log('Form submitted:', oFormData);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('createStore.addNewStore')}</h1>
        </div>
        <p className="text-gray-500">{t('createStore.storeDescription')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('createStore.storeInformation')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
              {/* Store Name */}
              <div className="w-full md:w-1/2">
                <TextInputWithIcon
                  label={t('createStore.storeName')}
                  id="name"
                  name="name"
                  value={oFormData.name}
                  onChange={handleChange}
                  placeholder={t('createStore.enterStoreName')}
                  Icon={Building}
                  required
                />
              </div>
              {/* Street Address */}
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <TextInputWithIcon
                  label={t('createStore.streetAddress')}
                  id="address"
                  name="address"
                  value={oFormData.address}
                  onChange={handleChange}
                  placeholder={t('createStore.enterStreetAddress')}
                  Icon={MapPin}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <TextInputWithIcon
                  label={t('createStore.city')}
                  id="city"
                  name="city"
                  value={oFormData.city}
                  onChange={handleChange}
                  placeholder={t('createStore.enterCity')}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t('createStore.state')}
                  id="state"
                  name="state"
                  value={oFormData.state}
                  onChange={handleChange}
                  placeholder={t('createStore.enterState')}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t('createStore.zipCode')}
                  id="zipCode"
                  name="zipCode"
                  value={oFormData.zipCode}
                  onChange={handleChange}
                  placeholder={t('createStore.enterZipCode')}
                  Icon={MapPin}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('createStore.contactInformation')}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label={t('createStore.phoneNumber')}
                  id="phone"
                  name="phone"
                  value={oFormData.phone}
                  onChange={handleChange}
                  placeholder={t('createStore.enterPhoneNumber')}
                  Icon={Phone}
                  type="tel"
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t('createStore.emailAddress')}
                  id="email"
                  name="email"
                  value={oFormData.email}
                  onChange={handleChange}
                  placeholder={t('createStore.enterEmailAddress')}
                  Icon={Mail}
                  type="email"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('createStore.storeDetails')}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label={t('createStore.status')}
                  id="status"
                  name="status"
                  value={oFormData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t('createStore.numberOfProducts')}
                  id="products"
                  name="products"
                  value={oFormData.products}
                  onChange={handleChange}
                  placeholder={t('createStore.enterNumberOfProducts')}
                  Icon={Package}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t('createStore.numberOfEmployees')}
                  id="employees"
                  name="employees"
                  value={oFormData.employees}
                  onChange={handleChange}
                  placeholder={t('createStore.enterNumberOfEmployees')}
                  Icon={Users}
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-cancel"
          >
            {t('createStore.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {t('createStore.createStore')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStore; 