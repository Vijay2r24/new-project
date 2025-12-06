import { useState, useEffect } from "react";
import { Users, Shield, Key, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import Loader from "../components/Loader";

const Roles = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = 10;

  // Dummy roles data
  const dummyRoles = [
    {
      RoleID: "ROL001",
      RoleName: "Admin",
      Description: "Full system access with all administrative permissions",
      UserCount: 3,
      PermissionCount: 45,
      IsActive: true,
      CreatedDate: "2024-01-15",
      Priority: 1
    },
    {
      RoleID: "ROL008",
      RoleName: "HR",
      Description: "Manage human resources, recruitment, and employee data",
      UserCount: 5,
      PermissionCount: 30,
      IsActive: true,
      CreatedDate: "2024-01-30",
      Priority: 2
    },
    {
      RoleID: "ROL016",
      RoleName: "User",
      Description: "Standard user with basic access rights",
      UserCount: 150,
      PermissionCount: 12,
      IsActive: true,
      CreatedDate: "2024-01-01",
      Priority: 3
    }
  ];

  const [aRoles, setRoles] = useState(dummyRoles);
  const [bLoading, setLoading] = useState(false);
  const [nTotalpages, setTotalpages] = useState(Math.ceil(dummyRoles.length / itemsPerPage));
  const [nTotalRecords, setTotalRecords] = useState(dummyRoles.length);

  const defaultFilters = {
    status: "all",
    priority: "all",
  };
  const [oFilters, setFilters] = useState(defaultFilters);

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    const priorityColors = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-blue-100 text-blue-800",
      4: "bg-green-100 text-green-800",
      5: "bg-gray-100 text-gray-800",
    };
    return priorityColors[priority] || "bg-gray-100 text-gray-800";
  };

  // Helper function to get priority label
  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      1: "Critical",
      2: "High",
      3: "Medium",
      4: "Low",
      5: "Minimal",
    };
    return priorityLabels[priority] || "Unknown";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter roles based on search term and filters
  const filteredRoles = aRoles.filter(role => {
    const matchesSearch =
      sSearchTerm === "" ||
      role.RoleName.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      role.Description.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      role.RoleID.toLowerCase().includes(sSearchTerm.toLowerCase());

    const matchesStatus =
      oFilters.status === "all" ||
      (oFilters.status === "true" && role.IsActive) ||
      (oFilters.status === "false" && !role.IsActive);

    const matchesPriority =
      oFilters.priority === "all" ||
      role.Priority.toString() === oFilters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate pagination
  const startIndex = (nCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  const totalFilteredpages = Math.ceil(filteredRoles.length / itemsPerPage);

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

  const priorityOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "1", label: "Critical" },
    { value: "2", label: "High" },
    { value: "3", label: "Medium" },
    { value: "4", label: "Low" },
    { value: "5", label: "Minimal" },
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "true", label: t("COMMON.ACTIVE") },
    { value: "false", label: t("COMMON.INACTIVE") },
  ];

  const additionalFilters = [
    {
      label: t("ROLES.FILTERS.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
    {
      label: t("ROLES.FILTERS.PRIORITY"),
      name: "priority",
      value: oFilters.priority,
      options: priorityOptions,
    },
  ];

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage(prev => Math.min(prev + 1, totalFilteredpages));
  const handlePageClick = (page) => setCurrentPage(page);

  const handleEdit = (roleId) => navigate(`/editRole/${roleId}`);

  const handleStatusChange = (roleId, newStatus) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.RoleID === roleId
          ? { ...role, IsActive: newStatus }
          : role
      )
    );
  };

  useEffect(() => {
    setTitle(t("ROLES.TITLE"));
  }, [setTitle, t]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={sShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("ROLES.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/addRole")}
        createLabel={t("ROLES.ADD_ROLE")}
      />

      {/* table view */}
      {sViewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("ROLES.TABLE.ROLE_NAME")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("ROLES.TABLE.USERS")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("ROLES.TABLE.PERMISSIONS")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("ROLES.TABLE.PRIORITY")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMMON.STATUS")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMMON.ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex justify-center items-center h-32">
                        <Loader className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-4">
                      {t("ROLES.NO_ROLES_FOUND")}
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((role) => (
                    <tr key={role.RoleID} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {role.RoleName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {role.RoleID}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {role.UserCount} users
                            </div>
                            <div className="text-xs text-gray-500">
                              {role.IsActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {role.PermissionCount} permissions
                            </div>
                            <div className="text-xs text-gray-500">
                              {role.PermissionCount >= 30 ? "Full access" : "Limited access"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(role.Priority)}`}>
                          {getPriorityLabel(role.Priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={role.IsActive}
                            onChange={(e) =>
                              handleStatusChange(role.RoleID, e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionButtons
                          id={role.RoleID}
                          onEdit={handleEdit}
                          showView={true}
                          onView={() => navigate(`/role/${role.RoleID}`)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex justify-center items-center h-32">
                <Loader className="h-8 w-8" />
              </div>
            </div>
          ) : paginatedRoles.length === 0 ? (
            <div className="col-span-full text-center py-4">
              {t("ROLES.NO_ROLES_FOUND")}
            </div>
          ) : (
            paginatedRoles.map((role) => (
              <div
                key={role.RoleID}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                  <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {role.RoleName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {role.RoleID}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="line-clamp-2">{role.Description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-medium">Users</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {role.UserCount}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Key className="h-4 w-4 mr-2" />
                        <span className="font-medium">Permissions</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {role.PermissionCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(role.Priority)}`}>
                      {getPriorityLabel(role.Priority)}
                    </span>
                    <div className="flex items-center">
                      {role.IsActive ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Created: {formatDate(role.CreatedDate)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={role.IsActive}
                        onChange={(e) =>
                          handleStatusChange(role.RoleID, e.target.checked)
                        }
                        size="small"
                      />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${role.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {role.IsActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <ActionButtons
                      id={role.RoleID}
                      onEdit={handleEdit}
                      size="small"
                      showView={true}
                      onView={() => navigate(`/role/${role.RoleID}`)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {filteredRoles.length > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalpages={totalFilteredpages}
          totalItems={filteredRoles.length}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
    </div>
  );
};

export default Roles;