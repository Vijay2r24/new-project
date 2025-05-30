import React, { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../../components/Toolbar';
import Pagination from '../../components/Pagination';
import ActionButtons from '../../components/ActionButtons';
import { useTranslation } from 'react-i18next';
const aMockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with long battery life.',
    price: 129.99,
    stock: 25,
    category: 'Electronics',
    status: 'active',
    image: 'https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=300',
    storeName: 'Global Store'
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Fitness and health tracking smart watch with heart rate monitor.',
    price: 199.99,
    stock: 3,
    category: 'Electronics',
    status: 'active',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300',
    storeName: 'Main Branch'
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 20 hours of battery life.',
    price: 79.99,
    stock: 15,
    category: 'Electronics',
    status: 'active',
    image: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=300',
    storeName: 'Downtown Store'
  },
  {
    id: '4',
    name: 'Smartphone',
    description: 'Latest generation smartphone with professional camera.',
    price: 899.99,
    stock: 0,
    category: 'Electronics',
    status: 'out-of-stock',
    image: 'https://images.pexels.com/photos/699122/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=300',
    storeName: 'Global Store'
  },
  {
    id: '5',
    name: 'Laptop',
    description: 'High-performance laptop for gaming and professional use.',
    price: 1299.99,
    stock: 8,
    category: 'Computers',
    status: 'active',
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300',
    storeName: 'Main Branch'
  }
];

const getStatusBadgeClass = (status) => {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'out-of-stock') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const ProductList = () => {
  const [sSearchTerm, setSearchTerm] = useState('');
  const [sViewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sFilterStatus, setFilterStatus] = useState('all');
  const { t } = useTranslation();
  const itemsPerPage = 3;
  const navigate = useNavigate();
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const handleEdit = (productId) => {
    // TODO: Implement edit functionality
    alert('Edit product: ' + productId);
  };

  const handleDelete = (productId) => {
    // TODO: Implement delete functionality
    alert('Delete product: ' + productId);
  };
  const [oFilters, setFilters] = useState({
    category: 'all',
    status: 'all',
    storeName: 'all',
  });
  const additionalFilters = [
    {
      label: 'Category',
      name: 'category',
      value: oFilters.category,
      aOptions: [
        { value: 'all', label: 'All' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Computers', label: 'Computers' },
      ],
    },
    {
      label: 'Status',
      name: 'status',
      value: oFilters.status,
      aOptions: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'out-of-stock', label: 'Out of Stock' },
      ],
    },
    {
      label: 'Store Name',
      name: 'storeName',
      value: oFilters.storeName,
      aOptions: [
        { value: 'all', label: 'All' },
        ...Array.from(new Set(aMockProducts.map(product => product.storeName))).map(storeName => ({
          value: storeName,
          label: storeName
        })),
      ],
    },
  ];
  // Handle change for additional filters
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
  const filteredProducts = aMockProducts.filter(product => {
    // Search term matching
    const matchesSearch = product.name.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(sSearchTerm.toLowerCase());

    // Category matching
    const matchesCategory = oFilters.category === 'all' || product.category === oFilters.category;

    // Status matching
    const matchesStatus = oFilters.status === 'all' || product.status === oFilters.status;

    // Store Name matching
    const matchesStoreName = oFilters.storeName === 'all' || product.storeName === oFilters.storeName;

    // Return filtered result based on all criteria
    return matchesSearch && matchesCategory && matchesStatus && matchesStoreName;
  });


  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (nCurrentPage - 1) * itemsPerPage,
    nCurrentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  const categories = Array.from(new Set(aMockProducts.map(product => product.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('products.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/Addproduct')}
            className='btn-primary'
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('products.add-btn')}
          </button>
        </div>
      </div>

      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={sFilterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t('products.searchPlaceholder')}
      />
      {/* Products List: Table or Grid View */}
      {sViewMode === 'table' ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Product</th>
                  <th className="table-head-cell">{t('products.category')}</th>
                  <th className="table-head-cell">{t('products.price')}</th>
                  <th className="table-head-cell">{t('products.stock')}</th>
                  <th className="table-head-cell">{t('products.status')}</th>
                  <th className="table-head-cell">{t('products.storeName')}</th>
                  <th className="table-head-cell">{t('products.actions')}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {paginatedProducts.map(product => (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="table-cell-text">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell table-cell-text">{product.category}</td>
                    <td className="table-cell table-cell-text">${product.price.toFixed(2)}</td>
                    <td className="table-cell table-cell-text">{product.stock}</td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                        {product.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">{product.storeName}</td>
                    <td className="table-cell text-right font-medium">
                      <ActionButtons
                        id={''}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMore={() => console.log('')}
                      />
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                     {t('products.noProducts')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                    {product.name}
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>{product.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2 max-w-[180px]">{product.description.split(' ').slice(0, 2).join(' ') + (product.description.split(' ').length > 2 ? '...' : '')}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-900 mt-2">
                  <span className="font-medium">{t('products.category')}</span> {product.category}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-500">{t('products.stock')}<span className="font-semibold text-gray-900">{product.stock}</span></div>
                  <div className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</div>
                </div>
                <ActionButtons
                  id={product.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMore={() => console.log('')}
                />
              </div>
            ))}
          </div>
        </>
      )}
      {/* Pagination component */}
      <Pagination
        currentPage={nCurrentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default ProductList; 