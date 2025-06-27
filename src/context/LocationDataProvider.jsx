import { createContext, useEffect, useState } from "react";
export const LocationDataContext = createContext();
const LocationDataProvider = ({ children }) => {
  const [aCitiesData, setCitiesData] = useState([]);
  const [aStatesData, setStatesData] = useState([]);
  const [aCountriesData, setCountriesData] = useState([]);
  const [aOrderStatusData, setOrderStatusData] = useState([]); 
  const [bLoading, setLoading] = useState(true); 
  const oFetchDataFromLocalStorage = (key, setter) => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        setter(JSON.parse(data));
      } else {
        console.warn(`No ${key} data found in localStorage`);
      }
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error);
    }
  };
 
  useEffect(() => {
    const oFetchData = async () => {
      setLoading(true);
      oFetchDataFromLocalStorage("citiesData", setCitiesData);
      oFetchDataFromLocalStorage("statesData", setStatesData);
      oFetchDataFromLocalStorage("countriesData", setCountriesData);
      oFetchDataFromLocalStorage("orderStatusData", setOrderStatusData);
      setLoading(false);
    };
 
    oFetchData();
  }, []);
 
  return (
    <LocationDataContext.Provider
      value={{
        aCitiesData,
        aStatesData,
        aCountriesData,
        aOrderStatusData,
        bLoading,
      }}
    >
      {children}
    </LocationDataContext.Provider>
  );
};
 
export default LocationDataProvider;
