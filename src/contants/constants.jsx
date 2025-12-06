import dayjs from "dayjs";
export const STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  FAILURE: "failure",
};
export const DEFAULT_COLOR = "#000000";
export const COLORS = {
  GRAY_PRIMARY: "#e5efff",
  PRIMARY: "#3498db",
  SECONDARY: "#2ecc71",
  ERROR: "#e74c3c",
};
export const CUSTOM_COLORS = {
  primary: "#FF5A5F",
  primaryHover: "#E14E53",
  divider: "#FF5A5F",
  text: "#FFFFFF",
};
export const STATUS_VALUES = {
  ALL: "",
  BOOLEAN_ACTIVE: "true",
  BOOLEAN_INACTIVE: "false",
};
// Make sure it matches what your API expects
export const STATUS_OPTIONS = [
  { value: "", labelKey: "COMMON.ALL" },
  { value: "true", labelKey: "COMMON.ACTIVE" }, // or true for boolean
  { value: "false", labelKey: "COMMON.INACTIVE" }, // or false for boolean
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
  PROCESSING: "Processing",
};
export const STATUS_DROPDOWN_OPTIONS = [
  { value: "true", labelKey: "COMMON.ACTIVE" },
  { value: "false", labelKey: "COMMON.INACTIVE" },
];
export const DEFAULT_PAGE = 1;
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
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
export const TOAST_DURATION = {
  SHORT: 1500,
  MEDIUM: 3000,
  LONG: 5000,
  TO_LONG: 10000,
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
  HIDE: "password",
};

export const PASSWORD_LABELS = {
  SHOW: "Hide",
  HIDE: "Show",
};
export const LOCALES = {
  ENGLISH_US: "en-US",
  ENGLISH_INDIA: "en-IN",
};
export const customShortcuts = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const start = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      const end = new Date();
      return [start, end];
    },
  },
  {
    label: "Last Month",
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
  LAST_24_HOURS: "Last 24 hours",
};

export const TIME_PERIODS = {
  DAYS: {
    TODAY: 0,
    YESTERDAY: -1,
    LAST_7_DAYS: -6,
    LAST_30_DAYS: -29,
  },
  HOURS: {
    LAST_HOUR: -1,
    LAST_2_HOURS: -2,
    LAST_3_HOURS: -3,
    LAST_6_HOURS: -6,
    LAST_12_HOURS: -12,
    LAST_24_HOURS: -24,
  },
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

export const TOOLTIPSTATUS = { ACTIVE: "active", INACTIVE: "inactive" };

export const MODULES = {
  DASHBOARD: "Dashboard Management",
  ORDER: "Order Management",
  STORE: "Store Management",
  USER: "User Management",
  ROLE: "Role Management",
  CONTENT: "Content Management",
  PRODUCT: "Product Management",
};

export const PERMISSIONS = {
  EDIT_ROLE: "00000103-0000-0000-0000-000000000103",
  EDIT_STORE: "00000104-0000-0000-0000-000000000104",
  VIEW_DASHBOARD: "View Dashboard",

  VIEW_ORDERS: "View Orders",

  VIEW_STORE: "View Store",
  ADD_STORE: "Add Store",
  UPDATE_STORE: "Update Store",

  VIEW_USER: "View User",
  ADD_USER: "Add User",
  UPDATE_USER: "Update user",

  VIEW_ROLE: "View Role",
  ADD_ROLE: "Add Role",
  UPDATE_ROLE: "Update Role",

  VIEW_BANNERS: "View Banners",
  CREATE_BANNER: "Create Banner",
  UPDATE_BANNER: "Update Banner",
  SEND_NOTIFICATION: "Send Push Notification",

  VIEW_PRODUCTS: "View Products",
  CREATE_PRODUCT: "Create Product",
  UPDATE_PRODUCT: "Update Product",

  VIEW_BRANDS: "View Brands",
  UPDATE_BRAND: "Update Brand",

  VIEW_CATEGORIES: "View Categories",
  UPDATE_CATEGORY: "Update Category",

  VIEW_ATTRIBUTE_TYPES: "View Attribute Types",
  UPDATE_ATTRIBUTE_TYPE: "Update Attribute Type",

  VIEW_COLOURS: "View Colours",
  UPDATE_COLOUR: "Update Colour",

  VIEW_ATTRIBUTES: "View Attributes",
  UPDATE_ATTRIBUTE: "Update Attribute",

  VIEW_PRODUCT_GROUPS: "View Product Groups",
  UPDATE_PRODUCT_GROUP: "Update Product Group",
};
// quickFilters.js

export const QUICK_FILTER_VALUES = [
  "last3hours",
  "last6hours",
  "last12hours",
  "last24hours",
  "last2days",
  "last7days",
];

export const QUICK_FILTER_LABELS = [
  "Last 3 Hours",
  "Last 6 Hours",
  "Last 12 Hours",
  "Last 24 Hours",
  "Last 2 Days",
  "Last 7 Days",
];


export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const YEARS = Array.from(
  { length: 20 },
  (_, i) => dayjs().year() - 10 + i
);

export const DATE_FORMATS = {
  display: "MMM DD, HH:mm",
  time: "HH:mm",
  monthYear: "MMM",
  FULL_DATETIME_12_HOUR: "MMM D, YYYY h:mm A",
  DATE_DISPLAY: "MMM D, YYYY",
};
export const DATE_UNITS = {
  DAY: "day",
  DAYS: "days",
  HOUR: "hour",
  HOURS: "hours",
};
export const DEFAULT_COUNTRY = "IN";
export const FILETYPE= "image/jpeg";
export const SCROLL_CONSTANTS = {
  BEHAVIOR: "smooth",
  BLOCK: "center",
};
export const DEFAULT_PROPS = {
  showLabel: true,
  placeholder: "Select date range",
};

// Date range calculation functions
export const getDateRangeForFilter = (filter) => {
  const now = dayjs();

  switch (filter) {
    case "today":
      return { start: now.startOf("day"), end: now.endOf("day") };
    case "yesterday":
      return {
        start: now.subtract(1, "day").startOf("day"),
        end: now.subtract(1, "day").endOf("day"),
      };
    case "last7days":
      return {
        start: now.subtract(7, "days").startOf("day"),
        end: now.endOf("day"),
      };
    case "last30days":
      return {
        start: now.subtract(30, "days").startOf("day"),
        end: now.endOf("day"),
      };
    case "last1hour":
      return { start: now.subtract(1, "hour"), end: now };
    case "last12hours":
      return { start: now.subtract(12, "hours"), end: now };
    default:
      return { start: now.startOf("day"), end: now.endOf("day") };
  }
};

// Calendar configuration
export const CALENDAR_CONFIG = {
  totalDays: 42, // 6 weeks of calendar
  gridColumns: 7, // 7 days in a week
};
export const MESSAGES = {
  INACTIVE_USER_MESSAGE:
    "Your access permissions have been updated. Kindly <br/> log in again to proceed.",
  DEFAULT_ERROR_MESSAGE: "An unexpected error occurred. Please try again.",
};
// Style constants
export const STYLES = {
  primaryColor: "#FF5A5F",
  textColor: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    muted: "text-gray-400",
    white: "text-white",
  },
  backgroundColor: {
    primary: "bg-[#FF5A5F]",
    primaryHover: "bg-[#FF5A5F]/20",
    primaryLight: "bg-[#FF5A5F]/10",
    hover: "hover:bg-gray-100",
  },
  border: {
    focus: "focus:ring-1 focus:ring-[#FF5A5F]",
  },
  dimensions: {
    dayCell: "w-6 h-6",
    dropdown: {
      minWidth: {
        month: "min-w-[120px]",
        year: "min-w-[100px]",
      },
    },
  },
};
export const STATUS_VALUE_NAMES = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
export const COUNTRY_CODES = {
  INDIA: "+91",
  USA: "+1",
  UK: "+44",
  // Add more if needed
};
export const REGEX_CONSTANTS = {
  COMPONENT_NAME: /^[a-zA-Z0-9_]+$/,    // for componentName validation
  ROLE_NAME: /^[A-Za-z0-9\s\-_]+$/,     // for roleName validation
};
export const customScrollbarStyles = `
  .max-w-8xl::-webkit-scrollbar {
    display: none;
  }

  /* Custom scrollbar for table */
  .table-scroll-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .table-scroll-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  .table-scroll-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;