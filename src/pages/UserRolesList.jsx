import { useState, useEffect, Fragment } from "react";
import { Users, Shield, Key, Clock, CheckCircle, XCircle, ChevronRight, ChevronDown, Save, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import Loader from "../components/Loader";

const Roles = () => {
  const navigate = useNavigate();
  const { roleId } = useParams(); // Get roleId from URL if present
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = 10;
  const [editingRole, setEditingRole] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);

  // Sample permission data
  const allPermissions = [
    { id: "PERM001", name: "Dashboard View", category: "General" },
    { id: "PERM002", name: "User Management", category: "Users" },
    { id: "PERM003", name: "Create Users", category: "Users" },
    { id: "PERM004", name: "Edit Users", category: "Users" },
    { id: "PERM005", name: "Delete Users", category: "Users" },
    { id: "PERM006", name: "Role Management", category: "Roles" },
    { id: "PERM007", name: "Create Roles", category: "Roles" },
    { id: "PERM008", name: "Edit Roles", category: "Roles" },
    { id: "PERM009", name: "Delete Roles", category: "Roles" },
    { id: "PERM010", name: "Settings Access", category: "System" },
    { id: "PERM011", name: "Audit Logs", category: "System" },
    { id: "PERM012", name: "API Access", category: "System" },
  ];

  // Dummy roles data with selected permissions
  const dummyRoles = [
    {
      RoleID: "ROL001",
      RoleName: "Admin",
      Description: "Full system access with all administrative permissions",
      UserCount: 3,
      PermissionCount: 45,
      IsActive: true,
      CreatedDate: "2024-01-15",
      Priority: 1,
      SelectedPermissions: ["PERM001", "PERM002", "PERM003", "PERM004", "PERM005", "PERM006", "PERM007", "PERM008", "PERM009", "PERM010", "PERM011", "PERM012"]
    },
    {
      RoleID: "ROL008",
      RoleName: "HR",
      Description: "Manage human resources, recruitment, and employee data",
      UserCount: 5,
      PermissionCount: 30,
      IsActive: true,
      CreatedDate: "2024-01-30",
      Priority: 2,
      SelectedPermissions: ["PERM001", "PERM002", "PERM003", "PERM004", "PERM006"]
    },
    {
      RoleID: "ROL016",
      RoleName: "User",
      Description: "Standard user with basic access rights",
      UserCount: 150,
      PermissionCount: 12,
      IsActive: true,
      CreatedDate: "2024-01-01",
      Priority: 3,
      SelectedPermissions: ["PERM001"]
    }
  ];

  const [aRoles, setRoles] = useState(dummyRoles);
  const [bLoading, setLoading] = useState(false);
  const [nTotalpages, setTotalpages] = useState(Math.ceil(dummyRoles.length / itemsPerPage));
  const [nTotalRecords, setTotalRecords] = useState(dummyRoles.length);
  const [tempPermissions, setTempPermissions] = useState([]);

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

  // Handle edit button click - open inline editor
  const handleEdit = (roleId) => {
    const role = aRoles.find(r => r.RoleID === roleId);
    if (role) {
      setEditingRole(roleId);
      setTempPermissions([...role.SelectedPermissions]);
      setExpandedRole(roleId); // Expand the role to show permissions
      // Update URL without navigation
      window.history.pushState(null, "", `/roles/${roleId}`);
    }
  };

  // Handle save permissions
  const handleSavePermissions = (roleId) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.RoleID === roleId
          ? { 
              ...role, 
              SelectedPermissions: [...tempPermissions],
              PermissionCount: tempPermissions.length
            }
          : role
      )
    );
    setEditingRole(null);
    setTempPermissions([]);
    // Reset URL
    window.history.pushState(null, "", "/roles");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRole(null);
    setTempPermissions([]);
    // Reset URL
    window.history.pushState(null, "", "/roles");
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    setTempPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle category toggle (select all/none in category)
  const handleCategoryToggle = (category) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const allCategorySelected = categoryPermissions.every(p => tempPermissions.includes(p));
    
    if (allCategorySelected) {
      // Remove all permissions from this category
      setTempPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)));
    } else {
      // Add all missing permissions from this category
      const missingPermissions = categoryPermissions.filter(p => !tempPermissions.includes(p));
      setTempPermissions(prev => [...prev, ...missingPermissions]);
    }
  };

  const handleStatusChange = (roleId, newStatus) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.RoleID === roleId
          ? { ...role, IsActive: newStatus }
          : role
      )
    );
  };

  // Toggle role expansion
  const toggleRoleExpansion = (roleId) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  // Check if all permissions in category are selected
  const isCategoryFullySelected = (category) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.id);
    return categoryPermissions.every(p => tempPermissions.includes(p));
  };

  // Check if some permissions in category are selected
  const isCategoryPartiallySelected = (category) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.id);
    const selectedCount = categoryPermissions.filter(p => tempPermissions.includes(p)).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  // Get unique categories
  const categories = [...new Set(allPermissions.map(p => p.category))];

  // Initialize editing when roleId is in URL
  useEffect(() => {
    if (roleId) {
      const role = aRoles.find(r => r.RoleID === roleId);
      if (role) {
        setEditingRole(roleId);
        setTempPermissions([...role.SelectedPermissions]);
        setExpandedRole(roleId);
      }
    }
  }, [roleId, aRoles]);

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

      {/* Table view */}
      {sViewMode === "table" ? (
        <div className="space-y-4">
          {paginatedRoles.map((role) => (
            <div key={role.RoleID} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Role header */}
              <div 
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                  expandedRole === role.RoleID ? 'bg-gray-50' : ''
                }`}
                onClick={() => toggleRoleExpansion(role.RoleID)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {role.RoleName}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ID: {role.RoleID}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {role.Description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {/* <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(role.Priority)}`}>
                          {getPriorityLabel(role.Priority)}
                        </span> */}
                        <Switch
                          checked={role.IsActive}
                          onChange={(e) =>
                            handleStatusChange(role.RoleID, e.target.checked)
                          }
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(role.CreatedDate)}
                      </div>
                    </div>
                    {expandedRole === role.RoleID ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded content - Permissions */}
              {expandedRole === role.RoleID && (
                <div className="border-t border-gray-100 p-6">
                  {editingRole === role.RoleID ? (
                    // Edit mode
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Edit Permissions for {role.RoleName}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSavePermissions(role.RoleID)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                          <div key={category} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{category}</h4>
                              <button
                                type="button"
                                onClick={() => handleCategoryToggle(category)}
                                className={`px-2 py-1 text-xs rounded ${
                                  isCategoryFullySelected(category)
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : isCategoryPartiallySelected(category)
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {isCategoryFullySelected(category)
                                  ? 'Deselect All'
                                  : 'Select All'}
                              </button>
                            </div>
                            <div className="space-y-2">
                              {allPermissions
                                .filter(p => p.category === category)
                                .map((permission) => (
                                  <div key={permission.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`perm-${permission.id}`}
                                      checked={tempPermissions.includes(permission.id)}
                                      onChange={() => handlePermissionToggle(permission.id)}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label
                                      htmlFor={`perm-${permission.id}`}
                                      className="ml-3 text-sm text-gray-700"
                                    >
                                      {permission.name}
                                    </label>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Assigned Permissions ({role.PermissionCount})
                        </h3>
                        <button
                          onClick={() => handleEdit(role.RoleID)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit Permissions
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allPermissions
                          .filter(p => role.SelectedPermissions.includes(p.id))
                          .map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {permission.category}
                                </div>
                              </div>
                              <Key className="h-4 w-4 text-gray-400" />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Card view remains similar but with expandable permissions
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedRoles.map((role) => (
            <div
              key={role.RoleID}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              {/* Card content - similar to before */}
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
                  <button
                    onClick={() => handleEdit(role.RoleID)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Edit Permissions
                  </button>
                </div>
              </div>
            </div>
          ))}
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