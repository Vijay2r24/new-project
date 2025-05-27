import React, { useState } from 'react';
import { Edit, Trash, Search, Filter } from 'lucide-react';

const ColorList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [colors] = useState([
    { id: 1, name: 'Red', hex: '#FF0000', status: 'Active', products: 120 },
    { id: 2, name: 'Blue', hex: '#0000FF', status: 'Active', products: 150 },
    { id: 3, name: 'Green', hex: '#00FF00', status: 'Inactive', products: 80 },
  ]);

  const filteredColors = colors.filter((color) => {
    const matchesSearch = color.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? color.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Colors</h2>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 relative">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                placeholder="Search colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter by status */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setShowFilters(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Active');
                    setShowFilters(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Inactive');
                    setShowFilters(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Inactive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hex Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 rounded-full mr-3 border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-sm font-medium text-gray-900">{color.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{color.hex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{color.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      color.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {color.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(store.id)} className="action-button" title="Edit">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="action-button" title="Delete">
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredColors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No colors found</div>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorList;
