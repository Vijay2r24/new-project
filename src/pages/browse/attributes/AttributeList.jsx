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
const AttributeList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilter, setShowFilter] = useState(false);
  const [bShowCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  const { aAttributes, bLoading, sError } = useAttributes();

  const [iCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10); 

  const [bShowErrorPopup, setShowErrorPopup] = useState(false);
  const [sErrorMessage, setErrorMessage] = useState('');

const handleStatusChange = async (attributeId, currentIsActive) => {
  try {
    if (currentIsActive) {
      setErrorMessage(t('productSetup.attributes.statusUpdateWarning'));
      setShowErrorPopup(true);
      return; 
    }

    const response = { status: 'ERROR', message: 'API call for status toggle not implemented yet.' };

      if (response.status === STATUS.SUCCESS_1) {
        setShowErrorPopup(false);
        setErrorMessage('');
      } else {
        setErrorMessage(response.message || t('productSetup.attributes.statusUpdateError'));
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrorMessage(t('productSetup.attributes.statusUpdateError'));
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
        <h2 className="text-lg font-medium text-gray-900">{t('productSetup.attributes.title')}</h2>
      </div>

      {/* Filters */}
      <div className="mb-6">
         <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilter}
          setFilterStatus={setShowFilter}
          searchPlaceholder={t('productSetup.attributes.searchPlaceholder')}
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
                {t('common.all')}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('Active');
                  setShowFilter(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {t('common.active')}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('Inactive');
                  setShowFilter(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {t('common.inactive')}
              </button>
            </div>
          )}
      </div>
      {/* Table */}
        {bLoading && (
          <div className="text-center py-12 text-gray-500">
            {t('common.loading')}
          </div>
        )}

        {sError && !bLoading && (
          <div className="text-center py-12 text-red-500">
            {t('common.error')}: {sError}
          </div>
        )}

        {!bLoading && !sError && (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">{t('productSetup.attributes.table.name')}</th>
                    <th className="table-head-cell">{t('productSetup.attributes.table.description')}</th>
                    <th className="table-head-cell">{t('productSetup.attributes.table.status')}</th>
                    <th className="table-head-cell">
                 {t("common.updateStatus")}
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
                          {t(`common.${attribute.IsActive ? 'active' : 'inactive'}`)}
                    </span>
                  </td>
                      <td className="table-cell table-cell-text">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                            checked={attribute.IsActive}
                            onChange={() => handleStatusChange(attribute.AttributeID, attribute.IsActive)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
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
          <div className="text-gray-500">{t('productSetup.attributes.emptyMessage')}</div>
            {(sSearchQuery || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t('productSetup.attributes.clearFilters-btn')}
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
