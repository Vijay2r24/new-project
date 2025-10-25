
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

export const STATUS_DROPDOWN_OPTIONS = [
  { value: "true", labelKey: "COMMON.ACTIVE" },
  { value: "false", labelKey: "COMMON.INACTIVE" },
];
export const DEFAULT_PAGE =1;
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