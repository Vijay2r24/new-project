import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource, updateStatusById, clearResourceError } from "../../../store/slices/allDataSlice";
import Toolbar from "../../../components/Toolbar";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import { showEmsg } from "../../../utils/ShowEmsg";
import FullscreenErrorPopup from "../../../components/FullscreenErrorPopup";
import { UPDATE_CATEGORY_STATUS } from "../../../contants/apiRoutes";
import Switch from "../../../components/Switch";
import { ITEMS_PER_PAGE, DEFAULT_PAGE, STATUS,STATUS_VALUES, STATUS_OPTIONS } from "../../../contants/constants";
import { hideLoaderWithDelay } from "../../../utils/loaderUtils"; 

const CategoryList = ({ onCreate, onBack, setSubmitting }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [sSearchQuery, setSearchQuery] = useState("");
  const [bShowFilters, setShowFilters] = useState(false);
  const [oFilters, setFilters] = useState({ status: STATUS_VALUES.ALL  });

  // Redux selectors
  const categoriesState = useSelector((state) => state.allData.resources.categories);
  const aCategories = categoriesState?.data || [];
  const bLoading = categoriesState?.loading || false;
  const sError = categoriesState?.error || null;
  const iTotalItems = categoriesState?.total || 0;

  const [nCurrentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [iItemsPerPage] = useState(ITEMS_PER_PAGE);

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    categoryId: null,
    newStatus: null,
  });

  useEffect(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: iItemsPerPage,
      searchText: sSearchQuery,
    };
    if (oFilters.status && oFilters.status !== STATUS_VALUES.ALL ) {
      params.IsActive = oFilters.status;
    }
    
    // Dispatch fetchResource thunk
    dispatch(fetchResource({ key: "categories", params }));
  }, [dispatch, nCurrentPage, iItemsPerPage, sSearchQuery, oFilters.status]);

  // Clear error when component unmounts or search changes
  useEffect(() => {
    return () => {
      if (sError) {
        dispatch(clearResourceError("categories"));
      }
    };
  }, [sError, dispatch]);

  const handleStatusChange = (categoryId, currentStatus) => {
    // Convert current status to boolean for the new status
    const isCurrentlyActive = currentStatus === "Active";
    setStatusPopup({ 
      open: true, 
      categoryId, 
      newStatus: !isCurrentlyActive 
    });
  };

  const handleStatusConfirm = async () => {
    if (setSubmitting) setSubmitting(true);
    const { categoryId, newStatus } = statusPopup;

    try {
      // Dispatch updateStatusById thunk
      const result = await dispatch(updateStatusById({
        key: "categories",
        id: categoryId,
        newStatus: newStatus,
        apiRoute: UPDATE_CATEGORY_STATUS,
        idField: "CategoryID"
      })).unwrap();
      
      showEmsg(result.message, STATUS.SUCCESS);
      
      // Refetch data after status update
      const params = {
        pageNumber: nCurrentPage,
        pageSize: iItemsPerPage,
        searchText: sSearchQuery,
      };
      if (oFilters.status && oFilters.status !== STATUS_VALUES.ALL ) {
        params.IsActive = oFilters.status;
      }
      dispatch(fetchResource({ key: "categories", params }));
      
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.MESSAGE || t("COMMON.API_ERROR");
      showEmsg(errorMessage, STATUS.ERROR);
    } finally {
      setStatusPopup({ open: false, categoryId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, categoryId: null, newStatus: null });
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (nCurrentPage < Math.ceil(iTotalItems / iItemsPerPage)) {
      setCurrentPage((prev) => prev + DEFAULT_PAGE);
    }
  };

  const handlePrevPage = () => {
    if (nCurrentPage > DEFAULT_PAGE) {
      setCurrentPage((prev) => prev -DEFAULT_PAGE);
    }
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
    // Reset to first page when filters change
    setCurrentPage(DEFAULT_PAGE);
  };

  // Get status text for display
  const getStatusText = (category) => {
    // Check both possible status fields
    if (category.Status) return category.Status;
    if (category.IsActive !== undefined) return category.IsActive ? "Active" : "Inactive";
    return "Inactive"; // Default
  };

  // Check if category is active
  const isCategoryActive = (category) => {
    if (category.Status) return category.Status === "Active";
    if (category.IsActive !== undefined) return category.IsActive;
    return false; // Default
  };

  const statusFilterOptions = STATUS_OPTIONS.map(option => ({
  value: option.value,
  label: t(option.labelKey)
}));

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
          onCreate={onCreate}
          createLabel={t("PRODUCT_SETUP.CREATE")}
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
                    {t("PRODUCT_SETUP.CATEGORIES.TABLE.NAME")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.DESCRIPTION")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell">{t("COMMON.CREATED_AT")}</th>
                  <th className="table-head-cell">
                    {t("COMMON.UPDATE_STATUS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {aCategories.map((category) => (
                  <tr key={category.CategoryID} className="table-row">
                    <td className="table-cell table-cell-text align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden bg-white">
                            {category.CategoryImages && category.CategoryImages.length > 0 ? (
                            <img
                              src={category.CategoryImages[0].documentUrl}
                              alt={category.CategoryName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No Image
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/browse/editcatagiry/${category.CategoryID}`}
                          className="text-blue-600 hover:underline block truncate max-w-[180px]"
                          title={category.CategoryName}
                        >
                          {category.CategoryName}
                        </Link>
                      </div>
                    </td>
                    <td className="table-cell text-left align-middle max-w-[200px] overflow-hidden">
                      <div
                        className="truncate table-cell-subtext"
                        title={category.CategoryDescription}
                      >
                        {category.CategoryDescription}
                      </div>
                    </td>

                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isCategoryActive(category)
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {t(
                          `COMMON.${
                            isCategoryActive(category) ? "ACTIVE" : "INACTIVE"
                          }`
                        )}
                      </span>
                    </td>
                    <td className="table-cell table-cell-text">
                      {new Date(category.CreatedAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td
                      className="table-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={isCategoryActive(category)}
                        onChange={() =>
                          handleStatusChange(
                            category.CategoryID,
                            getStatusText(category)
                          )
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
          message={
            statusPopup.newStatus
              ? t("PRODUCT_SETUP.CATEGORIES.CONFIRM_ACTIVATE")
              : t("PRODUCT_SETUP.CATEGORIES.CONFIRM_DEACTIVATE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default CategoryList;