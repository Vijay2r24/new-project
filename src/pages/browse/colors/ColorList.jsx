import { useState, useEffect } from 'react';
import { Edit, Trash} from 'lucide-react';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useColors } from '../../../context/AllDataContext';
import Pagination from '../../../components/Pagination';
import { showEmsg } from '../../../utils/ShowEmsg';
import { STATUS } from '../../../contants/constants';
import Switch from '../../../components/Switch';

const ColorList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const { data: aColors, loading: bLoading, error: sError, total: iTotalItems, fetch: fetchColors, toggleStatus: toggleColorStatus } = useColors();

  // Pagination state
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10); // Or a configurable value

  useEffect(() => {
    fetchColors({ pageNumber: nCurrentPage, pageSize: iItemsPerPage, searchText: sSearchQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nCurrentPage, iItemsPerPage, sSearchQuery]);

  const handleStatusChange = async (colorId, currentIsActive) => {
    try {
      const response = await toggleColorStatus(colorId, !currentIsActive);
      if (response.status === STATUS.ERROR) {
        showEmsg(response.message || t('COMMON.STATUS_UPDATE_ERROR'), STATUS.ERROR);
      } else {
        showEmsg(response.message || t('COMMON.STATUS_UPDATE_SUCCESS'), STATUS.SUCCESS);
      }
    } catch (error) {
      showEmsg(t('COMMON.UNEXPECTED_ERROR'), STATUS.ERROR);
    }
  };

  const filteredColorsByStatus = aColors.filter((color) => {
    const matchesStatus = sStatusFilter ? color.IsActive === (sStatusFilter === 'Active') : true;
    return matchesStatus;
  });

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("PRODUCT_SETUP.COLORS.TITLE")}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.COLORS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
        />
        {bShowFilters && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setStatusFilter('');
                setShowFilters(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('COMMON.ALL')}
            </button>
            <button
              onClick={() => {
                setStatusFilter('Active');
                setShowFilters(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('COMMON.ACTIVE')}
            </button>
            <button
              onClick={() => {
                setStatusFilter('Inactive');
                setShowFilters(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('COMMON.INACTIVE')}
            </button>
          </div>
        )}
      </div>

      {bLoading ? (
        <div className="text-center py-8 text-gray-500">{t('COMMON.LOADING')}</div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">{t('COMMON.ERROR')}: {sError}</div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.COLORS.TABLE.COLOR")}</th>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.COLORS.TABLE.HEX_CODE")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">{t("COMMON.UPDATE_STATUS")}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredColorsByStatus.map((color) => (
                  <tr key={color.ColorID} className="table-row">
                    <td className="table-cell table-cell-text">
                      <div className="flex items-center">
                        <div
                          className="h-6 w-6 rounded-full mr-3 border border-gray-200"
                          style={{ backgroundColor: color.HexCode }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/browse/editcolor/${color.ColourID}`} className="text-blue-600 hover:underline">
                            {color.Name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell table-cell-text text-secondary">{color.HexCode}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        color.IsActive
                          ? 'status-active'
                          : 'status-inactive'
                      }`}>
                        {color.IsActive ? t('COMMON.ACTIVE') : t('COMMON.INACTIVE')}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <Switch checked={color.IsActive} onChange={() => handleStatusChange(color.ColorID, color.IsActive)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {iTotalItems === 0 && !bLoading && !sError && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("PRODUCT_SETUP.COLORS.EMPTY.MESSAGE")}</div>
          {(sSearchQuery || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("COMMON.CLEAR_SEARCH")}
            </button>
          )}
        </div>
      )}

      {iTotalItems > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalPages={Math.ceil(iTotalItems / iItemsPerPage)}
          totalItems={iTotalItems}
          itemsPerPage={iItemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
    </div>
  );
};

export default ColorList;