import { useState, useEffect } from "react";
import { Mail, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import userProfile from "../../assets/images/userProfile.svg";
import Loader from "../components/Loader";

const Users = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = 10;

  // Dummy users data with images
 const dummyUsers = [
  {
    UserID: "U001",
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PhoneNumber: "+1 (555) 123-4567",
    RoleName: "Admin",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
  {
    UserID: "U002",
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@example.com",
    PhoneNumber: "+1 (555) 987-6543",
    RoleName: "HR",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
  },
  {
    UserID: "U003",
    FirstName: "Robert",
    LastName: "Johnson",
    Email: "robert.j@example.com",
    PhoneNumber: "+1 (555) 456-7890",
    RoleName: "User",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    UserID: "U004",
    FirstName: "Emily",
    LastName: "Wilson",
    Email: "emily.w@example.com",
    PhoneNumber: "+1 (555) 321-6547",
    RoleName: "User",
    IsActive: false,
    ProfileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    UserID: "U005",
    FirstName: "Michael",
    LastName: "Brown",
    Email: "michael.b@example.com",
    PhoneNumber: "+1 (555) 654-3210",
    RoleName: "User",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    UserID: "U006",
    FirstName: "Sarah",
    LastName: "Davis",
    Email: "sarah.d@example.com",
    PhoneNumber: "+1 (555) 789-0123",
    RoleName: "HR",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  },
  {
    UserID: "U007",
    FirstName: "David",
    LastName: "Miller",
    Email: "david.m@example.com",
    PhoneNumber: "+1 (555) 012-3456",
    RoleName: "Admin",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=400&fit=crop",
  },
  {
    UserID: "U008",
    FirstName: "Lisa",
    LastName: "Anderson",
    Email: "lisa.a@example.com",
    PhoneNumber: "+1 (555) 234-5678",
    RoleName: "User",
    IsActive: false,
    ProfileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
  },
  {
    UserID: "U009",
    FirstName: "James",
    LastName: "Wilson",
    Email: "james.w@example.com",
    PhoneNumber: "+1 (555) 345-6789",
    RoleName: "User",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
  },
  {
    UserID: "U010",
    FirstName: "Maria",
    LastName: "Garcia",
    Email: "maria.g@example.com",
    PhoneNumber: "+1 (555) 456-7891",
    RoleName: "User",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  },
  {
    UserID: "U011",
    FirstName: "Thomas",
    LastName: "Lee",
    Email: "thomas.l@example.com",
    PhoneNumber: "+1 (555) 567-8901",
    RoleName: "User",
    IsActive: false,
    ProfileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  },
  {
    UserID: "U012",
    FirstName: "Jennifer",
    LastName: "Taylor",
    Email: "jennifer.t@example.com",
    PhoneNumber: "+1 (555) 678-9012",
    RoleName: "HR",
    IsActive: true,
    ProfileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
  },
];

  const [aUsers, setUsers] = useState(dummyUsers);
  const [bLoading, setLoading] = useState(false);
  const [nTotalpages, setTotalpages] = useState(Math.ceil(dummyUsers.length / itemsPerPage));
  const [nTotalRecords, setTotalRecords] = useState(dummyUsers.length);

  const defaultFilters = {
    role: "all",
    status: "all",
  };
  const [oFilters, setFilters] = useState(defaultFilters);

  // Helper function to get profile image URL
  const getProfileImageUrl = (user) => {
    return user.ProfileImageUrl || userProfile;
  };

  // Helper function to get role color
  const getRoleColor = (roleName) => {
    const roleColors = {
      Admini: "bg-purple-100 text-purple-800",
      "HR": "bg-blue-100 text-blue-800",
      "User": "bg-green-100 text-green-800",
      "Inventory Manager": "bg-yellow-100 text-yellow-800",
      "Customer Service": "bg-indigo-100 text-indigo-800",
      "Marketing Manager": "bg-pink-100 text-pink-800",
    };
    return roleColors[roleName] || "bg-gray-100 text-gray-800";
  };

  // Filter users based on search term and filters
  const filteredUsers = aUsers.filter(user => {
    const matchesSearch = 
      sSearchTerm === "" ||
      user.FirstName.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      user.LastName.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      user.PhoneNumber.includes(sSearchTerm) ||
      user.RoleName.toLowerCase().includes(sSearchTerm.toLowerCase());

    const matchesRole = 
      oFilters.role === "all" || 
      user.RoleName === oFilters.role;

    const matchesStatus = 
      oFilters.status === "all" || 
      (oFilters.status === "true" && user.IsActive) ||
      (oFilters.status === "false" && !user.IsActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate pagination
  const startIndex = (nCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const totalFilteredpages = Math.ceil(filteredUsers.length / itemsPerPage);

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
    { value: "Administrator", label: "Administrator" },
    { value: "Store Manager", label: "Store Manager" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Inventory Manager", label: "Inventory Manager" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Marketing Manager", label: "Marketing Manager" },
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "true", label: t("COMMON.ACTIVE") },
    { value: "false", label: t("COMMON.INACTIVE") },
  ];

  const additionalFilters = [
    {
      label: t("USERS.FILTERS.USER_ROLE"),
      name: "role",
      value: oFilters.role,
      options: roleOptions,
      placeholder: t("USERS.FILTERS.USER_ROLE"),
    },
    {
      label: t("USERS.FILTERS.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage(prev => Math.min(prev + 1, totalFilteredpages));
  const handlePageClick = (page) => setCurrentPage(page);

  const handleEdit = (userId) => navigate(`/editUser/${userId}`);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.UserID === userId 
          ? { ...user, IsActive: newStatus }
          : user
      )
    );
  };

  useEffect(() => {
    setTitle(t("USERS.TITLE"));
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
        searchPlaceholder={t("USERS.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onCreate={() => navigate("/addUser")}
        createLabel={t("USERS.ADD_USER")}
      />

      {/* table view */}
      {sViewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMMON.USER")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("USERS.TABLE.CONTACT")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("COMMON.ROLE")}
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
                    <td colSpan="5" className="text-center py-8">
                      <div className="flex justify-center items-center h-32">
                        <Loader className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      {t("USERS.NO_USERS_FOUND")}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.UserID} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              src={getProfileImageUrl(user)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = userProfile;
                              }}
                              alt={`${user.FirstName} ${user.LastName}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.FirstName} {user.LastName}
                            </div>
                            <div className="text-sm text-gray-500 sm:hidden">
                              {user.Email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <a 
                              href={`mailto:${user.Email}`}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {user.Email}
                            </a>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <a 
                              href={`tel:${user.PhoneNumber}`}
                              className="hover:text-blue-600"
                            >
                              {user.PhoneNumber}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <Shield className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.RoleName)}`}>
                            {user.RoleName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.IsActive}
                            onChange={(e) =>
                              handleStatusChange(user.UserID, e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionButtons 
                          id={user.UserID} 
                          onEdit={handleEdit}
                          showView={true}
                          onView={() => navigate(`/user/${user.UserID}`)}
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
          ) : paginatedUsers.length === 0 ? (
            <div className="col-span-full text-center py-4">
              {t("USERS.NO_USERS_FOUND")}
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div
                key={user.UserID}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                      <img
                        className="h-full w-full object-cover"
                        src={getProfileImageUrl(user)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = userProfile;
                        }}
                        alt={`${user.FirstName} ${user.LastName}`}
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white ${user.IsActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate text-center">
                      {user.FirstName} {user.LastName}
                    </div>
                    <div className="flex items-center mt-1 justify-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleColor(user.RoleName)}`}>
                        {user.RoleName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a 
                      href={`mailto:${user.Email}`}
                      className="truncate hover:text-blue-600 hover:underline"
                      title={user.Email}
                    >
                      {user.Email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a 
                      href={`tel:${user.PhoneNumber}`}
                      className="hover:text-blue-600"
                    >
                      {user.PhoneNumber}
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.IsActive}
                        onChange={(e) =>
                          handleStatusChange(user.UserID, e.target.checked)
                        }
                        size="small"
                      />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.IsActive ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                      </span>
                    </div>
                    <ActionButtons 
                      id={user.UserID} 
                      onEdit={handleEdit}
                      size="small"
                      showView={true}
                      onView={() => navigate(`/user/${user.UserID}`)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalpages={totalFilteredpages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
    </div>
  );
};

export default Users;