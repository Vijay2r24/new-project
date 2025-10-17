
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