import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import { UPDATE_STORE_STATUS, DELETE_STORE } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { ToastContainer } from "react-toastify";
import { ITEMS_PER_PAGE, STATUS } from "../contants/constants";
import { apiDelete } from "../utils/ApiUtils";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { getPermissionCode, hasPermissionId } from "../utils/permissionUtils";
import { fetchResource, updateStatusById } from "../store/slices/allDataSlice";

const Stores = () => {
  const { t } = useTranslation();
  const { setBackButton, setTitle } = useTitle();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const storesData = useSelector(
    (state) => state.allData.resources.stores || { data: [], total: 0, loading: false }
  );

  const aStores = storesData.data || [];
  const totalItems = storesData.pagination?.totalRecords || 0;
  const storesLoading = storesData.loading;

  const [sSearchTerm, setSearchTerm] = useState("");
  const [bShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const defaultFilters = {
    status: "",
  };
  const [oFilters, setFilters] = useState(defaultFilters);
  const [bSubmitting, setSubmitting] = useState(false);
  const [bFilterLoading, setFilterLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const permissionIdForDelete = getPermissionCode("Store Management", "Delete User");
  const hasDeletePermission = hasPermissionId(permissionIdForDelete);
  const statusOptions = [
    { value: "", label: t("COMMON.ALL") },
    { value: true, label: t("COMMON.ACTIVE") },
    { value: false, label: t("COMMON.INACTIVE") },
  ];

  const aAdditionalFilters = [
    {
      label: t("COMMON.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    storeId: null,
    newStatus: null,
  });

  const [deletePopup, setDeletePopup] = useState({
    open: false,
    storeId: null,
  });

  const itemsPerPage = ITEMS_PER_PAGE;
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (StoreID) => {
    navigate(`/editStore/${StoreID}`);
  };

  const handleDelete = (storeId) => {
    if (!hasDeletePermission) {
      showEmsg(t("COMMON.NO_DELETE_PERMISSION"), STATUS.ERROR);
      return;
    }
    setDeletePopup({ open: true, storeId });
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (e, filterName) => {
    if (initialLoadComplete) {
      setFilterLoading(true);
    }
    const { name, value } = e.target;
    
    // Convert string "true"/"false" to actual boolean if needed
    let processedValue = value;
    if ((filterName || name) === "status" && value !== "") {
      processedValue = value === "true";
    }
    
    setFilters((prev) => ({
      ...prev,
      [filterName || name]: processedValue,
    }));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (storeId, isActive) => {
    setStatusPopup({ open: true, storeId, newStatus: !isActive });
  };

  const handleStatusConfirm = async () => {
    setSubmitting(true);
    const { storeId, newStatus } = statusPopup;
    
    try {
      const result = await dispatch(
        updateStatusById({
          key: "stores",
          id: storeId,
          newStatus,
          apiRoute: UPDATE_STORE_STATUS,
          idField: "StoreID"
        })
      ).unwrap();
      
      showEmsg(result.message, STATUS.SUCCESS);
      setStatusPopup({ open: false, storeId: null, newStatus: null });
      
      // Convert empty string to undefined, otherwise use the boolean value
      const isActiveFilter = oFilters.status === "" ? undefined : oFilters.status;
      
      // Refresh the stores list after status update
      dispatch(fetchResource({
        key: "stores",
        params: {
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          searchText: sSearchTerm,
          IsActive: isActiveFilter,
        }
      }));
      
    } catch (err) {
      showEmsg(err.error || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, storeId: null, newStatus: null });
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    const { storeId } = deletePopup;
    try {
      const token = localStorage.getItem("token");
      const oResponse = await apiDelete(`${DELETE_STORE}/${storeId}`, token);
      const backendMessage = oResponse.data.MESSAGE;
      showEmsg(backendMessage, STATUS.SUCCESS);
      
      // Convert empty string to undefined, otherwise use the boolean value
      const isActiveFilter = oFilters.status === "" ? undefined : oFilters.status;
      
      // Refresh the stores list after deletion
      dispatch(fetchResource({
        key: "stores",
        params: {
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          searchText: sSearchTerm,
          IsActive: isActiveFilter,
        }
      }));
      
      setDeletePopup({ open: false, storeId: null });
    } catch (err) {
      const errorMessage = err?.response?.data?.MESSAGE;
      showEmsg(errorMessage || t("COMMON.API_ERROR"), STATUS.ERROR);
      setDeletePopup({ open: false, storeId: null });
    }
    hideLoaderWithDelay(setSubmitting);
  };

  const handleDeletePopupClose = () => {
    setDeletePopup({ open: false, storeId: null });
  };

  useEffect(() => {
    const fetchStoresData = async () => {
      try {
        // Convert empty string to undefined, otherwise use the boolean value
        const isActiveFilter = oFilters.status === "" ? undefined : oFilters.status;
        
        await dispatch(fetchResource({
          key: "stores",
          params: {
            pageNumber: currentPage,
            pageSize: itemsPerPage,
            searchText: sSearchTerm,
            IsActive: isActiveFilter,
          }
        })).unwrap();
      } catch (err) {
        showEmsg(err.error || t("COMMON.API_ERROR"), STATUS.ERROR);
      } finally {
        setFilterLoading(false);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    };

    fetchStoresData();
    setTotalPages(Math.ceil((totalItems || 0) / itemsPerPage));
    setTitle(t("STORES.HEADING"));
    
    return () => {
      setBackButton(null);
      setTitle("");
    };
  }, [
    currentPage,
    itemsPerPage,
    sSearchTerm,
    oFilters.status,
    totalItems,
    setBackButton,
    setTitle,
    t,
    dispatch
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  // Helper function to get status text
  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilterDropdown={bShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("STORES.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/add-store")}
        createLabel={t("STORES.ADD_STORE")}
      />

      {viewMode === "table" ? (
        <div className="table-container overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    {t("STORES.STORE_DETAILS")}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t("STORES.CONTACT")}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t("COMMON.STATUS")}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t("COMMON.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {bFilterLoading || storesLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : aStores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      {t("STORES.NO_STORES_FOUND")}
                    </td>
                  </tr>
                ) : (
                  aStores.map((store) => (
                    <tr key={store.StoreID} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-custom-bg" />
                          </div>
                          <div className="ml-4">
                            <div className="table-cell-text ellipsis-text">
                              {store.StoreName}
                            </div>
                            <div className="table-cell-subtext flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="ellipsis-text">
                                {store.AddressLine1}
                                {store.AddressLine2 && `, ${store.AddressLine2}`}
                                {store.City?.CityName && `, ${store.City.CityName}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="table-cell-text flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {store.PhoneNumber}
                        </div>
                        <div className="table-cell-subtext flex items-center ">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="ellipsis-text">{store.Email}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Switch
                          checked={store.IsActive}
                          onChange={() =>
                            handleStatusChange(store.StoreID, store.IsActive)
                          }
                        />
                      </td>
                      <td className="table-cell text-left font-medium align-middle">
                        <div className="flex justify-center items-center">
                          <ActionButtons
                            id={store.StoreID}
                            onEdit={handleEdit}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bFilterLoading || storesLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : aStores.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t("STORES.NO_STORES_FOUND")}
            </div>
          ) : (
            aStores.map((store) => (
              <div
                key={store.StoreID}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                  <div className="flex-shrink-0 h-12 w-12 bg-custom-bg/10 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-custom-bg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-gray-900 ellipsis-text">
                      {store.StoreName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="ellipsis-text">
                        {store.AddressLine1}
                        {store.AddressLine2 && `, ${store.AddressLine2}`}
                        {store.City?.CityName && `, ${store.City.CityName}`}
                        {store.Zipcode && `, ${store.Zipcode}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-caption">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="ellipsis-text">{store.PhoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="ellipsis-text">{store.Email}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`status-badge ${
                      store.IsActive
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {getStatusText(store.IsActive)}
                  </span>
                  <Switch
                    checked={store.IsActive}
                    onChange={() =>
                      handleStatusChange(store.StoreID, store.IsActive)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {statusPopup.open && (
        <FullscreenErrorPopup
          open={statusPopup.open}
          message={
            statusPopup.newStatus
              ? t("STORES.STATUS_CONFIRM_ACTIVE")
              : t("STORES.STATUS_CONFIRM_INACTIVE")
          }
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}

      {deletePopup.open && (
        <FullscreenErrorPopup
          open={deletePopup.open}
          message={t("STORES.DELETE_CONFIRM_MESSAGE")}
          onClose={handleDeletePopupClose}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default Stores;