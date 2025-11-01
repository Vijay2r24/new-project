import React from "react";
import {
  Search,
  List,
  LayoutGrid,
  Filter,
  Plus,
  Download,
  ChevronDown,
} from "lucide-react";
import { Combobox } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import CustomDatePicker from "./CustomDatePicker";
import { VIEW_MODES } from "../contants/constants";

const OrderToolbar = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  showFilterDropdown,
  setShowFilterDropdown,
  additionalFilters,
  handleFilterChange,
  searchPlaceholder,
  showSearch = true,
  showViewToggle = true,
  showFilterButton = true,
  onClearFilters,
  onCreate,
  createLabel,
  onExport,
  exportLabel,
}) => {
  const { t } = useTranslation();

  // Separate filters
  const dateFilters = (additionalFilters || []).filter(
    (f) => f.type === "date"
  );
  const otherFilters = (additionalFilters || []).filter(
    (f) => f.type !== "date"
  );

  // Toggle between table and grid view
  const toggleViewMode = () => {
    setViewMode(viewMode === VIEW_MODES.TABLE ? VIEW_MODES.GRID : VIEW_MODES.TABLE);
  };

  return (
    <div className="mb-6">
      {/* Toolbar Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Search Box */}
        {showSearch && (
          <div className="flex-1">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-custom-bg focus:border-custom-bg sm:text-sm h-full"
                placeholder={
                  searchPlaceholder || t("TOOLBAR.SEARCH_PLACEHOLDER")
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* View Toggle */}
        {showViewToggle && (
          <button
            onClick={toggleViewMode}
            className={`btn-toggle-view flex items-center ${
              viewMode === "table" ? "btn-highlighted" : "btn-default"
            }`}
            title={
              viewMode === "table"
                ? t("TOOLBAR.SWITCH_TO_GRID")
                : t("TOOLBAR.SWITCH_TO_TABLE")
            }
          >
            {viewMode === "table" ? (
              <>
                <LayoutGrid className="w-4 h-4 mr-1" />
                {t("TOOLBAR.GRID")}
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-1" />
                {t("TOOLBAR.TABLE")}
              </>
            )}
          </button>
        )}

        {/* Filter Button */}
        {showFilterButton && (
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`btn-toggle-view group ${
                showFilterDropdown ? "btn-highlighted" : "btn-default"
              }`}
              title={t("TOOLBAR.FILTER")}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("TOOLBAR.FILTER")}
            </button>
          </div>
        )}

        {/* Date Range Filters - Now placed between Filter and Export buttons */}
        {dateFilters.map((filter, index) => (
          <div key={`date-${index}`} className="w-64 relative z-40">
            <CustomDatePicker
              value={filter.value}
              onChange={(val) =>
                handleFilterChange({ target: { value: val } }, filter.name)
              }
              name={filter.name}
              error={filter.error}
              disableFuture={filter.disableFuture}
              className="w-full h-full"
              showLabel={false}
              placeholder={filter.placeholder || "Select date range"}
            />
          </div>
        ))}

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 gap-2"
          >
            <Download className="w-4 h-4" />
            {exportLabel || "Export"}
          </button>
        )}

        {/* Create Button */}
        {onCreate && (
          <button
            onClick={onCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {createLabel || t("PRODUCTS.ADD_BTN")}
          </button>
        )}
      </div>

      {/* Filter Dropdown (now only contains combobox filters) */}
      {showFilterDropdown && otherFilters.length > 0 && (
        <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-visible z-0">
          {/* Clear button top-right */}
          <div className="flex justify-end mb-3">
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                {t("COMMON.CLEAR")}
              </button>
            )}
          </div>

          {/* Filter Fields (Only Combobox filters) */}
          <div className="flex flex-wrap gap-4">
            {otherFilters.map((filter, index) => (
              <div key={index} className="w-44">
                {" "}
                {/* Changed from w-40 to w-44 */}
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {filter.label || filter.name}
                </label>
                <Combobox
                  value={
                    filter.options?.find((opt) => opt.value === filter.value) ||
                    null
                  }
                  onChange={(option) =>
                    handleFilterChange(
                      { target: { value: option.value } },
                      filter.name
                    )
                  }
                >
                  <div className="relative">
                    <Combobox.Input
                      className="w-full border border-gray-300 rounded-md py-1.5 pl-3 pr-10 text-sm focus:ring-1 focus:ring-custom-bg focus:border-custom-bg"
                      displayValue={(option) => option?.label || ""}
                      placeholder={`Select ${filter.label || filter.name}`}
                      onChange={(event) => {
                        const inputValue = event.target.value.toLowerCase();
                        if (filter.onInputChange) {
                          filter.onInputChange(inputValue);
                        }
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {filter.options?.length > 0 ? (
                        filter.options.map((option) => (
                          <Combobox.Option
                            key={option.value}
                            value={option}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-1.5 pl-3 pr-9 ${
                                active
                                  ? "bg-custom-bg text-white"
                                  : "text-gray-900"
                              }`
                            }
                          >
                            {option.label}
                          </Combobox.Option>
                        ))
                      ) : (
                        <div className="py-1.5 px-3 text-gray-500 text-sm">
                          No options found
                        </div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderToolbar;
