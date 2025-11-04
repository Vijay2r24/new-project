
export const STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
  WARNING:"warning",
  FAILURE:"failure"
};
export const DEFAULT_COLOR = "#000000";
export const COLORS = {
  PRIMARY: "#3498db",
  SECONDARY: "#2ecc71",
  ERROR: "#e74c3c",
};
export const STATUS_VALUES = {
  ALL: "",
  BOOLEAN_ACTIVE: true,
  BOOLEAN_INACTIVE: false,
};
export const STATUS_OPTIONS = [
  { value: STATUS_VALUES.ALL, labelKey: "COMMON.ALL" },
  { value: STATUS_VALUES.BOOLEAN_ACTIVE, labelKey: "COMMON.ACTIVE" },
  { value: STATUS_VALUES.BOOLEAN_INACTIVE, labelKey: "COMMON.INACTIVE" },
];
export const ITEMS_PER_PAGE = 10;
export const LOCALE = "en-US";
export const CURRENCY = "INR";  
export const ORDER_STATUS = {
  DELIVERED: "Delivered",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  SHIPPED: "Shipped",
  RETURNED: "Returned",
  PROCESSING:"Processing",
};
export const STATUS_DROPDOWN_OPTIONS = [
  { value: "true", labelKey: "COMMON.ACTIVE" },
  { value: "false", labelKey: "COMMON.INACTIVE" },
];
export const DEFAULT_PAGE =1;
export const DASHBOARD_DEFAULT_LIMIT = 7;
export const BANNER_WIDTH = 1200;
export const BANNER_HEIGHT = 600;

export const FILTERS = {
  STATUS: "status",
};
export const FORM_MODES = {
  CREATE: "create",
  EDIT: "edit",
};
export const VIEW_TYPES = {
  GRID: "grid",
  LIST: "list",
};
export const DATE_PICKER_CONFIG = {
  PRIMARY_COLOR: "purple",
  POPOVER_DIRECTION: "down",
  DISPLAY_FORMAT: "YYYY-MM-DD",
};
export const EXPORT_TYPES = {
  ORDER: "order",
  STORE: "store",
  PRODUCT: "product",
  PAYMENT: "payment",
};
export const DOWNLOAD_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
export const TOAST_DURATION = {
  SHORT: 1500,
  MEDIUM: 3000,
  LONG: 5000
};
export const DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
const getTodayDate = () => new Date().toISOString().split("T")[0];

export const REPORT_FILE_NAMES = {
  ORDERS: `orders-report-${getTodayDate()}.xlsx`,
  STORES: `stores-report-${getTodayDate()}.xlsx`,
  PRODUCTS: `products-report-${getTodayDate()}.xlsx`,
  PAYMENTS: `payments-report-${getTodayDate()}.xlsx`,
};
export const PASSWORD_VISIBILITY = {
  SHOW: "text",
  HIDE: "password"
};

export const PASSWORD_LABELS = {
  SHOW: "Hide",
  HIDE: "Show"
};
export const LOCALES = {
  ENGLISH_US: 'en-US',
  ENGLISH_INDIA: 'en-IN'
};
export const customShortcuts = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = new Date();
      return [start, end];
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [start, end];
    },
  },
];
// datePickerConstants.js
export const SHORTCUT_LABELS = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_7_DAYS: "Last 7 days",
  LAST_30_DAYS: "Last 30 days",
  THIS_MONTH: "This month",
  LAST_HOUR: "Last 1 hour",
  LAST_2_HOURS: "Last 2 hours",
  LAST_3_HOURS: "Last 3 hours",
  LAST_6_HOURS: "Last 6 hours",
  LAST_12_HOURS: "Last 12 hours",
  LAST_24_HOURS: "Last 24 hours"
};

export const TIME_PERIODS = {
  DAYS: {
    TODAY: 0,
    YESTERDAY: -1,
    LAST_7_DAYS: -6,
    LAST_30_DAYS: -29
  },
  HOURS: {
    LAST_HOUR: -1,
    LAST_2_HOURS: -2,
    LAST_3_HOURS: -3,
    LAST_6_HOURS: -6,
    LAST_12_HOURS: -12,
    LAST_24_HOURS: -24
  }
};
export const GENDER_OPTIONS = [
  { value: "Male", labelKey: "ADD_USER.GENDER_MALE" },
  { value: "Female", labelKey: "ADD_USER.GENDER_FEMALE" },
  { value: "Other", labelKey: "ADD_USER.GENDER_OTHER" },
];
export const VIEW_MODES = {
  TABLE: "table",
  GRID: "grid",
};
export const FILE_CONSTANTS = {
  BRAND_LOGO_PREFIX: "brand-logo",
  CATEGORY_IMAGE_PREFIX: "category-image",
  FILE_TYPE: "image/jpeg",
};

export const TOOLTIPSTATUS = {ACTIVE: 'active',INACTIVE: 'inactive'};
 