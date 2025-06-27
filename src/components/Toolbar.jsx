import { Search, List, LayoutGrid, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
                                placeholder={searchPlaceholder || t('toolbar.searchPlaceholder')}
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
                            title={t('toolbar.tableView')}
                        >
                            <List className="w-4 h-4 mr-1" />
                            {t('toolbar.table')}
                        </button>

                        <button
                            onClick={() => setViewMode('grid')}
                            className={`btn-toggle-view ${viewMode === 'grid' ? 'btn-highlighted' : 'btn-default'}`}
                            title={t('toolbar.gridView')}
                        >
                            <LayoutGrid className="w-4 h-4 mr-1" />
                            {t('toolbar.grid')}
                        </button>
                    </div>
                )}
                {showFilterButton && (
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`btn-toggle-view group ${showFilterDropdown ? 'btn-highlighted' : 'btn-default'}`}
                            title={t('toolbar.filter')}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {t('toolbar.filter')}
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            {showFilterDropdown && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-900">{t('toolbar.filters')}</h3>
                        {filterStatus !== 'all' && (
                            <button
                                onClick={() => setFilterStatus('all')}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                            >
                                {t('toolbar.clear')}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {additionalFilters.map((filter, index) => (
                            <div key={index} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.label}
                                </label>
                                <select
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(e, filter.name)}
                                    className="block w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                                >
                                    {filter.options.map((option, idx) => (
                                        <option key={idx} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderToolbar;
