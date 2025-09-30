import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { USER_ACTIVE_STATUS, DELETE_USER } from "../contants/apiRoutes";
import { useTitle } from "../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../contants/constants";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import Switch from "../components/Switch";
import userProfile from "../../assets/images/userProfile.svg";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { getPermissionCode, hasPermissionId } from "../utils/permissionUtils";

import { useDispatch, useSelector } from "react-redux";
import { fetchResource, updateStatusById } from "../store/slices/allDataSlice";

const Users = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [bSubmitting, setSubmitting] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const itemsPerPage = ITEMS_PER_PAGE;

  const dispatch = useDispatch();

  const usersState = useSelector(
    (state) => state.allData.resources.users || {}
  );
  
  // Extract data with proper pagination handling
  const { 
    data: usersData = [], 
    total = 0, 
    loading, 
    error,
    pagination = {} 
  } = usersState;

  // Use API pagination data when available, otherwise calculate locally
  const actualTotal = pagination.totalRecords || total;
  const nTotalPages = pagination.totalPages || Math.ceil((actualTotal || 0) / itemsPerPage);
  const currentPageSize = pagination.pageSize || itemsPerPage;

  const rolesState = useSelector(
    (state) => state.allData.resources.roles || {}
  );
  const { data: aRoles = [] } = rolesState;

  const storesState = useSelector(
    (state) => state.allData.resources.stores || {}
  );
  const { data: aStores = [] } = storesState;

  const defaultFilters = { 
    role: "all", 
    status: "all",
    store: "all",
    sortOrder: "DESC"
  };
  const [oFilters, setFilters] = useState(defaultFilters);

  const permissionIdForDelete = getPermissionCode(
    "User Management",
    "Delete User"
  );
  const hasDeletePermission = hasPermissionId(permissionIdForDelete);

  // Helper function to get profile image URL
  const getProfileImageUrl = (user) => {
    if (!user.ProfileImageUrl) return userProfile;
    
    // Handle both string and array formats
    if (typeof user.ProfileImageUrl === 'string') {
      return user.ProfileImageUrl;
    }
    
    if (Array.isArray(user.ProfileImageUrl) && user.ProfileImageUrl.length > 0) {
      // Get the first image with the highest sortOrder or the first one
      const sortedImages = [...user.ProfileImageUrl].sort((a, b) => 
        (b.sortOrder || 0) - (a.sortOrder || 0)
      );
      return sortedImages[0].documentUrl || userProfile;
    }
    
    return userProfile;
  };

  // Helper function to get stores as comma-separated string
  const getStoresString = (user) => {
    if (!user.Stores || !Array.isArray(user.Stores)) return "";
    return user.Stores.map(store => store.StoreName).join(", ");
  };

  // Use useCallback for buildApiParams to prevent unnecessary recreations
  const buildApiParams = useCallback(() => {
    const params = {
      pageNumber: nCurrentPage,
      pageSize: itemsPerPage,
      ...(sSearchTerm ? { searchText: sSearchTerm } : {}),
      ...(oFilters.role !== "all" ? { roleName: oFilters.role } : {}),
      ...(oFilters.store !== "all" ? { storeName: oFilters.store } : {}),
      ...(oFilters.status !== "all" 
        ? { IsActive: oFilters.status === "Active" } 
        : {}),
      sortOrder: oFilters.sortOrder,
    };
    
    return params;
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters]);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
    setCurrentPage(1);
  };

  const roleOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...(Array.isArray(aRoles)
      ? aRoles.map((role) => ({
          value: role.RoleName,
          label: role.RoleName,
        }))
      : []),
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "Active", label: t("COMMON.ACTIVE") },
    { value: "Inactive", label: t("COMMON.INACTIVE") },
  ];

  const storeOptions = [
    { value: "all", label: t("COMMON.ALL") },
    ...(Array.isArray(aStores)
      ? aStores.map((store) => ({
          value: store.StoreName,
          label: store.StoreName,
        }))
      : []),
  ];

  const handleDropdownInputChange = (inputValue, filterName) => {
    if (filterName === "role") {
      dispatch(
        fetchResource({ key: "roles", params: { searchText: inputValue } })
      );
    }
    if (filterName === "store") {
      dispatch(
        fetchResource({ key: "stores", params: { searchText: inputValue } })
      );
    }
  };

  const additionalFilters = [
    {
      label: t("USERS.FILTERS.USER_ROLE"),
      name: "role",
      value: oFilters.role,
      options: roleOptions,
      placeholder: t("USERS.FILTERS.USER_ROLE"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_ROLE") || "Search role",
      onInputChange: (inputValue) =>
        handleDropdownInputChange(inputValue, "role"),
    },
    {
      label: t("USERS.FILTERS.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
    {
      label: t("COMMON.STORE"),
      name: "store",
      value: oFilters.store,
      options: storeOptions,
      placeholder: t("USERS.FILTERS.STORE"),
      searchable: true,
      searchPlaceholder: t("COMMON.SEARCH_STORE") || "Search store",
      onInputChange: (inputValue) =>
        handleDropdownInputChange(inputValue, "store"),
    },
  ];

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const handleEdit = (userId) => navigate(`/editUser/${userId}`);

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    userId: null,
    newStatus: null,
  });

  const handleStatusChange = (userId, newStatus) => {
    setStatusPopup({ open: true, userId, newStatus });
  };

  const handleStatusConfirm = async () => {
    setSubmitting(true);
    const { userId, newStatus } = statusPopup;
    try {
      const result = await dispatch(
        updateStatusById({
          key: "users",
          id: userId,
          newStatus,
          apiRoute: USER_ACTIVE_STATUS,
          idField: "UserID",
        })
      ).unwrap();

      showEmsg(result.message, STATUS.SUCCESS);

      // Re-fetch users to update table data
      const params = buildApiParams();
      dispatch(
        fetchResource({
          key: "users",
          params: params,
        })
      );
    } catch (err) {
      showEmsg(err.message || "Failed to update status", STATUS.ERROR);
    } finally {
      setStatusPopup({ open: false, userId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleStatusPopupClose = () =>
    setStatusPopup({ open: false, userId: null, newStatus: null });

  // Debounced API call on filter changes
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      const params = buildApiParams();
      dispatch(
        fetchResource({
          key: "users",
          params: params,
        })
      );
    }, 300); // 300ms debounce delay
    
    setDebounceTimer(timer);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters, dispatch, buildApiParams]);

  useEffect(() => {
    setTitle(t("USERS.TITLE"));
  }, [setTitle, t]);

  // Initial fetch for roles and stores
  useEffect(() => {
    dispatch(fetchResource({ key: "roles" }));
    dispatch(fetchResource({ key: "stores" }));
  }, [dispatch]);

  // Fetch roles and stores when filter dropdown is shown
  useEffect(() => {
    if (sShowFilterDropdown) {
      dispatch(fetchResource({ key: "roles" }));
      dispatch(fetchResource({ key: "stores" }));
    }
  }, [sShowFilterDropdown, dispatch]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {bSubmitting && (
        <div className="global-loader-overlay">
          <Loader />
        </div>
      )}
      <ToastContainer />
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={sShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("USERS.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/add-user")}
        createLabel={t("USERS.ADD_USER")}
      />

      {/* table view */}
      {sViewMode === "table" ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t("COMMON.USER")}</th>
                  <th className="table-head-cell hidden sm:table-cell">
                    {t("USERS.TABLE.CONTACT")}
                  </th>
                  <th className="table-head-cell">{t("COMMON.ROLE")}</th>
                  <th className="table-head-cell">{t("COMMON.STATUS")}</th>
                  <th className="table-head-cell hidden sm:table-cell">
                    {t("COMMON.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="flex justify-center items-center h-32">
                        <Loader className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {t("USERS.FETCH_ERROR")}
                    </td>
                  </tr>
                ) : usersData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      {t("USERS.NO_USERS_FOUND")}
                    </td>
                  </tr>
                ) : (
                  usersData.map((user) => (
                    <tr key={user.UserID} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getProfileImageUrl(user)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = userProfile;
                              }}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="table-cell-text">
                              <span className="ellipsis-text">
                                {user.FirstName} {user.LastName}
                              </span>
                            </div>
                            <div className="table-cell-subtext sm:hidden">
                              {user.Email}
                            </div>
                            <div className="table-cell-subtext lg:hidden">
                              {getStoresString(user)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="table-cell-subtext flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="ellipsis-text">{user.Email}</span>
                          </div>
                          <div className="table-cell-subtext flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.PhoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="status-badge bg-blue-100 text-blue-800">
                            <span className="ellipsis-text">
                              {user.RoleName}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Switch
                          checked={user.IsActive}
                          onChange={(e) =>
                            handleStatusChange(user.UserID, e.target.checked)
                          }
                        />
                      </td>
                      <td className="table-cell text-left font-medium align-middle">
                        <div className="flex justify-left items-left">
                          <ActionButtons
                            id={user.UserID}
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
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex justify-center items-center h-32">
                <Loader className="h-8 w-8" />
              </div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-4 text-red-500">
              {t("USERS.FETCH_ERROR")}
            </div>
          ) : usersData.length === 0 ? (
            <div className="col-span-full text-center py-4">
              {t("USERS.NO_USERS_FOUND")}
            </div>
          ) : (
            usersData.map((user) => (
              <div
                key={user.UserID}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                  <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={getProfileImageUrl(user)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = userProfile;
                      }}
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-title font-bold text-gray-900">
                      {user.FirstName} {user.LastName}
                    </div>
                    <div className="text-secondary flex items-center mt-1">
                      <Shield className="h-4 w-4 mr-1" />
                      {user.RoleName}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">{t("COMMON.STORE")}:</div>
                  <div className="truncate">{getStoresString(user)}</div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.IsActive
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {user.IsActive ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span
                      className="truncate max-w-[120px] block"
                      title={user.Email}
                    >
                      {user.Email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:ml-4">
                    <Phone className="h-4 w-4" />
                    <span>{user.PhoneNumber}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                  <ActionButtons
                    id={user.UserID}
                    onEdit={handleEdit}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination
        currentPage={nCurrentPage}
        totalPages={nTotalPages}
        totalItems={actualTotal}
        itemsPerPage={currentPageSize}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />

      {statusPopup.open && (
        <FullscreenErrorPopup
          message={`Are you sure you want to set this user as ${
            statusPopup.newStatus ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")
          }?`}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default Users;