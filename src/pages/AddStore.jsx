import { useState, useContext, useEffect } from "react";
import { Building, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import TextInputWithIcon from "../components/TextInputWithIcon";
import SelectWithIcon from "../components/SelectWithIcon";
import { useTranslation } from "react-i18next";
import { LocationDataContext } from "../context/LocationDataProvider";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../utils/ApiUtils";
import { GET_STORE_BY_ID, CREATE_OR_UPDATE_STORE } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { useTitle } from "../context/TitleContext";
import { STATUS } from "../contants/constants";
import BackButton from "../components/BackButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
const getArray = (data) =>
  Array.isArray(data)
    ? data
    : data && Array.isArray(data.data)
    ? data.data
    : [];

const AddStore = () => {
  const { t } = useTranslation();
  const { aCountriesData, aStatesData, aCitiesData } =
    useContext(LocationDataContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle, setBackButton } = useTitle();
  const [oFormData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    status: "Active",
    countryName: "",
    stateName: "",
    cityName: "",
  });
  const [sError, setError] = useState(null);
  const [bSubmitting, setbSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchStore = async () => {
        try {
          const token = localStorage.getItem("token");
          const oResponse = await apiGet(`${GET_STORE_BY_ID}/${id}`, {}, token);
          if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
            const store = oResponse.data.data.store;
            const foundCountry = getArray(aCountriesData).find(
              (c) => c.CountryName === store.CountryName
            );
            const foundState = getArray(aStatesData).find(
              (s) =>
                s.StateName === store.StateName &&
                String(s.CountryID) === String(foundCountry?.CountryID)
            );
            const foundCity = getArray(aCitiesData).find(
              (c) =>
                c.CityName === store.CityName &&
                String(c.StateID) === String(foundState?.StateID)
            );
            setFormData((prevFormData) => ({
              ...prevFormData,
              name: store.StoreName || "",
              address: store.AddressLine1 || "",
              country: foundCountry?.CountryID || "",
              state: foundState?.StateID || "",
              city: foundCity?.CityID || "",
              zipCode: store.ZipCode || "",
              phone: store.Phone || "",
              email: store.Email || "",
              status: store.Status || "",
              countryName:
                store.CountryName ||
                (foundCountry ? foundCountry.CountryName : ""),
              stateName:
                store.StateName || (foundState ? foundState.StateName : ""),
              cityName: store.CityName || (foundCity ? foundCity.CityName : ""),
            }));
            setError(null);
          } else {
            setError(oResponse.data?.message || t("COMMON.ERROR_MESSAGE"));
          }
        } catch (error) {
          const backendMessage = error?.response?.data?.message;
          setError(backendMessage || t("COMMON.ERROR_MESSAGE"));
        }
      };
      fetchStore();
    }
  }, [id, aCountriesData, aStatesData, aCitiesData, t]);

  useEffect(() => {
    setTitle(id ? t("STORES.EDIT_STORE") : t("STORES.ADD_STORE"));
    setBackButton(<BackButton onClick={() => window.history.back()} />);
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [setTitle, setBackButton, t, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setbSubmitting(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const payload = {
      StoreID: id ? parseInt(id, 10) : 0,
      TenantID: localStorage.getItem("tenantID"),
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
      ...(id ? { UpdatedBy: userId } : { CreatedBy: userId }),
    };
    try {
      const oResponse = await apiPost(CREATE_OR_UPDATE_STORE, payload, token);
      if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        showEmsg(oResponse.data?.MESSAGE, STATUS.SUCCESS, 3000, async () => {
          navigate("/stores");
        });
      } else {
        showEmsg(oResponse.data?.MESSAGE, STATUS.WARNING);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setbSubmitting);
    }
  };
  const loaderOverlay = bSubmitting ? (
    <div className="global-loader-overlay">
      <Loader />
    </div>
  ) : null;
  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer />
      {loaderOverlay}
      <div className="mb-8">
        <p className="text-gray-500">
          {id ? t("STORES.EDIT_EXISTING_STORE") : t("STORES.CREATE_NEW_STORE")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("CREATE_STORE.STORE_INFORMATION")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <TextInputWithIcon
                  label={t("CREATE_STORE.STORE_NAME")}
                  id="name"
                  name="name"
                  value={oFormData.name}
                  onChange={handleChange}
                  placeholder={t("CREATE_STORE.ENTER_STORE_NAME")}
                  Icon={Building}
                  required
                />
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <TextInputWithIcon
                  label={t("COMMON.STREET_ADDRESS")}
                  id="address"
                  name="address"
                  value={oFormData.address}
                  onChange={handleChange}
                  placeholder={t("COMMON.ENTER_STREET_ADDRESS")}
                  Icon={MapPin}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SelectWithIcon
                  label={t("COMMON.COUNTRY")}
                  id="country"
                  name="country"
                  value={oFormData.country}
                  onChange={handleChange}
                  options={getArray(aCountriesData).map((c) => ({
                    value: c.CountryID,
                    label: c.CountryName,
                  }))}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t("COMMON.STATE")}
                  id="state"
                  name="state"
                  value={oFormData.state}
                  onChange={handleChange}
                  options={getArray(aStatesData)
                    .filter(
                      (s) => String(s.CountryID) === String(oFormData.country)
                    )
                    .map((s) => ({ value: s.StateID, label: s.StateName }))}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <SelectWithIcon
                  label={t("COMMON.CITY")}
                  id="city"
                  name="city"
                  value={oFormData.city}
                  onChange={handleChange}
                  options={getArray(aCitiesData)
                    .filter(
                      (c) => String(c.StateID) === String(oFormData.state)
                    )
                    .map((c) => ({ value: c.CityID, label: c.CityName }))}
                  Icon={Building}
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t("COMMON.ZIP_CODE")}
                  id="zipCode"
                  name="zipCode"
                  value={oFormData.zipCode}
                  onChange={handleChange}
                  placeholder={t("COMMON.ENTER_ZIP_CODE")}
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
              {t("CREATE_STORE.CONTACT_INFORMATION")}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInputWithIcon
                  label={t("COMMON.PHONE_NUMBER")}
                  id="phone"
                  name="phone"
                  value={oFormData.phone}
                  onChange={handleChange}
                  placeholder={t("COMMON.ENTER_PHONE_NUMBER")}
                  Icon={Phone}
                  type="tel"
                  required
                />
              </div>
              <div>
                <TextInputWithIcon
                  label={t("COMMON.EMAIL_ADDRESS")}
                  id="email"
                  name="email"
                  value={oFormData.email}
                  onChange={handleChange}
                  placeholder={t("COMMON.ENTER_EMAIL_ADDRESS")}
                  Icon={Mail}
                  type="email"
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
            {t("COMMON.CANCEL")}
          </button>
          <button type="submit" className="btn-primary">
            {id ? t("COMMON.UPDATE") : t("COMMON.CREATE")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStore;
