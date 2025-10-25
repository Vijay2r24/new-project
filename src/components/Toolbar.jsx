import { Search, List, LayoutGrid, Filter, Plus, Download, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import CustomDatePicker from './CustomDatePicker';

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

  // Remove any explicit end-date filter entries and conditionally filter date picker
  const filtersToRender = (additionalFilters || []).filter((f) => {
    const n = (f?.name || '').toString().toLowerCase();
    const isEndDate = n !== 'enddate' && n !== 'end_date' && n !== 'end';
    const isDatePicker = f.type === 'date';
    
    // Only show date picker if export functionality is available
    if (isDatePicker && !onExport) {
      return false;
    }
    
    return isEndDate;
  });

  // Toggle between table and grid view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'grid' : 'table');
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {showSearch && (
          <div className="flex-1">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-custom-bg focus:border-custom-bg sm:text-sm h-full"
                placeholder={searchPlaceholder || t('TOOLBAR.SEARCH_PLACEHOLDER')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {showViewToggle && (
          <button
            onClick={toggleViewMode}
            className={`btn-toggle-view flex items-center ${viewMode === 'table' ? 'btn-highlighted' : 'btn-default'}`}
            title={viewMode === 'table' ? t('TOOLBAR.SWITCH_TO_GRID') : t('TOOLBAR.SWITCH_TO_TABLE')}
          >
            {viewMode === 'table' ? (
              <>
                <LayoutGrid className="w-4 h-4 mr-1" />
                {t('TOOLBAR.GRID')}
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-1" />
                {t('TOOLBAR.TABLE')}
              </>
            )}
          </button>
        )}

        {showFilterButton && (
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`btn-toggle-view group ${showFilterDropdown ? 'btn-highlighted' : 'btn-default'}`}
              title={t('TOOLBAR.FILTER')}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('TOOLBAR.FILTER')}
            </button>
          </div>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 gap-2"
          >
            <Download className="w-4 h-4" />
            {exportLabel || 'Export'}
          </button>
        )}

        {onCreate && (
          <button
            onClick={onCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {createLabel || t('PRODUCTS.ADD_BTN')}
          </button>
        )}
      </div>

      {showFilterDropdown && (
        <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-visible z-30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900"></h3>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-secondary hover:text-gray-700 flex items-center"
              >
                {t('COMMON.CLEAR')}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {filtersToRender.map((filter, index) => {
              if (filter.type === 'date') {
                return (
                  <div key={index} className="mb-4 w-64 relative z-40">
                    <CustomDatePicker
                      label={filter.label}
                      value={filter.value}
                      onChange={(val) =>
                        handleFilterChange({ target: { value: val } }, filter.name)
                      }
                      name={filter.name}
                      error={filter.error}
                      disableFuture={filter.disableFuture}
                      className="w-full" // Ensure date picker uses full width of container
                    />
                  </div>
                );
              }
              if (filter.type !== 'range') {
                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    {filter.searchable ? (
                      <Select
                        value={
                          (filter.options &&
                            filter.options.find((opt) => opt.value === filter.value)) ||
                          null
                        }
                        onChange={(option) =>
                          handleFilterChange(
                            { target: { value: option.value } },
                            filter.name
                          )
                        }
                        options={filter.options}
                        placeholder=""
                        isSearchable
                        className="w-48"
                        classNamePrefix="react-select"
                        onInputChange={filter.onInputChange}
                        components={{
                          DropdownIndicator: () => (
                            <div className="pl-2 flex items-center">
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          ),
                          IndicatorSeparator: () => null,
                        }}
                      />
                    ) : (
                      <Select
                        value={
                          (filter.options &&
                            filter.options.find((opt) => opt.value === filter.value)) ||
                          null
                        }
                        onChange={(option) =>
                          handleFilterChange(
                            { target: { value: option.value } },
                            filter.name
                          )
                        }
                        options={filter.options}
                        placeholder="Select option..."
                        isSearchable={false}
                        className="w-48"
                        classNamePrefix="react-select"
                        components={{
                          DropdownIndicator: () => (
                            <div className="pl-2 flex items-center">
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          ),
                          IndicatorSeparator: () => null,
                        }}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderToolbar;