
import { Search, List, LayoutGrid, Filter } from 'lucide-react';

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
}) => {
    return (
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative h-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm h-full"
                             placeholder={searchPlaceholder || 'Search...'} // 👈 Use the prop here
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`btn-toggle-view ${viewMode === 'table' ? 'btn-highlighted' : 'btn-default'}`}
                        title="Table View"
                    >
                        <List className="w-4 h-4 mr-1" />
                        Table
                    </button>

                    <button
                        onClick={() => setViewMode('grid')}
                        className={`btn-toggle-view ${viewMode === 'grid' ? 'btn-highlighted' : 'btn-default'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4 mr-1" />
                        Grid
                    </button>
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${filterStatus !== 'all'
                            ? 'border-[#5B45E0] text-[#5B45E0] bg-[#5B45E0]/5'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </button>
            </div>

            {/* Filter Panel */}
            {showFilterDropdown && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                        {filterStatus !== 'all' && (
                            <button
                                onClick={() => setFilterStatus('all')}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Filter options in a row */}
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
