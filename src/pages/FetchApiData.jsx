
import { apiGet } from '../utils/ApiUtils'
import {CITIES_API,STATES_API,COUNTRIES_API,ORDER_STATUS_API} from '../contants/apiRoutes'

export const fetchApiData = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found. API calls aborted.");
    return;
  }
  // Check for stored data
  const storedCitiesData = localStorage.getItem("citiesData");
  const storedStatesData = localStorage.getItem("statesData");
  const storedCountriesData = localStorage.getItem("countriesData");
  const storedOrderStatusData = localStorage.getItem("orderStatusData");

  try {
    const [
      cities,
      states,
      countries,
      orderStatusResponse
    ] = await Promise.all([
      storedCitiesData ? JSON.parse(storedCitiesData) : apiGet(CITIES_API, {}, token).then(res => res?.data || null),
      storedStatesData ? JSON.parse(storedStatesData) : apiGet(STATES_API, {}, token).then(res => res?.data || null),
      storedCountriesData ? JSON.parse(storedCountriesData) : apiGet(COUNTRIES_API, {}, token).then(res => res?.data || null),
      storedOrderStatusData ? JSON.parse(storedOrderStatusData) : apiGet(ORDER_STATUS_API, {}, token).then(res => res?.data || null),
    ]);

    if (cities) localStorage.setItem("citiesData", JSON.stringify(cities));
    if (states) localStorage.setItem("statesData", JSON.stringify(states));
    if (countries) localStorage.setItem("countriesData", JSON.stringify(countries));
    if (orderStatusResponse) localStorage.setItem("orderStatusData", JSON.stringify(orderStatusResponse));

  } catch (error) {
    console.error("Error fetching API data:", error);
  }
};
