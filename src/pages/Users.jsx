import { useState, useEffect } from "react";
import { Mail, Phone,Shield, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { apiDelete } from "../utils/ApiUtils";
import {
  USER_ACTIVE_STATUS,
  DELETE_USER,
} from "../contants/apiRoutes";
import { useTitle } from "../context/TitleContext";
import { ITEMS_PER_PAGE, STATUS } from "../contants/constants";
import { useRoles, useUsers } from "../context/AllDataContext";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import Switch from '../components/Switch';
import userProfile from '../../assets/images/userProfile.svg';


const Users = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = ITEMS_PER_PAGE;
  const { data: usersData = [], updateStatusById, fetch, loading: contextLoading, error: contextError, total } = useUsers();
  const nTotalPages = Math.ceil((total || 0) / itemsPerPage);

  const { data: aRoles, fetch: fetchRoles } = useRoles();

  const defaultFilters = {
    role: 'all',
    status: 'all',
  };

  const [oFilters, setFilters] = useState(defaultFilters);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
  const roleOptions = [
    { value: 'all', label: t('COMMON.ALL') },
    ...(Array.isArray(aRoles)
      ? aRoles.map((role) => ({
          value: role.RoleName,
          label: role.RoleName,
        }))
      : []),
  ];

  const statusOptions = [
    { value: 'all', label: t('COMMON.ALL') },
    { value: 'Active', label: t('COMMON.ACTIVE') },
    { value: 'Inactive', label: t('COMMON.INACTIVE') },
  ];
  const handleDropdownInputChange = (inputValue, filterName) => {
    if (filterName === 'role') {
      fetchRoles({ searchText: inputValue });
    }
  };

  const additionalFilters = [
    {
      label: t('USERS.FILTERS.USER_ROLE'),
      name: 'role',
      value: oFilters.role,
      options: roleOptions,
      placeholder: t('USERS.FILTERS.USER_ROLE'),
      searchable: true,
      searchPlaceholder: t('COMMON.SEARCH_ROLE') || 'Search role',
      onInputChange: (inputValue) => handleDropdownInputChange(inputValue, 'role'),
    },
    {
      label: t('USERS.FILTERS.STATUS'),
      name: 'status',
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages));
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const [deletePopup, setDeletePopup] = useState({ open: false, userId: null });
  const handleDelete = (userId) => {
    setDeletePopup({ open: true, userId });
  };
  const handleDeleteConfirm = async () => {
    const { userId } = deletePopup;
    try {
      const token = localStorage.getItem("token");
      const response = await apiDelete(`${DELETE_USER}/${userId}`, token);
      const backendMessage = response.data.MESSAGE;
      showEmsg(backendMessage , STATUS.SUCCESS);
      fetch({ pageNumber: nCurrentPage, pageSize: itemsPerPage, searchText: sSearchTerm });
      setDeletePopup({ open: false, userId: null });
    } catch (err) {
      const errorMessage = error?.response?.data?.MESSAGE 
      showEmsg( errorMessage || t('COMMON.API_ERROR') , STATUS.ERROR);
      setDeletePopup({ open: false, userId: null });
    }
  };
  const handleDeletePopupClose = () => {
    setDeletePopup({ open: false, userId: null });
  };

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    userId: null,
    newStatus: null,
  });

  const handleStatusChange = (userId, isActive) => {
    setStatusPopup({ open: true, userId, newStatus: !isActive });
  };

  const handleStatusConfirm = async () => {
    const { userId, newStatus } = statusPopup;
    if (!updateStatusById) return;
    const result = await updateStatusById(userId, newStatus,USER_ACTIVE_STATUS, 'UserID');
    showEmsg(result.message, result.status);
    setStatusPopup({ open: false, userId: null, newStatus: null });
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, userId: null, newStatus: null });
  };

  useEffect(() => {
    fetch({
      pageNumber: nCurrentPage,
      pageSize: itemsPerPage,
      searchText: sSearchTerm || "",
      ...(oFilters.role !== "all" ? { roleName: oFilters.role } : {}),
      ...(oFilters.status !== "all" ? { status: oFilters.status } : {}),
    });
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters]);

  useEffect(() => {
    setTitle(t("USERS.TITLE"));
  }, [setTitle, t]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, oFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-secondary">
              {t("USERS.DESCRIPTION")}
            </p>
          </div>
          <button onClick={() => navigate("/add-user")} className="btn-primary">
            <UserPlus className="h-5 w-5 mr-2" />
            {t("USERS.ADD_USER")}
          </button>
        </div>
      </div>
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
      />
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
                    <td colSpan="6" className="text-center py-4">
                      {t("COMMON.LOADING")}
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-red-500">
                      {t("USERS.FETCH_ERROR")}
                    </td>
                  </tr>
                ) : usersData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
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
                              className="h-10 w-10 rounded-full"
                              src={user.ProfileImageUrl || userProfile}
                              onError={(e) => { e.target.onerror = null; e.target.src = userProfile; console.log('Fallback image loaded'); }}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="table-cell-text">
                              {user.FirstName} {user.LastName}
                            </div>
                            <div className="table-cell-subtext sm:hidden">
                              {user.Email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="table-cell-subtext flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.Email}
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
                            {user.RoleName}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Switch checked={user.Status === "Active"} onChange={() => handleStatusChange(user.UserID, user.Status === "Active")} />
                      </td>
                      <td className="table-cell text-right">
                        <ActionButtons
                          id={user.UserID}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-4">
                  {t("COMMON.LOADING")}
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
                        src={user.ProfileImageUrl || userProfile}
                        onError={(e) => { e.target.onerror = null; e.target.src = userProfile; console.log('Fallback image loaded'); }}
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
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.Status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {t(`${user.Status?.toUpperCase()}`)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.Email}</span>
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
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <Pagination
        currentPage={nCurrentPage}
        totalPages={nTotalPages}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={`Are you sure you want to set this user as ${
            statusPopup.newStatus ? t('COMMON.ACTIVE') : t('COMMON.INACTIVE')
          }?`}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
      {deletePopup.open && (
        <FullscreenErrorPopup
          message={t('USERS.DELETE_CONFIRM_MESSAGE')}
          onClose={handleDeletePopupClose}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default Users;
