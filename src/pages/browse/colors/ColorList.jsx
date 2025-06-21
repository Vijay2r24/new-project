import { useState, useEffect } from 'react';
import { Edit, Trash} from 'lucide-react';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useColors } from '../../../context/ColorContext';
import Pagination from '../../../components/Pagination';
import { showEmsg } from '../../../utils/ShowEmsg';

const ColorList = () => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const { aColors, bLoading, sError, fetchColors, iTotalItems, toggleColorStatus } = useColors();

  // Pagination state
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10); // Or a configurable value

  useEffect(() => {
    fetchColors(nCurrentPage, iItemsPerPage, sSearchQuery);
  }, [nCurrentPage, iItemsPerPage, sSearchQuery, fetchColors]);

  const handleStatusChange = async (colorId, currentIsActive) => {
    try {
      const response = await toggleColorStatus(colorId, !currentIsActive);
      if (response.status === 'ERROR') {
        showEmsg(response.message, 'error');
      } else {
        showEmsg(response.message || 'Status updated successfully.', 'success');
      }
    } catch (error) {
      console.error('Error updating color status:', error);
      showEmsg('An unexpected error occurred during status update.', 'error');
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
        <h2 className="text-lg font-medium text-gray-900">{t("productSetup.colors.title")}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("productSetup.colors.searchPlaceholder")}
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
              {t('common.all')}
            </button>
            <button
              onClick={() => {
                setStatusFilter('Active');
                setShowFilters(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('common.active')}
            </button>
            <button
              onClick={() => {
                setStatusFilter('Inactive');
                setShowFilters(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {t('common.inactive')}
            </button>
          </div>
        )}
      </div>

      {bLoading ? (
        <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">{t('common.error')}: {sError}</div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("productSetup.colors.table.color")}</th>
                  <th className="table-head-cell">{t("productSetup.colors.table.hexCode")}</th>
                  <th className="table-head-cell">{t("productSetup.colors.table.status")}</th>
                  <th className="table-head-cell">
                  {t("common.updateStatus")}
                  </th>
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
                    <td className="table-cell table-cell-text text-sm text-gray-500">{color.HexCode}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        color.IsActive
                          ? 'status-active'
                          : 'status-inactive'
                      }`}>
                        {color.IsActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={color.IsActive}
                          onChange={() => handleStatusChange(color.ColorID, color.IsActive)}
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

      {iTotalItems === 0 && !bLoading && !sError && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("productSetup.colors.empty.message")}</div>
          {(sSearchQuery || sStatusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
            >
              {t("productSetup.colors.empty.clear")}
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
