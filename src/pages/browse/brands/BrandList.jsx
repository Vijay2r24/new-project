import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Edit, Trash,Search, Filter } from 'lucide-react';
import CreateBrand from './CreateBrand';

const BrandList = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [brands] = useState([
    { id: 1, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', status: 'Active', products: 150 },
    { id: 2, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', status: 'Active', products: 120 },
    { id: 3, name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Puma_logo.svg', status: 'Inactive', products: 80 },
  ]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter ? brand.status === statusFilter : true)
  );

  if (showCreate) {
    return <CreateBrand onBack={() => setShowCreate(false)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Brands</h2>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5B45E0] focus:border-[#5B45E0] sm:text-sm"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button onClick={() => { setStatusFilter(''); setShowFilters(false); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">All</button>
                <button onClick={() => { setStatusFilter('Active'); setShowFilters(false); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Active</button>
                <button onClick={() => { setStatusFilter('Inactive'); setShowFilters(false); }} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Inactive</button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden">
                      <img src={brand.logo} alt={brand.name} className="max-w-[70%] max-h-[70%] object-contain" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{brand.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      brand.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
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

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No brands found
          {searchQuery && (
            <div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandList;
