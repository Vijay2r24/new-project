import { useState, useEffect } from 'react';
import Toolbar from '../../../components/Toolbar'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCategories } from '../../../context/AllDataContext';
import Pagination from '../../../components/Pagination';
import { showEmsg } from '../../../utils/ShowEmsg';
import { STATUS } from '../../../contants/constants';

const CategoryList = () => {
  const { t } = useTranslation();
  const [sSearchQuery, setSearchQuery] = useState('');
  const [sStatusFilter, setStatusFilter] = useState('');
  const [bShowFilters, setShowFilters] = useState(false);

  const categories = useCategories();
  const aCategories = categories.data || [];
  const bLoading = categories.loading;
  const sError = categories.error;
  const iTotalItems = categories.total;
  const toggleCategoryStatus = categories.toggleStatus;

  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10);
  useEffect(() => {
    categories.fetch({ pageNumber: nCurrentPage, pageSize: iItemsPerPage, searchText: sSearchQuery });
  }, [nCurrentPage, iItemsPerPage, sSearchQuery]);

  const handleStatusToggle = async (categoryId, currentIsActive) => {
    try {
      const oResponse = await toggleCategoryStatus(categoryId, !currentIsActive);
      const resData = oResponse;

      if (resData?.status === STATUS.ERROR) {
        showEmsg(resData?.message, STATUS.ERROR);
      } else {
        showEmsg(resData?.message || t('PRODUCT_SETUP.CATEGORIES.STATUS_UPDATE_SUCCESS'), STATUS.SUCCESS);
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      showEmsg(backendMessage , STATUS.ERROR);
    }
  };


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

  const filteredCategoriesByStatus = aCategories.filter(category => {
    if (!sStatusFilter) return true;
    return sStatusFilter === 'Active' ? category.IsActive : !category.IsActive;
  });


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("PRODUCT_SETUP.CATEGORIES.TITLE")}</h2>
      </div>
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          filterStatus={bShowFilters}
          setFilterStatus={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.CATEGORIES.SEARCH_PLACEHOLDER")}
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

      {/* Category Table */}
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
                  <th className="table-head-cell"> {t("PRODUCT_SETUP.CATEGORIES.TABLE.NAME")}</th>
                  <th className="table-head-cell">{t("PRODUCT_SETUP.CATEGORIES.TABLE.IMAGE")}</th>
                  <th className="table-head-cell">{t("COMMON.DESCRIPTION")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">{t("COMMON.UPDATE_STATUS")}</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredCategoriesByStatus.map((category) => (
                  <tr
                    key={category.CategoryID}
                    className="table-row"
                  >
                    <td className="table-cell table-cell-text">
                      <Link to={`/browse/editcatagiry/${category.CategoryID}`} className="text-blue-600 hover:underline">
                        {category.CategoryName}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden">
                        {category.CategoryImage ? (
                          <img
                            src={category.CategoryImage}
                            alt={category.CategoryName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell table-cell-wrap max-w-[120px] overflow-hidden">
                      <div className="table-cell-text truncate">{category.CategoryDescription}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.IsActive
                        ? 'status-active'
                        : 'status-inactive'
                        }`}>
                        {category.IsActive ? t('COMMON.ACTIVE') : t('COMMON.INACTIVE')}
                      </span>
                    </td>
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={category.IsActive}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusToggle(category.CategoryID, category.IsActive);
                          }}
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
      {!bLoading && !sError && aCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">{t("PRODUCT_SETUP.CATEGORIES.EMPTY.MESSAGE")}</div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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

export default CategoryList;
