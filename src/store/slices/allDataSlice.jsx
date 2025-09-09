// src/store/allDataSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // Redux Toolkit helpers
import { apiGet, apiPatch } from "../../utils/ApiUtils"; // API helpers for GET & PATCH
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
} from "../../contants/apiRoutes"; // API endpoints (centralized constants)
import { STATUS } from "../../contants/constants"; // Shared constants like SUCCESS/ERROR

/**
 * Resource Configurations
 * Each object describes how to fetch/update a particular resource.
 * key        → resource name in Redux state
 * api        → API endpoint for this resource
 * idField    → primary key field (for status update, etc.)
 * rolesPagination → flag for handling custom API shape (example: roles)
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
    key: "productGroups",
    api: GET_ALL_PRODUCT_GROUPS,
    idField: "ProductGroupID",
  },
];

/**

  1. FETCH RESOURCE
  Thunk to fetch any resource (brands, categories, users, etc.)
  Usage:
  dispatch(fetchResource({ key: "brands", params: { pageNumber: 1, pageSize: 5 } }))
 */
export const fetchResource = createAsyncThunk(
  "allData/fetchResource",
  async ({ key, params = {} }, { rejectWithValue }) => {
    try {
      // Find resource configuration by key
      const config = aResourceConfigs.find((c) => c.key === key);
      if (!config) throw new Error(`Unknown resource: ${key}`);

      // Get auth token & call API
      const token = localStorage.getItem("token");
      const response = await apiGet(config.api, params, token);

      // Normalize API response into { data, total, pagination }
      let data = [];
      let total = 0;
      let pagination = {};

      if (response.data.pagination) {
        // Case 1: API returns { data: [], pagination: {} }
        data = response.data.data || [];
        pagination = response.data.pagination;
        total = pagination.totalRecords || 0;
      } else if (Array.isArray(response.data?.data?.data)) {
        // Case 2: Nested data array → { data: { data: [], totalRecords } }
        data = response.data.data.data;
        total = response.data.data.totalRecords || 0;
      } else {
        // Case 3: Flat response { data: [] } or other shapes
        data = response.data.data || [];
        total = response.data.totalRecords || 0;
      }

      return { key, data, total, pagination };
    } catch (err) {
      return rejectWithValue({ key, error: err.message });
    }
  }
);

/**
  2. UPDATE STATUS
  Thunk to toggle/update the "Status" (Active/Inactive) of an item

  Usage:

  dispatch(updateStatusById({
    key: "brands",
    id: 123,
    newStatus: true,
    apiRoute: GETALL_BRANDS,
    idField: "BrandID"
  }))
 */
export const updateStatusById = createAsyncThunk(
  "allData/updateStatus",
  async ({ key, id, newStatus, apiRoute, idField }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Backend expects "Active"/"Inactive"
      const payload = { IsActive: newStatus ? true : false };

      // Send PATCH request
      const response = await apiPatch(`${apiRoute}/${id}`, payload, token);

      // If success → return info to update state
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
 * 3. SLICE
 * Stores all fetched data under state.allData.resources[resourceKey]
 */
const allDataSlice = createSlice({
  name: "allData",
  initialState: {
    resources: {}, // Example: { brands: { data: [], loading: false, error: null } }
  },
  reducers: {
    /**
     * Clear the error for a specific resource
     * Example: dispatch(clearResourceError("brands"))
     */
    clearResourceError: (state, action) => {
      const key = action.payload;
      if (state.resources[key]) state.resources[key].error = null;
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
          // Update status in place
          state.resources[key].data = state.resources[key].data.map((item) =>
            item[idField] === id ? { ...item, Status: payload.Status } : item
          );
        }
      });
  },
});

// Export actions & reducer
export const { clearResourceError } = allDataSlice.actions;
export default allDataSlice.reducer;
