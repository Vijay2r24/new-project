import { useState, useEffect } from 'react';
import CreateAttribute from './CreateAttribute';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAttributes } from '../../../context/AllDataContext';
import Pagination from '../../../components/Pagination';
import FullscreenErrorPopup from '../../../components/FullscreenErrorPopup';
import Switch from '../../../components/Switch';
import { showEmsg } from '../../../utils/ShowEmsg';
import { UPDATE_ATTRIBUTE_STATUS } from '../../../contants/apiRoutes';
import { ITEMS_PER_PAGE } from '../../../contants/constants';

const AttributeList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [oFilters, setFilters] = useState({ status: "all" });
  const [bShowFilter, setShowFilter] = useState(false);
  const [bShowCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  const { data: aAttributes = [], loading: bLoading, error: sError, total: iTotalItems, fetch, updateStatusById } = useAttributes();

  const [iCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE); 

  const [bShowErrorPopup, setShowErrorPopup] = useState(false);
  const [sErrorMessage, setErrorMessage] = useState('');

  const [statusPopup, setStatusPopup] = useState({ open: false, attributeId: null, newStatus: null });

  const iTotalPages = Math.ceil(iTotalItems / iItemsPerPage);

  useEffect(() => {
    const params = {
      pageNumber: iCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status && oFilters.status !== 'all') {
      params.status = oFilters.status;
    }
    fetch(params);
  }, [iCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  const handleStatusChange = (attributeId, currentIsActive) => {
    setStatusPopup({ open: true, attributeId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    const { attributeId, newStatus } = statusPopup;
    try {
      const result = await updateStatusById(attributeId, newStatus, UPDATE_ATTRIBUTE_STATUS, 'AttributeID');
      showEmsg(result.message, result.status);
    } finally {
      setStatusPopup({ open: false, attributeId: null, newStatus: null });
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, attributeId: null, newStatus: null });
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const handleNextPage = () => setCurrentPage((prev) => (prev < iTotalPages ? prev + 1 : prev));

  if (bShowCreate) {
    return <CreateAttribute onBack={() => setShowCreate(false)} />;
  }

  return (
    <>
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t('PRODUCT_SETUP.ATTRIBUTES.TITLE')}</h2>
      </div>
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilter}
          setShowFilterDropdown={setShowFilter}
          searchPlaceholder={t('PRODUCT_SETUP.ATTRIBUTES.SEARCH_PLACEHOLDER')}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          additionalFilters={bShowFilter ? [
            {
              label: t('COMMON.STATUS'),
              name: 'status',
              value: oFilters.status,
              options: [
                { value: 'all', label: t('COMMON.ALL') },
                { value: 'Active', label: t('COMMON.ACTIVE') },
                { value: 'Inactive', label: t('COMMON.INACTIVE') },
              ],
            },
          ] : []}
          handleFilterChange={bShowFilter ? handleFilterChange : undefined}
        />
      </div>
      {/* Table */}
        {bLoading && (
          <div className="text-center py-12 text-gray-500">
            {t('COMMON.LOADING')}
          </div>
        )}

        {sError && !bLoading && (
          <div className="text-center py-12 text-red-500">
             {sError}
          </div>
        )}

        {!bLoading && !sError && (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">{t('PRODUCT_SETUP.ATTRIBUTES.TABLE.NAME')}</th>
                    <th className="table-head-cell">{t('COMMON.DESCRIPTION')}</th>
                    <th className="table-head-cell">{t('COMMON.STATUS')}</th>
                    <th className="table-head-cell">
                 {t("COMMON.UPDATE_STATUS")}
                </th>
              </tr>
            </thead>
                <tbody className="table-body">
                  {aAttributes.map((attribute) => (
                    <tr key={attribute.AttributeID} className="table-row">
                      <td className="table-cell table-cell-text ">
                        <Link to={`/browse/editattribute/${attribute.AttributeID}`} className="text-blue-600 hover:underline">
                          {attribute.AttributeName}
                        </Link>
                      </td>
                      <td className="table-cell table-cell-text">{attribute.AttributeDescription}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attribute.Status === t("COMMON.ACTIVE")
                        ? 'status-active'
                        : 'status-inactive'
                      }`}>
                          {t(`COMMON.${attribute.Status === 'Active' ? 'ACTIVE' : 'INACTIVE'}`)}
                        </span>
                      </td>
                      <td className="table-cell table-cell-text">
                        <Switch checked={attribute.Status === t("COMMON.ACTIVE")} onChange={() => handleStatusChange(attribute.AttributeID, attribute.Status === t("COMMON.ACTIVE"))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!bLoading && !sError && aAttributes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t('PRODUCT_SETUP.ATTRIBUTES.EMPTY_MESSAGE')}</div>
            {(sSearchQuery || oFilters.status !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ status: 'all' });
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t('PRODUCT_SETUP.ATTRIBUTES.CLEAR_FILTERS_BTN')}
            </button>
          )}
        </div>
      )}
        {!bLoading && !sError && iTotalItems > 0 && (
          <Pagination
            itemsPerPage={iItemsPerPage}
            totalItems={iTotalItems}
            currentPage={iCurrentPage}
            totalPages={iTotalPages}
            handlePageClick={handlePageClick}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
          />
        )}
      </div>
      {bShowErrorPopup && (
        <FullscreenErrorPopup
          message={sErrorMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={statusPopup.newStatus ? t("PRODUCT_SETUP.ATTRIBUTES.CONFIRM_ACTIVATE") : t("PRODUCT_SETUP.ATTRIBUTES.CONFIRM_DEACTIVATE")}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  );
};

export default AttributeList;
