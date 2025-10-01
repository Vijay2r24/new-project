import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPatch } from "../../utils/ApiUtils";
import {
  GET_ALL_ATTRIBUTES,
  GETALL_BRANDS,
  GETALL_CATEGORY,
  GET_All_COLORSAPI,
  ATTRIBUTE_TYPE,
  GET_ALL_ROLES_API,
  GET_ALL_STORES,
  GET_ALL_USERS,
  ORDER_STATUS_API,
  GET_ALL_PRODUCT_GROUPS,
  GET_All_PAYMENT_STATUS,
  GET_ALL_PAYMENT_METHODS,
  GET_ALL_PAYMENT_TYPES,
  GET_USER_BY_ID,
  GET_COUNTRIES,
  GET_STATES_BY_COUNTRY_ID,
  GET_CITIES_BY_STATE_ID
} from "../../contants/apiRoutes";
import { STATUS } from "../../contants/constants";

/**
 * Resource Configurations
 */
const aResourceConfigs = [
  { key: "attributes", api: GET_ALL_ATTRIBUTES, idField: "AttributeID" },
  { key: "colors", api: GET_All_COLORSAPI, idField: "ColourID" },
  { key: "attributeTypes", api: ATTRIBUTE_TYPE, idField: "AttributeTypeID" },
  { key: "roles", api: GET_ALL_ROLES_API, rolesPagination: true },
  { key: "stores", api: GET_ALL_STORES },
  { key: "brands", api: GETALL_BRANDS, idField: "BrandID" },
  { key: "categories", api: GETALL_CATEGORY, idField: "CategoryID" },
  { key: "users", api: GET_ALL_USERS, idField: "UserID" },
  { key: "orderStatuses", api: ORDER_STATUS_API },
  {
    key: "paymentStatus",
    api: GET_All_PAYMENT_STATUS,
    idField: "PaymentStatusID",
  },
  {
    key: "productGroups",
    api: GET_ALL_PRODUCT_GROUPS,
    idField: "ProductGroupID",
  },
  {
    key: "paymentMethods",
    api: GET_ALL_PAYMENT_METHODS,
    idField: "PaymentMethodID",
  },
  {
    key: "paymentTypes",
    api: GET_ALL_PAYMENT_TYPES,
    idField: "PaymentTypeID",
  },
  // New configurations for countries, states, and cities
  {
    key: "countries",
    api: GET_COUNTRIES,
    idField: "CountryID"
  },
  {
    key: "states",
    api: GET_STATES_BY_COUNTRY_ID,
    idField: "StateID"
  },
  {
    key: "cities",
    api: GET_CITIES_BY_STATE_ID,
    idField: "CityID"
  }
];

/**
 * FETCH RESOURCE
 */
export const fetchResource = createAsyncThunk(
  "allData/fetchResource",
 async ({ key, params = {} }, { rejectWithValue }) => {
  try {
    const config = aResourceConfigs.find((c) => c.key === key);
    if (!config) throw new Error(`Unknown resource: ${key}`);

    const token = localStorage.getItem("token");
    const response = await apiGet(config.api, params, token);

    let data = [];
    let total = 0;
    let pagination = {};

    // Your specific API response structure
    if (response.data?.status === STATUS.SUCCESS.toUpperCase()) {
      data = response.data.data || [];
      pagination = response.data.pagination || {};
      total = pagination.totalRecords || data.length;
    } else {
      // Fallback for other formats
      data = response.data?.data || [];
      pagination = response.data?.pagination || {};
      total = pagination.totalRecords || data.length;
    }

    return { key, data, total, pagination };
  } catch (err) {
    return rejectWithValue({ key, error: err.message });
  }
}
);

/**
 * UPDATE STATUS
 */
export const updateStatusById = createAsyncThunk(
  "allData/updateStatus",
  async ({ key, id, newStatus, apiRoute, idField }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { IsActive: newStatus ? true : false };
      const response = await apiPatch(`${apiRoute}/${id}`, payload, token);

      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        return { key, id, idField, payload, message: response.data.message };
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (err) {
      return rejectWithValue({ key, error: err.message });
    }
  }
);

/**
 * FETCH USER DETAILS
 */
export const fetchUserDetails = createAsyncThunk(
  "allData/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiGet(`${GET_USER_BY_ID}/${userId}`, {}, token);

      if (response?.data?.status === STATUS.SUCCESS.toUpperCase()) {
        const userData = response.data.data;
        localStorage.setItem("userDetails", JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(response?.data?.message || "Failed to fetch user details");
      }
    } catch (err) {
      localStorage.removeItem("userDetails");
      return rejectWithValue(err.message);
    }
  }
);

/**
 * FETCH STATES BY COUNTRY ID
 */
export const fetchStatesByCountryId = createAsyncThunk(
  "allData/fetchStatesByCountryId",
  async (countryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiGet(`${GET_STATES_BY_COUNTRY_ID}/${countryId}`, {}, token);

      let data = [];
      
      // Handle the new response format: { status: "SUCCESS", data: [...] }
      if (response.data?.status === STATUS.SUCCESS.toUpperCase()) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }

      return { key: "states", countryId, data };
    } catch (err) {
      return rejectWithValue({ key: "states", error: err.message, countryId });
    }
  }
);

/**
 * FETCH CITIES BY STATE ID
 */
export const fetchCitiesByStateId = createAsyncThunk(
  "allData/fetchCitiesByStateId",
  async (stateId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiGet(`${GET_CITIES_BY_STATE_ID}/${stateId}`, {}, token);

      let data = [];
      
      // Handle the new response format: { status: "SUCCESS", data: [...] }
      if (response.data?.status === STATUS.SUCCESS.toUpperCase()) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }

      return { key: "cities", stateId, data };
    } catch (err) {
      return rejectWithValue({ key: "cities", error: err.message, stateId });
    }
  }
);

/**
 * SLICE
 */
const allDataSlice = createSlice({
  name: "allData",
  initialState: {
    resources: {
      countries: { data: [], loading: false, error: null },
      states: { data: [], loading: false, error: null, countryId: null },
      cities: { data: [], loading: false, error: null, stateId: null }
    },
    userDetails: null,
    userDetailsError: null,
    userDetailsLoading: false,
  },
  reducers: {
    clearResourceError: (state, action) => {
      const key = action.payload;
      if (state.resources[key]) state.resources[key].error = null;
    },
    clearUserDetailsError: (state) => {
      state.userDetailsError = null;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
      localStorage.removeItem("userDetails");
    },
    clearStates: (state) => {
      state.resources.states = { data: [], loading: false, error: null, countryId: null };
    },
    clearCities: (state) => {
      state.resources.cities = { data: [], loading: false, error: null, stateId: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH RESOURCE lifecycle
      .addCase(fetchResource.pending, (state, action) => {
        const { key } = action.meta.arg;
        state.resources[key] = {
          ...(state.resources[key] || {}),
          loading: true,
          error: null,
        };
      })
      .addCase(fetchResource.fulfilled, (state, action) => {
        const { key, data, total, pagination } = action.payload;
        state.resources[key] = {
          data,
          total,
          pagination,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchResource.rejected, (state, action) => {
        const { key, error } = action.payload || {};
        state.resources[key] = {
          ...(state.resources[key] || {}),
          loading: false,
          error: error || "Failed to fetch",
        };
      })

      // UPDATE STATUS lifecycle
      .addCase(updateStatusById.fulfilled, (state, action) => {
        const { key, id, idField, payload } = action.payload;
        if (state.resources[key]?.data) {
          state.resources[key].data = state.resources[key].data.map((item) =>
            item[idField] === id ? { ...item, Status: payload.Status } : item
          );
        }
      })

      // FETCH USER DETAILS lifecycle
      .addCase(fetchUserDetails.pending, (state) => {
        state.userDetailsLoading = true;
        state.userDetailsError = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetails = action.payload;
        state.userDetailsError = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetails = null;
        state.userDetailsError = action.payload || "Failed to fetch user details";
      })

      // FETCH STATES BY COUNTRY ID lifecycle
      .addCase(fetchStatesByCountryId.pending, (state) => {
        state.resources.states = {
          ...state.resources.states,
          loading: true,
          error: null,
        };
      })
      .addCase(fetchStatesByCountryId.fulfilled, (state, action) => {
        const { countryId, data } = action.payload;
        state.resources.states = {
          data,
          loading: false,
          error: null,
          countryId,
        };
      })
      .addCase(fetchStatesByCountryId.rejected, (state, action) => {
        state.resources.states = {
          ...state.resources.states,
          loading: false,
          error: action.payload?.error || "Failed to fetch states",
        };
      })

      // FETCH CITIES BY STATE ID lifecycle
      .addCase(fetchCitiesByStateId.pending, (state) => {
        state.resources.cities = {
          ...state.resources.cities,
          loading: true,
          error: null,
        };
      })
      .addCase(fetchCitiesByStateId.fulfilled, (state, action) => {
        const { stateId, data } = action.payload;
        state.resources.cities = {
          data,
          loading: false,
          error: null,
          stateId,
        };
      })
      .addCase(fetchCitiesByStateId.rejected, (state, action) => {
        state.resources.cities = {
          ...state.resources.cities,
          loading: false,
          error: action.payload?.error || "Failed to fetch cities",
        };
      });
  },
});

export const { 
  clearResourceError, 
  clearUserDetailsError, 
  clearUserDetails, 
  clearStates, 
  clearCities 
} = allDataSlice.actions;

export default allDataSlice.reducer;