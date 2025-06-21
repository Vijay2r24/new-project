import React, { useState } from 'react';
import { Plus,MapPin, Phone, Mail, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import Pagination from '../components/Pagination';
import ActionButtons from '../components/ActionButtons';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../utils/ApiUtils';
import { getAllStores } from '../contants/apiRoutes';
const Stores = () => {
  const { t } = useTranslation();
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sSearchTerm, setSearchTerm] = useState('');
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sFilterStatus, setFilterStatus] = useState('all');
  const [oFilters, setFilters] = useState({
    status: '',
    products: '',
    employees: ''
  });
  const aAdditionalFilters = [
    {
      label: t('stores.status'),
      name: 'status',
      type: 'select',
      value: oFilters.status,
      options: [
        { value: 'all', label: t('stores.status') + ' ' + t('stores.active') + '/' + t('stores.inactive') },
        { value: 'Active', label: t('stores.active') },
        { value: 'Inactive', label: t('stores.inactive') },
      ],
    },
  ];
  const [aStores, setStores] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleEdit = (StoreID) => {
    navigate(`/editStore/${StoreID}`);
  };
  const handleDelete = (storeId) => {
    console.log('Delete store:', storeId);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const hasActiveFilters = Object.values(oFilters).some(value => value !== '');
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
  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm || '',
      };
      const response = await apiGet(getAllStores, params, token);
      if (response.data.status === 'SUCCESS') {
        setStores(response.data.data || []);
        setTotalItems(response.data.totalRecords || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      setError('An error occurred while fetching stores');
    } finally {
      setLoading(false);
    }
  };

  fetchStores();
}, [currentPage, itemsPerPage, sSearchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {/* Header: Stores heading and Add Store in one row */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{t('stores.heading')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('stores.description')}</p>
          </div>
          <Link
            to="/add-store"
            className='btn-primary'
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('stores.add_store')}
          </Link>
        </div>
      </div>
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={sFilterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
        placeholder={t('stores.search_placeholder')}
      />

      {/* Stores List: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="table-container overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    {t('stores.store_details')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('stores.contact')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('stores.status')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('stores.inventory')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('stores.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aStores.map((store) => (
                  <tr key={store.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-custom-bg" />
                        </div>
                        <div className="ml-4">
                          <div className="table-cell-text">{store.StoreName}</div>
                          <div className="table-cell-subtext flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {store.AddressLine1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="table-cell-text flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {store.Phone}
                      </div>
                      <div className="table-cell-subtext flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {store.Email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${store.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <div>Products: {store.products}</div>
                      <div>Employees: {store.employees}</div>
                    </td>
                    <td className="table-cell text-left">
                      <ActionButtons
                        id={store.StoreID}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aStores.map(store => (
              <div key={store.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200">
                {/* Store Icon and Name */}
                <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                  <div className="flex-shrink-0 h-12 w-12 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-custom-bg" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{store.StoreName}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {store.AddressLine1}, {store.city}, {store.state}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${store.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{store.status}</span>
                  <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Products: {store.products}</span>
                  <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Employees: {store.employees}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{store.Phone}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:ml-4 max-w-full overflow-hidden">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate block">{store.Email}</span>
                  </div>

                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                  <ActionButtons
                    id={store.StoreID}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default Stores; 