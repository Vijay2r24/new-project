import React, { useState } from 'react';
import { Plus,MapPin, Phone, Mail, Building, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import Pagination from '../components/Pagination';
import ActionButtons from '../components/ActionButtons';
import { useTranslation } from 'react-i18next';
import { useStores } from '../context/AllDataContext';
import { useTitle } from '../context/TitleContext';
import BackButton from '../components/BackButton';

const Stores = () => {
  const { t } = useTranslation();
  const { setBackButton, setTitle } = useTitle();
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
      label: t('STORES.STATUS'),
      name: 'status',
      type: 'select',
      value: oFilters.status,
      options: [
        { value: 'all', label: t('STORES.STATUS') + ' ' + t('STORES.ACTIVE') + '/' + t('STORES.INACTIVE') },
        { value: 'Active', label: t('STORES.ACTIVE') },
        { value: 'Inactive', label: t('STORES.INACTIVE') },
      ],
    },
  ];
  const { data: aStores, loading, error, total: totalItems, fetch: fetchStores } = useStores();
  const itemsPerPage = 3;
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table'); 
  const [currentPage, setCurrentPage] = useState(1);
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
  fetchStores({ pageNumber: currentPage, pageSize: itemsPerPage, searchText: sSearchTerm });
  setTotalPages(Math.ceil(totalItems / itemsPerPage));
  setTitle(t('STORES.HEADING'));
  setBackButton(
    <BackButton onClick={() => navigate('/dashboard')} />
  );
  return () => {
    setBackButton(null);
    setTitle('');
  };
}, [currentPage, itemsPerPage, sSearchTerm, totalItems, fetchStores, setBackButton, setTitle, t, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-secondary">{t('STORES.DESCRIPTION')}</p>
          </div>
          <Link
            to="/add-store"
            className='btn-primary'
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('STORES.ADD_STORE')}
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
        searchPlaceholder={t('STORES.SEARCH_PLACEHOLDER')}
      />
      {viewMode === 'table' ? (
        <div className="table-container overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    {t('STORES.STORE_DETAILS')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('STORES.CONTACT')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('COMMON.STATUS')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('STORES.INVENTORY')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('COMMON.ACTIONS')}
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
                        ? 'status-active'
                        : 'status-inactive'
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
                <div className="flex flex-col gap-3 text-sm text-caption">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{store.Phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{store.Email}</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className={`status-badge ${store.status === 'Active'
                    ? 'status-active'
                    : 'status-inactive'
                    }`}>
                    {store.status}
                  </span>
                  <ActionButtons
                    id={store.StoreID}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageClick}
          />
        </>
      )}
    </div>
  );
};

export default Stores;