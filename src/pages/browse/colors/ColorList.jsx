import { useState, useEffect } from 'react';
import Toolbar from '../../../components/Toolbar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useColors } from '../../../context/AllDataContext';
import Pagination from '../../../components/Pagination';
import { showEmsg } from '../../../utils/ShowEmsg';
import Switch from '../../../components/Switch';
import FullscreenErrorPopup from '../../../components/FullscreenErrorPopup';
import { UPDATE_COLOUR_STATUS } from '../../../contants/apiRoutes';
import { ITEMS_PER_PAGE } from '../../../contants/constants';
import { hideLoaderWithDelay } from '../../../utils/loaderUtils';
const ColorList = ({ onCreate, onBack, setSubmitting }) => {
  const [sSearchQuery, setSearchQuery] = useState('');
  const [oFilters, setFilters] = useState({ status: "all" });
  const [bShowFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const { data: aColors, loading: bLoading, error: sError, total: iTotalItems, fetch: fetchColors, toggleStatus: toggleColorStatus, updateStatusById } = useColors();

  const [nCurrentPage, setCurrentPage] = useState(1);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE); 

  const [statusPopup, setStatusPopup] = useState({ open: false, colorId: null, newStatus: null });

  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status && oFilters.status !== "all") {
      params.status = oFilters.status;
    }
    fetchColors(params);
  }, [nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  const handleStatusChange = (colorId, currentIsActive) => {
    setStatusPopup({ open: true, colorId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
      if (setSubmitting) setSubmitting(true);
    const { colorId, newStatus } = statusPopup;
    const result = await updateStatusById(colorId, newStatus, UPDATE_COLOUR_STATUS, 'ColourID');
    showEmsg(result.message, result.status);
    setStatusPopup({ open: false, colorId: null, newStatus: null });
    hideLoaderWithDelay(setSubmitting);
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, colorId: null, newStatus: null });
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t("PRODUCT_SETUP.COLORS.TITLE")}</h2>
      </div>

      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.COLORS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          showFilterButton={true}
          onCreate={onCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
          additionalFilters={bShowFilters ? [
            {
              label: t("COMMON.STATUS"),
              name: "status",
              value: oFilters.status,
              options: [
                { value: "all", label: t("COMMON.ALL") },
                { value: "Active", label: t("COMMON.ACTIVE") },
                { value: "Inactive", label: t("COMMON.INACTIVE") },
              ],
            },
          ] : []}
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
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
                {aColors.map((color) => (
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
                        color.Status === t("COMMON.ACTIVE")
                          ? 'status-active'
                          : 'status-inactive'
                      }`}>
                        {color.Status}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      <Switch checked={color.Status === t("COMMON.ACTIVE")} onChange={() => handleStatusChange(color.ColourID, color.Status === t("COMMON.ACTIVE"))} />
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
          {sSearchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({ status: "all" });
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

      {statusPopup.open && (
        <FullscreenErrorPopup
          message={statusPopup.newStatus ? t("PRODUCT_SETUP.COLORS.CONFIRM_ACTIVATE") : t("PRODUCT_SETUP.COLORS.CONFIRM_DEACTIVATE")}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default ColorList;