import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchResource,
  updateStatusById,
  clearResourceError,
} from "../../../store/slices/allDataSlice";
import CreateBrand from "./CreateBrand";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import { UPDATE_BRAND_STATUS } from "../../../contants/apiRoutes";
import Switch from "../../../components/Switch";
import { ITEMS_PER_PAGE,DEFAULT_PAGE, STATUS, STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils";

const BrandList = ({ onCreate, onBack, setSubmitting }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [bShowCreate, setShowCreate] = useState(false); // Toggle between list and create view
  const [sSearchQuery, setSearchQuery] = useState(""); // Search term for filtering brands
  const [bShowFilters, setShowFilters] = useState(false); // Show/hide filters dropdown
  const [oFilters, setFilters] = useState({ status: STATUS_VALUES.ALL }); // Active filters (status filter here)

  const [nCurrentPage, setCurrentPage] = useState(DEFAULT_PAGE); // Current pagination page
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE); // Number of items per page (constant)

  // Popup state for brand status confirmation
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    brandId: null,
    newStatus: null,
  });

  // --- Redux Selectors ---
  const brandsState = useSelector((state) => state.allData.resources.brands);
  const aBrands = brandsState?.data || []; // Brand list
  const bLoading = brandsState?.loading || false; // Loading state
  const sError = brandsState?.error || null; // Error message
  const iTotalItems = brandsState?.total || 0; // Total number of brands

  /**
   * Fetch brands whenever filters, search query, or page changes
   */
  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status !== STATUS_VALUES.ALL) {
      params.IsActive = oFilters.status; // Apply status filter if not "all"
    }
    dispatch(fetchResource({ key: "brands", params }));
  }, [dispatch, nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  /**
   * Clear error when component unmounts or when search query changes
   */
  useEffect(() => {
    return () => {
      if (sError) {
        dispatch(clearResourceError("brands"));
      }
    };
  }, [sError, dispatch]);

  // --- Pagination Handlers ---
  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage((prev) => prev + DEFAULT_PAGE);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > DEFAULT_PAGE) {
      setCurrentPage((prev) => prev - DEFAULT_PAGE);
    }
  };

  // --- Status Update Handlers ---
  const handleStatusChange = (brandId, currentIsActive) => {
    // Open confirmation popup before updating status
    setStatusPopup({ open: true, brandId, newStatus: !currentIsActive });
  };

  const handleStatusConfirm = async () => {
    if (setSubmitting) setSubmitting(true);
    const { brandId, newStatus } = statusPopup;

    try {
      // Dispatch async status update request
      const result = await dispatch(
        updateStatusById({
          key: "brands",
          id: brandId,
          newStatus,
          apiRoute: UPDATE_BRAND_STATUS,
          idField: "BrandID",
        })
      ).unwrap();

      showEmsg(result.message, STATUS.SUCCESS);

      // Refetch updated list after successful status change
      const params = {
        pageNumber: nCurrentPage,
        pageSize: iItemsPerPage,
        searchText: sSearchQuery,
      };
      if (oFilters.status !== STATUS_VALUES.ALL) {
        params.IsActive = oFilters.status;
      }
      dispatch(fetchResource({ key: "brands", params }));
    } catch (err) {
      console.error(err);
      showEmsg(err?.message || t("COMMON.API_ERROR"),STATUS.ERROR);
    } finally {
      // Reset popup state and stop loader
      setStatusPopup({ open: false, brandId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, brandId: null, newStatus: null });
  };

  // --- Filters Handler ---
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
    setCurrentPage(DEFAULT_PAGE); // Reset to first page when filters change
  };

  // Map STATUS_OPTIONS to the format expected by Toolbar component
  const statusFilterOptions = STATUS_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey)
  }));

  if (bShowCreate) {
    // If "Create Brand" is triggered, show create form instead of list
    return <CreateBrand onBack={() => setShowCreate(false)} />;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("PRODUCT_SETUP.BRANDS.HEADING")}
        </h2>
      </div>

      {/* Toolbar with Search & Filters */}
      <div className="mb-6">
        <Toolbar
          searchTerm={sSearchQuery}
          setSearchTerm={setSearchQuery}
          showFilterDropdown={bShowFilters}
          setShowFilterDropdown={setShowFilters}
          searchPlaceholder={t("PRODUCT_SETUP.BRANDS.SEARCH_PLACEHOLDER")}
          showSearch={true}
          showViewToggle={false}
          onCreate={onCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
          showFilterButton={true}
          additionalFilters={
            bShowFilters
              ? [
                  {
                    label: t("COMMON.STATUS"),
                    name: "status",
                    value: oFilters.status,
                    options: statusFilterOptions,
                  },
                ]
              : []
          }
          handleFilterChange={bShowFilters ? handleFilterChange : undefined}
        />
      </div>

      {/* Loading, Error, or Table */}
      {bLoading ? (
        <div className="text-center py-8 text-gray-500">
          {t("COMMON.LOADING")}
        </div>
      ) : sError ? (
        <FullscreenErrorPopup
          message={sError}
          onClose={() => dispatch(clearResourceError("brands"))}
          showConfirmButton={false}
        />
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.BRANDS.TABLE.NAME")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">
                    {t("PRODUCT_SETUP.BRANDS.TABLE.CREATED_AT")}
                  </th>
                  <th className="table-head-cell">
                    {t("COMMON.UPDATE_STATUS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aBrands.map((brand) => (
                  <tr 
                    key={brand.BrandID} 
                    className={`table-row items-center ${!brand.IsActive ? 'bg-gray-50' : ''}`}
                  >
                    {/* Brand Name & Logo */}
                    <td className="table-cell table-cell-text align-middle">
                      <div className="flex items-center gap-2">
                        {/* Brand Logo */}
                        <div className={`h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden ${
                          !brand.IsActive ? 'bg-gray-100 border-gray-200' : 'bg-white'
                        }`}>
                          {Array.isArray(brand.BrandLogo) &&
                          brand.BrandLogo.length > 0 ? (
                            <img
                              src={brand.BrandLogo[0].documentUrl} // Display first logo
                              alt={brand.BrandName}
                              className={`w-full h-full object-cover ${
                                !brand.IsActive ? 'opacity-60' : ''
                              }`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/no-image.png"; // Fallback image
                              }}
                            />
                          ) : (
                            <span className={`text-xs ${
                              !brand.IsActive ? 'text-gray-400' : 'text-gray-400'
                            }`}>
                              {t("COMMON.NO_IMAGE")}
                            </span>
                          )}
                        </div>

                        {/* Brand Name with Edit Link - Disabled for inactive brands */}
                        {brand.IsActive ? (
                          <Link
                            to={`/browse/editbrand/${brand.BrandID}`}
                            className="text-blue-600 hover:underline block truncate max-w-[200px]"
                          >
                            {brand.BrandName}
                          </Link>
                        ) : (
                          <span 
                            className="text-gray-500 block truncate max-w-[200px] cursor-not-allowed"
                            title={t("PRODUCT_SETUP.BRANDS.EDIT_DISABLED_TOOLTIP")}
                          >
                            {brand.BrandName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand.IsActive ? "status-active" : "status-inactive"
                        }`}
                      >
                        {brand.IsActive
                          ? t("COMMON.ACTIVE")
                          : t("COMMON.INACTIVE")}
                      </span>
                    </td>

                    {/* Created At Timestamp */}
                    <td className={`table-cell table-cell-text ${
                      !brand.IsActive ? 'text-gray-400' : ''
                    }`}>
                      {new Date(brand.CreatedAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    {/* Toggle Switch for Status */}
                    <td className="table-cell table-cell-text">
                      <Switch
                        checked={brand.IsActive}
                        onChange={() =>
                          handleStatusChange(brand.BrandID, brand.IsActive)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {bLoading === false && aBrands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {sSearchQuery && (
            <div>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-[#5B45E0] hover:text-[#4c39c7]"
              >
                {t("COMMON.CLEAR_SEARCH")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
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

      {/* Confirmation Popup for Status Change */}
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={
            statusPopup.newStatus
              ? t("PRODUCT_SETUP.BRANDS.CONFIRM_ACTIVATE")
              : t("PRODUCT_SETUP.BRANDS.CONFIRM_DEACTIVATE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default BrandList;
