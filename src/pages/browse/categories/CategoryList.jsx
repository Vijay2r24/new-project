import { useState, useEffect } from "react";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCategories } from "../../../context/AllDataContext";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import { UPDATE_CATEGORY_STATUS } from "../../../contants/apiRoutes";
import Switch from '../../../components/Switch';

const CategoryList = () => {
  const { t } = useTranslation();
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilters, setShowFilters] = useState(false);
  const [oFilters, setFilters] = useState({ status: "all" });

  const categories = useCategories();
  const aCategories = categories.data || [];
  const bLoading = categories.loading;
  const sError = categories.error;
  const iTotalItems = categories.total;


  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(10);

 
  const [statusPopup, setStatusPopup] = useState({ open: false, categoryId: null, newStatus: null });

  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status && oFilters.status !== "all") {
      params.status = oFilters.status;
    }
    categories.fetch(params);
  }, [nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  const handleStatusChange = (categoryId, currentIsActive) => {
    setStatusPopup({ open: true, categoryId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    const { categoryId, newStatus } = statusPopup;
    const result = await categories.updateStatusById(categoryId, newStatus, UPDATE_CATEGORY_STATUS, 'CategoryID');
    showEmsg(result.message, result.status);
    setStatusPopup({ open: false, categoryId: null, newStatus: null });
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, categoryId: null, newStatus: null });
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.CATEGORIES.TITLE")}
        </h2>
      </div>
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.CATEGORIES.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          additionalFilters={bShowFilters ? [
            {
              label: t("COMMON.STATUS"),
              name: "status",
              value: oFilters.status,
              options: [
                { value: 'all', label: t('COMMON.ALL') },
                { value: 'Active', label: t('COMMON.ACTIVE') },
                { value: 'Inactive', label: t('COMMON.INACTIVE') },
              ],
            },
          ] : []}
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      {bLoading ? (
        <div className="text-center py-8 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
      ) : sError ? (
        <div className="text-center py-8 text-red-500">
          {t("COMMON.ERROR")}: {sError}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    {" "}
                    {t("PRODUCT_SETUP.CATEGORIES.TABLE.NAME")}
                  </th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.CATEGORIES.TABLE.IMAGE")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.DESCRIPTION")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">
                    {t("COMMON.UPDATE_STATUS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aCategories.map((category) => (
                  <tr key={category.CategoryID} className="table-row">
                    <td className="table-cell table-cell-text">
                      <Link
                        to={`/browse/editcatagiry/${category.CategoryID}`}
                        className="text-blue-600 hover:underline"
                      >
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
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell table-cell-wrap max-w-[120px] overflow-hidden">
                      <div className="table-cell-text truncate">
                        {category.CategoryDescription}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.Status === 'Active' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {t(`COMMON.${category.Status === 'Active' ? 'ACTIVE' : 'INACTIVE'}`)}
                      </span>
                    </td>

                    <td
                      className="table-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={category.Status === t("COMMON.ACTIVE")}
                        onChange={() => handleStatusChange(category.CategoryID, category.Status === t("COMMON.ACTIVE"))}
                      />
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
          <div className="text-gray-500">
            {t("PRODUCT_SETUP.CATEGORIES.EMPTY.MESSAGE")}
          </div>
          {sSearchQuery && (
            <button
              onClick={() => setSearchQuery("")}
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
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={statusPopup.newStatus ? t("PRODUCT_SETUP.CATEGORIES.CONFIRM_ACTIVATE") : t("PRODUCT_SETUP.CATEGORIES.CONFIRM_DEACTIVATE")}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default CategoryList;
