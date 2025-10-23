import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPost } from "../../utils/ApiUtils";
import {
  GENERATE_ORDER_REPORT,
  GET_STORE_REPORT,
  GET_PRODUCT_LIST_REPORT,
  GET_PAYMENT_REPORT,
} from "../../contants/apiRoutes";
import { showEmsg } from "../../utils/ShowEmsg";
import { EXPORT_TYPES, REPORT_FILE_NAMES, STATUS } from "../../contants/constants";
import i18next from "i18next"; 

/**
 * Export Order Report
 */
export const exportOrderReport = createAsyncThunk(
  "export/orderReport",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const requestData = {
        StartDate: startDate ? new Date(startDate).toISOString() : null,
        EndDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (!requestData.StartDate && !requestData.EndDate) {
        throw new Error(i18next.t("EXPORT.SELECT_DATE_RANGE_ORDERS"));
      }

      const filteredData = Object.fromEntries(
        Object.entries(requestData).filter(([, value]) => value !== null)
      );

      const response = await apiPost(GENERATE_ORDER_REPORT, filteredData, token, false, "blob");

      if (response.data) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = REPORT_FILE_NAMES.ORDERS;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: i18next.t("EXPORT.SUCCESS_ORDERS") };
      }
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return rejectWithValue(errorData.message);
        } catch {
          return rejectWithValue(i18next.t("EXPORT.FAILED"));
        }
      }

      const backendMessage = error.response?.data?.message;
      return rejectWithValue(backendMessage || i18next.t("EXPORT.FAILED"));
    }
  }
);

/**
 * Export Store Report
 */
export const exportStoreReport = createAsyncThunk(
  "export/storeReport",
  async ({ startDate, endDate, isActive }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const requestData = {
        StartDate: startDate ? new Date(startDate).toISOString() : null,
        EndDate: endDate ? new Date(endDate).toISOString() : null,
        IsActive: isActive !== undefined ? isActive.toString() : null,
      };

      if (!requestData.StartDate && !requestData.EndDate) {
        throw new Error(i18next.t("EXPORT.SELECT_DATE_RANGE_STORES"));
      }

      const filteredData = Object.fromEntries(
        Object.entries(requestData).filter(([, value]) => value !== null)
      );

      const response = await apiPost(GET_STORE_REPORT, filteredData, token, false, "blob");

      if (response.data) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = REPORT_FILE_NAMES.STORES;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: i18next.t("EXPORT.SUCCESS_STORES") };
      }

      throw new Error(i18next.t("EXPORT.NO_DATA"));
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return rejectWithValue(errorData.message);
        } catch {
          return rejectWithValue(i18next.t("EXPORT.FAILED"));
        }
      }

      const backendMessage = error.response?.data?.message;
      return rejectWithValue(backendMessage || i18next.t("EXPORT.FAILED"));
    }
  }
);

/**
 * Export Product Report
 */
export const exportProductReport = createAsyncThunk(
  "export/productReport",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const requestData = {
        StartDate: startDate ? new Date(startDate).toISOString() : null,
        EndDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (!requestData.StartDate && !requestData.EndDate) {
        throw new Error(i18next.t("EXPORT.SELECT_DATE_RANGE_PRODUCTS"));
      }

      const filteredData = Object.fromEntries(
        Object.entries(requestData).filter(([, value]) => value !== null)
      );

      const response = await apiPost(GET_PRODUCT_LIST_REPORT, filteredData, token, false, "blob");

      if (response.data) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = REPORT_FILE_NAMES.PRODUCTS;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: i18next.t("EXPORT.SUCCESS_PRODUCTS") };
      }

      throw new Error(i18next.t("EXPORT.NO_DATA"));
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return rejectWithValue(errorData.message);
        } catch {
          return rejectWithValue(i18next.t("EXPORT.FAILED"));
        }
      }

      const backendMessage = error.response?.data?.message;
      return rejectWithValue(backendMessage || i18next.t("EXPORT.FAILED"));
    }
  }
);

/**
 * Export Payment Report
 */
export const exportPaymentReport = createAsyncThunk(
  "export/paymentReport",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const requestData = {
        StartDate: startDate ? new Date(startDate).toISOString() : null,
        EndDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (!requestData.StartDate && !requestData.EndDate) {
        throw new Error(i18next.t("EXPORT.SELECT_DATE_RANGE_PAYMENTS"));
      }

      const filteredData = Object.fromEntries(
        Object.entries(requestData).filter(([, value]) => value !== null)
      );

      const response = await apiPost(GET_PAYMENT_REPORT, filteredData, token, false, "blob");

      if (response.data) {
        const blob = new Blob([response.data], {
          type: REPORT_FILE_NAMES.PAYMENTS,
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payments-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, message: i18next.t("EXPORT.SUCCESS_PAYMENTS") };
      }

      throw new Error(i18next.t("EXPORT.NO_DATA"));
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return rejectWithValue(errorData.message);
        } catch {
          return rejectWithValue(i18next.t("EXPORT.FAILED"));
        }
      }

      const backendMessage = error.response?.data?.message;
      return rejectWithValue(backendMessage || i18next.t("EXPORT.FAILED"));
    }
  }
);

const exportSlice = createSlice({
  name: "export",
  initialState: {
    orderExport: { loading: false, error: null },
    storeExport: { loading: false, error: null },
    productExport: { loading: false, error: null },
    paymentExport: { loading: false, error: null },
  },

reducers: {
  clearExportError: (state, action) => {
    const { exportType } = action.payload;
    if (exportType === EXPORT_TYPES.ORDER) state.orderExport.error = null;
    else if (exportType === EXPORT_TYPES.STORE) state.storeExport.error = null;
    else if (exportType === EXPORT_TYPES.PRODUCT) state.productExport.error = null;
    else if (exportType === EXPORT_TYPES.PAYMENT) state.paymentExport.error = null;
  },
},
  extraReducers: (builder) => {
    const handlePending = (section) => {
      section.loading = true;
      section.error = null;
    };
    const handleFulfilled = (section, action) => {
      section.loading = false;
      section.error = null;
      showEmsg(action.payload.message, STATUS.SUCCESS);
    };
    const handleRejected = (section, action) => {
      section.loading = false;
      section.error = action.payload;
      showEmsg(action.payload, STATUS.ERROR);
    };

    builder
      .addCase(exportOrderReport.pending, (s) => handlePending(s.orderExport))
      .addCase(exportOrderReport.fulfilled, (s, a) => handleFulfilled(s.orderExport, a))
      .addCase(exportOrderReport.rejected, (s, a) => handleRejected(s.orderExport, a))

      .addCase(exportStoreReport.pending, (s) => handlePending(s.storeExport))
      .addCase(exportStoreReport.fulfilled, (s, a) => handleFulfilled(s.storeExport, a))
      .addCase(exportStoreReport.rejected, (s, a) => handleRejected(s.storeExport, a))

      .addCase(exportProductReport.pending, (s) => handlePending(s.productExport))
      .addCase(exportProductReport.fulfilled, (s, a) => handleFulfilled(s.productExport, a))
      .addCase(exportProductReport.rejected, (s, a) => handleRejected(s.productExport, a))

      .addCase(exportPaymentReport.pending, (s) => handlePending(s.paymentExport))
      .addCase(exportPaymentReport.fulfilled, (s, a) => handleFulfilled(s.paymentExport, a))
      .addCase(exportPaymentReport.rejected, (s, a) => handleRejected(s.paymentExport, a));
  },
});

export const { clearExportError } = exportSlice.actions;
export default exportSlice.reducer;
