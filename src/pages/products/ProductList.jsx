import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../../components/Toolbar';
import Pagination from '../../components/Pagination';
import ActionButtons from '../../components/ActionButtons';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../../utils/ApiUtils.jsx';
import { getProductDetails } from '../../contants/apiRoutes';
import { useTitle } from '../../context/TitleContext';
import { STATUS } from '../../contants/constants.jsx';

const getStatusBadgeClass = (status) => {
  if (status === 'active') return 'status-active';
  if (status === 'out-of-stock') return 'status-inactive';
  return 'status-active';
};

const ProductList = () => {
  const [sSearchTerm, setSearchTerm] = useState('');
  const [sViewMode, setViewMode] = useState('table');
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sFilterStatus, setFilterStatus] = useState('all');
  const { t } = useTranslation();
  const itemsPerPage = 10; 
  const navigate = useNavigate();
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [aProducts, setProducts] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [nTotalItems, setTotalItems] = useState(0);
  const [nTotalPages, setTotalPages] = useState(0);
  const { setTitle } = useTitle();

  const handleEdit = (productId) => {
    navigate(`/Addproduct/${productId}`);
  };
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber: nCurrentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm,
      };
      const oResponse = await apiGet(getProductDetails, params, token);
      const resData = oResponse?.data;

      if (resData?.status === STATUS.SUCCESS.toUpperCase()) {
        setProducts(resData.data);
        setTotalItems(resData.totalRecords);
        setTotalPages(resData.totalPages);
      } else {
        setError(resData?.message || t('PRODUCTS.FETCH_ERROR'));
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || t('PRODUCTS.FETCH_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [nCurrentPage, itemsPerPage, sSearchTerm]);

  useEffect(() => {
    setTitle(t('PRODUCTS.TITLE'));
  }, [setTitle, t]);

  const handleDelete = (productId) => {
   
    alert('Delete product: ' + productId);
  };
  const [oFilters, setFilters] = useState({
    category: 'all',
    status: 'all',
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
  ];
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages)); 
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-secondary">{t('PRODUCTS.SUBTITLE')}</p>
          </div>
          <button
            onClick={() => navigate('/Addproduct')}
            className='btn-primary'
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('PRODUCTS.ADD_BTN')}
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
        searchPlaceholder={t('PRODUCTS.SEARCH_PLACEHOLDER')}
      />
      {bLoading ? (
        <div className="text-center py-8 text-gray-500">{t('COMMON.LOADING')}</div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">{t('PRODUCTS.FETCH_ERROR')}</div>
      ) : sViewMode === 'table' ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t('PRODUCTS.TITLE')}</th>
                  <th className="table-head-cell">{t('PRODUCTS.CATEGORY')}</th>
                  <th className="table-head-cell">{t('PRODUCTS.PRICE')}</th>
                  <th className="table-head-cell">{t('PRODUCTS.STOCK')}</th>
                  <th className="table-head-cell">{t('COMMON.STATUS')}</th>
                  <th className="table-head-cell">{t('PRODUCTS.STORE_NAME')}</th>
                  <th className="table-head-cell">{t('COMMON.ACTIONS')}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aProducts.map(product => (
                  <tr key={product.productId} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded object-cover" src={product.variants[0]?.images[0]} alt={product.productName} />
                        </div>
                      </div>
                    </td>
                    <td className="table-cell table-cell-text">{product.subCategory}</td>
                    <td className="table-cell text-left table-cell-text">
                      ₹{parseFloat(product.MRP).toFixed(2)}
                    </td>

                    <td className="table-cell text-center table-cell-text">{product.variants[0]?.quantity}</td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusBadgeClass(product.variants[0]?.quantity === 0 ? 'inactive' : 'active')}`}>
                        {(product.variants[0]?.quantity === 0 ? 'inactive' : 'Active').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="table-cell text-center table-cell-text">{product.storeName||'n/a'}</td>
                    <td className="table-cell text-center font-medium">
                      <ActionButtons
                        id={product.productId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMore={() => console.log('')}
                      />
                    </td>
                  </tr>
                ))}
                {aProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {t('PRODUCTS.NO_PRODUCTS')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aProducts.map(product => (
              <div key={product.productId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(product.variants[0]?.quantity === 0 ? 'inactive' : 'active')}`}>
                    {(product.variants[0]?.quantity === 0 ? 'inactive' : 'Active').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={product.variants[0]?.images[0]} alt={product.productName} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-900 mt-2">
                  <span className="font-medium">{t('PRODUCTS.CATEGORY')}</span> {product.subCategory}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-secondary">{t('PRODUCTS.STOCK')}<span className="font-semibold text-gray-900">{product.variants[0]?.quantity}</span></div>
                  <div className="text-lg font-bold text-indigo-600">${parseFloat(product.MRP).toFixed(2)}</div>
                </div>
                <ActionButtons
                  id={product.productId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMore={() => console.log('')}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <Pagination
        currentPage={nCurrentPage}
        totalPages={nTotalPages}
        totalItems={nTotalItems}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default ProductList;  