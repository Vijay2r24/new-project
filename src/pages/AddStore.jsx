import { useState, useContext, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import TextInputWithIcon from '../components/TextInputWithIcon';
import SelectWithIcon from '../components/SelectWithIcon';
import { useTranslation } from 'react-i18next';
import { LocationDataContext } from '../context/LocationDataProvider';
import { useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../utils/ApiUtils';
import { getStoreById, createOrUpdateStore } from '../contants/apiRoutes';
import { showEmsg } from '../utils/ShowEmsg';
import { useTitle } from '../context/TitleContext';

const getArray = (data) =>
  Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

const AddStore = () => {
  const { t } = useTranslation();
  const { countriesData, statesData, citiesData } = useContext(LocationDataContext);
  const { id } = useParams();
  const { setTitle, setBackButton } = useTitle();
  const [oFormData, setFormData] = useState({
    name: '',
    address: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    phone: '',
    email: '',
    status: 'Active',
    countryName: '',
    stateName: '',
    cityName: ''
  });
  const [sError, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchStore = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await apiGet(`${getStoreById}/${id}`, {}, token);
          if (response.data && response.data.status === 'SUCCESS' && response.data.store) {
            const store = response.data.store;
            const foundCountry = getArray(countriesData).find(c => c.CountryName === store.CountryName);
            const foundState = getArray(statesData).find(s => s.StateName === store.StateName && String(s.CountryID) === String(foundCountry?.CountryID));
            const foundCity = getArray(citiesData).find(c => c.CityName === store.CityName && String(c.StateID) === String(foundState?.StateID));
            setFormData(prevFormData => ({
              ...prevFormData,
              name: store.StoreName || '',
              address: store.AddressLine1 || '',
              country: foundCountry?.CountryID || '',
              state: foundState?.StateID || '',
              city: foundCity?.CityID || '',
              zipCode: store.ZipCode || '',
              phone: store.Phone || '',
              email: store.Email || '',
              status: store.Status || 'Active',
              countryName: store.CountryName || '',
              stateName: store.StateName || '',
              cityName: store.CityName || ''
            }));
            setError(null);
          } else {
            setError(response.data?.message || t('common.errorMessage'));
          }
        } catch (error) {
          const backendMessage = error?.response?.data?.message;
          setError(backendMessage || t('common.errorMessage'));
        }
      };
      fetchStore();
    }
  }, [id, countriesData, statesData, citiesData, t]);

  useEffect(() => {
    setTitle(id ? t('createStore.editStore') : t('createStore.addStore'));
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
      setTitle('');
    };
  }, [setTitle, setBackButton, t, id]);

  const filteredStates = getArray(statesData).filter(s => String(s.CountryID) === String(oFormData.country));
  const filteredCities = getArray(citiesData).filter(c => String(c.StateID) === String(oFormData.state));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); 
    const payload = {
      StoreID: id ? parseInt(id, 10) : 0,
      TenantID: 0,
      StoreName: oFormData.name,
      Email: oFormData.email,
      Phone: oFormData.phone,
      AddressLine1: oFormData.address,
      AddressLine2: "",
      CityID: parseInt(oFormData.city, 10),
      StateID: parseInt(oFormData.state, 10),
      CountryID: parseInt(oFormData.country, 10),
      ZipCode: oFormData.zipCode,
      Status: oFormData.status,
      CountryName: oFormData.countryName,
      StateName: oFormData.stateName,
      CityName: oFormData.cityName,
      ...(id ? { UpdatedBy: parseInt(userId, 10) } : { CreatedBy: parseInt(userId, 10) })
    };
    try {
      const response = await apiPost(createOrUpdateStore, payload, token);
      if (response.data && response.data.status === 'SUCCESS') {
        showEmsg(response.data?.message, 'success');
      } else {
        showEmsg(response.data?.message || t('common.failedOperation'), 'error');
      }
    } catch (error) {
      showEmsg(t('common.errorMessage'), 'error');
    }
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-gray-500">{t('createStore.storeDescription')}</p>
        </div>
      </div>
      {sError && (
        <div className="mb-4 text-red-500 text-center">{sError}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{t('createStore.storeInformation')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
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
                <SelectWithIcon
                  label={t('createStore.country')}
                  id="country"
                  name="country"
                  value={oFormData.country}
                  onChange={handleChange}
                  options={getArray(countriesData).map(c => ({ value: c.CountryID, label: c.CountryName }))}
                  Icon={Building}
                  required
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
                  required
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
            </div>
          </div>
        </div>
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
            {id ? 'Update Store' : 'Create Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStore; 