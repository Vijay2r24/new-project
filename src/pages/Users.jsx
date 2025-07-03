import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Shield, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { apiGet, apiPatch, apiDelete } from "../utils/ApiUtils";
import {
  getAllUsers,
  userActiveStatus,
  deleteUser,
} from "../contants/apiRoutes";
import { useTitle } from "../context/TitleContext";
import { STATUS } from "../contants/constants";
import { useRoles } from "../context/AllDataContext";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Users = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sFilterStatus, setFilterStatus] = useState("all");
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const [aUsers, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  const [oFilters, setFilters] = useState({
    role: "all",
    status: "all",
  });
  const roles = useRoles();
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
  const aAdditionalFilters = [
    {
      label: t('USERS.FILTERS.USER_ROLE'),
      name: 'role',
      value: oFilters.role,
      options: [
        { value: 'all', label: t('COMMON.ALL') },
        ...(Array.isArray(roles.data)
          ? roles.data.map((role) => ({
              value: role.RoleName,
              label: role.RoleName,
            }))
          : []),
      ],
    },
    {
      label: t('USERS.FILTERS.STATUS'),
      name: 'status',
      value: oFilters.status,
      options: [
        { value: 'all', label: t('COMMON.ALL') },
        { value: 'Active', label: t('COMMON.ACTIVE') },
        { value: 'Inactive', label: t('COMMON.INACTIVE') },
      ],
    },
  ];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
      const response = await apiDelete(`${deleteUser}/${userId}`, token);
      const backendMessage = response.data.MESSAGE;

      showEmsg(backendMessage , STATUS.SUCCESS);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.UserID !== userId)
      );
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
    try {
      const token = localStorage.getItem("token");
      const payload = { Status: newStatus ? "Active" : "Inactive" };
      const response = await apiPatch(
        `${userActiveStatus}/${userId}`,
        payload,
        token
      );
      const backendMessage = response.data.MESSAGE;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.UserID === userId ? { ...user, Status: payload.Status } : user
        )
      );

      showEmsg(backendMessage, STATUS.SUCCESS);
      setStatusPopup({ open: false, userId: null, newStatus: null });
    } catch (err) {
      const errorMessage = error?.response?.data?.MESSAGE 
      showEmsg(errorMessage || t('COMMON.API_ERROR'),STATUS.ERROR);
      setStatusPopup({ open: false, userId: null, newStatus: null });
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, userId: null, newStatus: null });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = {
        pageNumber: nCurrentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm || "",
      };
      if (oFilters.role !== "all") {
        params.roleName = oFilters.role;
      }
      if (oFilters.status !== "all") {
        params.status = oFilters.status;
      }
      console.log("Fetching users with params:", params);
      const oResponse = await apiGet(getAllUsers, params, token);
      console.log("API response:", oResponse.data);
      if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        setUsers(oResponse.data.data.data || []);
        setTotalItems(oResponse.data.data.totalRecords || 0);
        setTotalPages(oResponse.data.data.totalPages || 1);
      } else {
        setError(oResponse.data.message || t("USERS.FETCH_ERROR"));
      }
    } catch (err) {
      setError(t("USERS.FETCH_ERROR"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [nCurrentPage, itemsPerPage, sSearchTerm, oFilters.role, oFilters.status]);

  useEffect(() => {
    setTitle(t("USERS.TITLE"));
  }, [setTitle, t]);

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
        filterStatus={sFilterStatus}
        setFilterStatus={setFilterStatus}
        additionalFilters={aAdditionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("USERS.SEARCH_PLACEHOLDER")}
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
                ) : aUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {t("USERS.NO_USERS_FOUND")}
                    </td>
                  </tr>
                ) : (
                  aUsers.map((user) => (
                    <tr key={user.UserID} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                user.ProfileImageUrl ||
                                "https://ui-avatars.com/api/?name=" +
                                  user.FirstName +
                                  "+" +
                                  user.LastName +
                                  "&background=0D8ABC&color=fff"
                              }
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
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            checked={user.Status === "Active"}
                            onChange={() =>
                              handleStatusChange(
                                user.UserID,
                                user.Status === "Active"
                              )
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
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
            ) : aUsers.length === 0 ? (
              <div className="col-span-full text-center py-4">
                {t("USERS.NO_USERS_FOUND")}
              </div>
            ) : (
              aUsers.map((user) => (
                <div
                  key={user.UserID}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full overflow-hidden">
                      <img
                        className="h-full w-full object-cover"
                        src={
                          user.ProfileImageUrl ||
                          "https://ui-avatars.com/api/?name=" +
                            user.FirstName +
                            "+" +
                            user.LastName +
                            "&background=0D8ABC&color=fff"
                        }
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
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
      {statusPopup.open && (
        <FullscreenErrorPopup
          message={`Are you sure you want to set this user as ${
            statusPopup.newStatus ? "Active" : "Inactive"
          }?`}
          onClose={handleStatusPopupClose}
        >
          <button
            onClick={handleStatusConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
              {t('COMMON.CONFIRM')}
          </button>
          <button
            onClick={handleStatusPopupClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
              {t('COMMON.CANCEL')}
          </button>
        </FullscreenErrorPopup>
      )}
      {deletePopup.open && (
        <FullscreenErrorPopup
          message={"Are you sure you want to delete this user?"}
          onClose={handleDeletePopupClose}
        >
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
          {t('COMMON.DELETE')}
          </button>
          <button
            onClick={handleDeletePopupClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
           {t('COMMON.CANCEL')}
          </button>
        </FullscreenErrorPopup>
      )}
    </div>
  );
};

export default Users;
