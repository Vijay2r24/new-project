import { Search, List, LayoutGrid, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

const OrderToolbar = ({
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    showFilterDropdown,
    setShowFilterDropdown,
    filterStatus,
    setFilterStatus,
    additionalFilters,
    handleFilterChange,
    searchPlaceholder,
    showSearch = true,
    showViewToggle = true,
    showFilterButton = true,
    onClearFilters,
}) => {
    const { t } = useTranslation();
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`btn-toggle-view ${viewMode === 'table' ? 'btn-highlighted' : 'btn-default'}`}
                            title={t('TOOLBAR.TABLE_VIEW')}
                        >
                            <List className="w-4 h-4 mr-1" />
                            {t('TOOLBAR.TABLE')}
                        </button>

                        <button
                            onClick={() => setViewMode('grid')}
                            className={`btn-toggle-view ${viewMode === 'grid' ? 'btn-highlighted' : 'btn-default'}`}
                            title={t('TOOLBAR.GRID_VIEW')}
                        >
                            <LayoutGrid className="w-4 h-4 mr-1" />
                            {t('TOOLBAR.GRID')}
                        </button>
                    </div>
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
            </div>

            {/* Filter Panel */}
            {showFilterDropdown && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-900">{t('TOOLBAR.FILTERS')}</h3>
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
                        {additionalFilters.map((filter, index) => (
                            <div key={index} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.label}
                                </label>
                                {filter.type === 'range' ? (
                                    <div className="flex flex-col items-center w-60">
                                        <div className="flex w-full justify-between mb-1">
                                            <span>{filter.value[0]}</span>
                                            <span>{filter.value[1]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={filter.min}
                                            max={filter.max}
                                            step={filter.step}
                                            value={filter.value[0]}
                                            onChange={e =>
                                                handleFilterChange(
                                                    { target: { value: [Number(e.target.value), filter.value[1]] } },
                                                    filter.name
                                                )
                                            }
                                            className="w-full mb-2"
                                        />
                                        <input
                                            type="range"
                                            min={filter.min}
                                            max={filter.max}
                                            step={filter.step}
                                            value={filter.value[1]}
                                            onChange={e =>
                                                handleFilterChange(
                                                    { target: { value: [filter.value[0], Number(e.target.value)] } },
                                                    filter.name
                                                )
                                            }
                                            className="w-full"
                                        />
                                    </div>
                                ) : filter.searchable ? (
                                    <Select
                                        value={filter.options && filter.options.find(opt => opt.value === filter.value) || null}
                                        onChange={option => handleFilterChange({ target: { value: option.value } }, filter.name)}
                                        options={filter.options}
                                        placeholder={filter.searchPlaceholder || 'Search...'}
                                        isSearchable
                                        className="w-48"
                                        classNamePrefix="react-select"
                                        onInputChange={filter.onInputChange}
                                    />
                                ) : (
                                    <select
                                        value={filter.value}
                                        onChange={e => handleFilterChange(e, filter.name)}
                                        className="block w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                                    >
                                        {filter.options && filter.options.map((option, idx) => (
                                            <option key={idx} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderToolbar;
