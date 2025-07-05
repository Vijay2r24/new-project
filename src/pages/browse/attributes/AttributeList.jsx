import { useState } from 'react';
import { Edit, Trash, } from 'lucide-react';
import CreateAttribute from './CreateAttribute';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAttributes } from '../../../context/AllDataContext';
import Pagination from '../../../components/Pagination';
import FullscreenErrorPopup from '../../../components/FullscreenErrorPopup';
import { STATUS } from '../../../contants/constants';
import Switch from '../../../components/Switch';

const AttributeList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilter, setShowFilter] = useState(false);
  const [bShowCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  const { data: aAttributes = [], loading: bLoading, error: sError } = useAttributes();

  const [iCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10); 

  const [bShowErrorPopup, setShowErrorPopup] = useState(false);
  const [sErrorMessage, setErrorMessage] = useState('');

const handleStatusChange = async (attributeId, currentIsActive) => {
  try {
    if (currentIsActive) {
      setErrorMessage(t('PRODUCT_SETUP.ATTRIBUTES.STATUS_UPDATE_WARNING'));
      setShowErrorPopup(true);
      return; 
    }

    const response = { status: 'ERROR', message: 'API call for status toggle not implemented yet.' };

      if (response.status === STATUS.SUCCESS.toUpperCase()) {
        setShowErrorPopup(false);
        setErrorMessage('');
      } else {
        setErrorMessage(response.message || t('PRODUCT_SETUP.ATTRIBUTES.STATUS_UPDATE_ERROR'));
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrorMessage(t('PRODUCT_SETUP.ATTRIBUTES.STATUS_UPDATE_ERROR'));
      setShowErrorPopup(true);
    }
  };
  const filteredAttributes = aAttributes.filter(attribute => {
    return attribute.AttributeName.toLowerCase().includes(sSearchQuery.toLowerCase());
  });

  const iTotalPages = Math.ceil(filteredAttributes.length / iItemsPerPage);
  const iIndexOfLastItem = iCurrentPage * iItemsPerPage;
  const iIndexOfFirstItem = iIndexOfLastItem - iItemsPerPage;
  const currentItems = filteredAttributes.slice(iIndexOfFirstItem, iIndexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (bShowCreate) {
    return <CreateAttribute onBack={() => setShowCreate(false)} />;
  }

  return (
    <>
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t('PRODUCT_SETUP.ATTRIBUTES.TITLE')}</h2>
      </div>

      {/* Filters */}
      <div className="mb-6">
         <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t('PRODUCT_SETUP.ATTRIBUTES.SEARCH_PLACEHOLDER')}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
          {bShowFilter && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setShowFilter(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {t('COMMON.ALL')}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('Active');
                  setShowFilter(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {t('COMMON.ACTIVE')}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('Inactive');
                  setShowFilter(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {t('COMMON.INACTIVE')}
              </button>
            </div>
          )}
      </div>
      {/* Table */}
        {bLoading && (
          <div className="text-center py-12 text-gray-500">
            {t('COMMON.LOADING')}
          </div>
        )}

        {sError && !bLoading && (
          <div className="text-center py-12 text-red-500">
            {t('COMMON.ERROR')}: {sError}
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
                  {currentItems.map((attribute) => (
                    <tr key={attribute.AttributeID} className="table-row">
                      <td className="table-cell table-cell-text ">
                        <Link to={`/browse/editattribute/${attribute.AttributeID}`} className="text-blue-600 hover:underline">
                          {attribute.AttributeName}
                    </Link>
                  </td>
                      <td className="table-cell table-cell-text">{attribute.Description}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attribute.IsActive
                        ? 'status-active'
                        : 'status-inactive'
                      }`}>
                          {t(`COMMON.${attribute.IsActive ? 'ACTIVE' : 'INACTIVE'}`)}
                    </span>
                  </td>
                      <td className="table-cell table-cell-text">
                    <Switch checked={attribute.IsActive} onChange={() => handleStatusChange(attribute.AttributeID, attribute.IsActive)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        )}

      {/* Empty State */}
        {!bLoading && !sError && filteredAttributes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t('PRODUCT_SETUP.ATTRIBUTES.EMPTY_MESSAGE')}</div>
            {(sSearchQuery || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t('PRODUCT_SETUP.ATTRIBUTES.CLEAR_FILTERS_BTN')}
            </button>
          )}
        </div>
      )}
        {!bLoading && !sError && filteredAttributes.length > 0 && (
          <Pagination
            itemsPerPage={iItemsPerPage}
            totalItems={filteredAttributes.length}
            paginate={paginate}
            currentPage={iCurrentPage}
          />
        )}
      </div>
      {bShowErrorPopup && (
        <FullscreenErrorPopup
          message={sErrorMessage}
          onClose={() => setShowErrorPopup(false)}
        />
      )}

    </>
  );
};

export default AttributeList;
