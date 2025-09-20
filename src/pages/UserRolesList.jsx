import { useState, useEffect } from "react";
import { UserPlus, Shield } from "lucide-react";
import Toolbar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import NotFoundMessage from "../components/NotFoundMessage";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import FullscreenErrorPopup from "../components/FullscreenErrorPopup";
import { UPDATE_ROLE_STATUS } from "../contants/apiRoutes";
import { showEmsg } from "../utils/ShowEmsg";
import { ToastContainer } from "react-toastify";
import { ITEMS_PER_PAGE, STATUS,STATUS_OPTIONS } from "../contants/constants.jsx";
import Loader from "../components/Loader";
import { hideLoaderWithDelay } from "../utils/loaderUtils";
import { getPermissionCode, hasPermissionId } from "../utils/permissionUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchResource, updateStatusById } from "../store/slices/allDataSlice.jsx";

const UserRolesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTitle } = useTitle();
  
  // Redux selectors
  const { data: contextRoles = [], loading: bLoading, error: nError, total } = useSelector(
    (state) => state.allData.resources.roles || { data: [], loading: false, error: null, total: 0 }
  );
  
  const [sSearchTerm, setSearchTerm] = useState("");
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = ITEMS_PER_PAGE;
  const nTotalPages = Math.ceil(total / itemsPerPage);
  const [bSubmitting, setSubmitting] = useState(false);
  const [statusPopup, setStatusPopup] = useState({
    open: false,
    roleId: null,
    newStatus: null,
  });
  const [roles, setRoles] = useState([]);
  const [deletePopup, setDeletePopup] = useState({ open: false, roleId: null });
  const [bFilterLoading, setFilterLoading] = useState(false);
  const permissionIdForDelete = getPermissionCode(
    "Role Management",
    "Delete Role"
  );
  const hasDeletePermission = hasPermissionId(permissionIdForDelete);

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const handleFilterChange = (e, filterName) => {
    setFilterLoading(true);
    if (filterName === "status") {
      setSelectedStatus(e.target.value);
      setCurrentPage(1);
    }
  };

  const additionalFilters = [
    {
      label: t("COMMON.STATUS"),
      name: "status",
      value: selectedStatus,
      options: statusOptions,
    },
  ];

  useEffect(() => {
    const filterParams = {
      pageNumber: nCurrentPage,
      pageSize: itemsPerPage,
      searchText: sSearchTerm,
    };
    if (selectedStatus !== "all") {
      filterParams.IsActive = selectedStatus;
    }

    const fetchData = async () => {
      try {
        await dispatch(fetchResource({ key: "roles", params: filterParams }));
      } finally {
        setFilterLoading(false);
      }
    };

    fetchData();
  }, [nCurrentPage, sSearchTerm, selectedStatus, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm]);

  useEffect(() => {
    setTitle(t("USER_ROLES_LIST.TITLE"));
    return () => setTitle("");
  }, [setTitle, t]);

  useEffect(() => {
    setRoles(contextRoles);
  }, [contextRoles]);

  const paginatedRoles = roles || [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  
  const handleEdit = (roleId, roleName, status) => {
   
    navigate(`/edit-UserRole/${roleId}`, {
      state: {
        roleId,
        roleName,
        status, 
      },
    });
  };

  const handleStatusChange = (roleId, isActive) => {
    setStatusPopup({ open: true, roleId, newStatus: !isActive });
  };

  const handleStatusConfirm = async () => {
    setSubmitting(true);
    const { roleId, newStatus } = statusPopup;
    
    try {
      // Update status using Redux thunk
      const result = await dispatch(updateStatusById({
        key: "roles",
        id: roleId,
        newStatus,
        apiRoute: UPDATE_ROLE_STATUS,
        idField: "RoleID"
      })).unwrap();
      
      showEmsg(result.message, STATUS.SUCCESS);
      
      // Refresh roles data after status update
      const filterParams = {
        pageNumber: nCurrentPage,
        pageSize: itemsPerPage,
        searchText: sSearchTerm,
      };
      if (selectedStatus !== "all") filterParams.status = selectedStatus;
      
      await dispatch(fetchResource({ key: "roles", params: filterParams }));
      
    } catch (err) {
      showEmsg(err.error || t("COMMON.API_ERROR"), STATUS.ERROR);
    } finally {
      setStatusPopup({ open: false, roleId: null, newStatus: null });
      hideLoaderWithDelay(setSubmitting);
    }
  };

  const handleStatusPopupClose = () => {
    setStatusPopup({ open: false, roleId: null, newStatus: null });
  };

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
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("USER_ROLES_LIST.SEARCH_PLACEHOLDER")}
        onCreate={() => navigate("/addUserRole")}
        createLabel={t("USER_ROLES_LIST.ADD_ROLE")}
      />
      {sViewMode === "table" ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    {t("USER_ROLES_LIST.TABLE.ROLE_NAME")}
                  </th>
                  <th
                    scope="col"
                    className="table-head-cell hidden sm:table-cell"
                  >
                   {t("COMMON.STATUS")}
                  </th>
                  <th scope="col" className="table-head-cell text-center">
                    {t("COMMON.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {bLoading || bFilterLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="flex justify-center">
                        <Loader size="small" />
                      </div>
                    </td>
                  </tr>
                ) : nError ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      {t("USER_ROLES_LIST.NO_ROLES_FOUND")}
                    </td>
                  </tr>
                ) : paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted">
                      {t("USER_ROLES_LIST.NO_ROLES_FOUND")}
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((role) => (
                    <tr key={role.roleid || role.RoleID} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="status-badge bg-blue-100 text-blue-800">
                            <span className="ellipsis-text">
                              {role.rolename || role.RoleName}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Switch
                         checked={role.IsActive === true}
                          onChange={() =>
                            handleStatusChange(
                              role.roleid || role.RoleID,
                              role.IsActive === true
                            )
                          }
                        />
                      </td>
                      <td className="table-cell text-center font-medium align-middle">
                        <div className="flex justify-right items-right">
                          <ActionButtons
                            id={role.roleid || role.RoleID}                  
                            onEdit={() => handleEdit(role.RoleID, role.RoleName, role.IsActive)}
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
          {roles.map((role) => (
            <div
              key={role.roleid || role.RoleID}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="status-badge bg-blue-100 text-blue-800">
                      {role.rolename || role.RoleName}
                    </span>
                  </div>
                  <p className="text-secondary">
                    {t("USER_ROLES_LIST.TABLE.ROLE_ID")}:{" "}
                    {role.roleid || role.RoleID}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    role.IsActive === true
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {role.IsActive === true ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                </span>
              </div>
              <ActionButtons
                id={role.roleid || role.RoleID}
                onEdit={() => handleEdit(role.RoleID, role.RoleName, role.IsActive)}         
              />
            </div>
          ))}
          {roles.length === 0 && (
            <NotFoundMessage message={t("USER_ROLES_LIST.NO_ROLES_FOUND")} />
          )}
        </div>
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
          message={t("USER_ROLES_LIST.STATUS_CONFIRM_MESSAGE", {
            status: statusPopup.newStatus
              ? t("COMMON.ACTIVE")
              : t("COMMON.INACTIVE"),
          })}
          onClose={handleStatusPopupClose}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
};

export default UserRolesList;
