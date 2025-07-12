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
import Switch from '../components/Switch';
import { UPDATE_STORE_STATUS, DELETE_STORE } from '../contants/apiRoutes';
import { showEmsg } from '../utils/ShowEmsg';
import FullscreenErrorPopup from '../components/FullscreenErrorPopup';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { STATUS } from '../contants/constants';
import { apiDelete } from '../utils/ApiUtils';

const Stores = () => {
  const { t } = useTranslation();
  const { setBackButton, setTitle } = useTitle();
  const [sSearchTerm, setSearchTerm] = useState('');
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const defaultFilters = {
    status: '',
  };
  const [oFilters, setFilters] = useState(defaultFilters);
  const statusOptions = [
    { value: '', label: t('COMMON.ALL') },
    { value: 'Active', label: t('COMMON.ACTIVE') },
    { value: 'Inactive', label: t('COMMON.INACTIVE') },
  ];
  const aAdditionalFilters = [
    {
      label: t('COMMON.STATUS'),
      name: 'status',
      value: oFilters.status,
      options: statusOptions,
    },
  ];
  const [statusPopup, setStatusPopup] = useState({ open: false, storeId: null, newStatus: null });
  const [deletePopup, setDeletePopup] = useState({ open: false, storeId: null });
  const { data: aStores, loading, error, total: totalItems, fetch: fetchStores, updateStatusById } = useStores();
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table'); 
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const handleEdit = (StoreID) => {
    navigate(`/editStore/${StoreID}`);
  };
  const handleDelete = (storeId) => {
    setDeletePopup({ open: true, storeId });
  };
  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };
  const handleFilterChange = (e, filterName) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [filterName || name]: value
    }));
    setCurrentPage(1);
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
  const handleStatusChange = (storeId, isActive) => {
    setStatusPopup({ open: true, storeId, newStatus: !isActive });
  };
  const handleStatusConfirm = async () => {
    const { storeId, newStatus } = statusPopup;
    if (!updateStatusById) return;
    const result = await updateStatusById(storeId, newStatus, UPDATE_STORE_STATUS, 'StoreID');
    showEmsg(result.message, result.status);
    setStatusPopup({ open: false, storeId: null, newStatus: null });
  };
  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, storeId: null, newStatus: null });
  };
  const handleDeleteConfirm = async () => {
    const { storeId } = deletePopup;
    try {
      const token = localStorage.getItem('token');
      const oResponse = await apiDelete(`${DELETE_STORE}/${storeId}`, token);
      const backendMessage = oResponse.data.MESSAGE;
      showEmsg(backendMessage, STATUS.SUCCESS);
      fetchStores({
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm,
        status: oFilters.status,
      });
      setDeletePopup({ open: false, storeId: null });
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE;
      showEmsg(errorMessage || t('COMMON.API_ERROR'), STATUS.ERROR);
      setDeletePopup({ open: false, storeId: null });
    }
  };
  const handleDeletePopupClose = () => {
    setDeletePopup({ open: false, storeId: null });
  };
React.useEffect(() => {
  fetchStores({
    pageNumber: currentPage,
    pageSize: itemsPerPage,
    searchText: sSearchTerm,
    status: oFilters.status,
  });
  setTotalPages(Math.ceil((totalItems || 0) / itemsPerPage));
  setTitle(t('STORES.HEADING'));
  setBackButton(
    <BackButton onClick={() => navigate('/dashboard')} />
  );
  return () => {
    setBackButton(null);
    setTitle('');
  };
}, [currentPage, itemsPerPage, sSearchTerm, oFilters, totalItems, setBackButton, setTitle, t, navigate]);

React.useEffect(() => {
  setCurrentPage(1);
}, [sSearchTerm, oFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
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
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t('STORES.SEARCH_PLACEHOLDER')}
        onClearFilters={handleClearFilters}
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
                      <Switch checked={store.Status === 'Active'} onChange={() => handleStatusChange(store.StoreID, store.Status === 'Active')} />
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
                  <span className={`status-badge ${store.Status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                    {store.Status}
                  </span>
                  <Switch checked={store.Status === 'Active'} onChange={() => handleStatusChange(store.StoreID, store.Status === 'Active')} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {statusPopup.open && (
        <FullscreenErrorPopup
          open={statusPopup.open}
          message={statusPopup.newStatus
            ? t('STORES.STATUS_CONFIRM_ACTIVE')
            : t('STORES.STATUS_CONFIRM_INACTIVE')}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
      {deletePopup.open && (
        <FullscreenErrorPopup
          open={deletePopup.open}
          message={t('STORES.DELETE_CONFIRM_MESSAGE')}
          onClose={handleDeletePopupClose}
          onConfirm={handleDeleteConfirm}
        />
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