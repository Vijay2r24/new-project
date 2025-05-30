import React from 'react';
import { MoreVertical, Mail, Phone, MapPin, Shield, UserPlus } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';
const aMockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 891',
    role: 'Manager',
    status: 'Active',
    lastActive: '5 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=0D8ABC&color=fff',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 234 567 892',
    role: 'User',
    status: 'Inactive',
    lastActive: '2 days ago',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=0D8ABC&color=fff',
  },
  // Add more mock users as needed
];

const Users = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = React.useState('');
  const { t } = useTranslation();
  const [sSelectedRole, setSelectedRole] = React.useState('');
  const [sSelectedStatus, setSelectedStatus] = React.useState('');
  const [sViewMode, setViewMode] = React.useState('table'); // 'table' or 'grid'
  const [nCurrentPage, setCurrentPage] = React.useState(1);
  const [sFilterStatus, setFilterStatus] = React.useState('all');
  const [sShowFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const itemsPerPage = 3;
  const filteredUsers = aMockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(sSearchTerm.toLowerCase());
    const matchesRole = sSelectedRole ? user.role === sSelectedRole : true;
    const matchesStatus = sSelectedStatus ? user.status === sSelectedStatus : true;
    return matchesSearch && matchesRole && matchesStatus;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (nCurrentPage - 1) * itemsPerPage,
    nCurrentPage * itemsPerPage
  );
  const [oFilters, setFilters] = React.useState({
    role: 'all',
    status: 'all',
  });
  // Handle change for additional filters
  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
  };
  const aAdditionalFilters = [
    {
      label: 'User Role',
      name: 'role',
      value: oFilters.role,
      options: [
        { value: 'all', label: 'All' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'staff', label: 'Staff' },
      ],
    },
    {
      label: 'Status',
      name: 'status',
      value: oFilters.status,
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
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
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm, sSelectedRole, sSelectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('users.description')}
            </p>
          </div>
          <button onClick={() => navigate("/add-user")} className="btn-primary">
            <UserPlus className="h-5 w-5 mr-2" />
            {t('users.addUser')}
          </button>
        </div>
      </div>

      {/* Toolbar */}
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
        searchPlaceholder={t('users.searchPlaceholder')}
      />

      {/* Users List */}
      {sViewMode === 'table' ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">{t('users.table.user')}</th>
                  <th className="table-head-cell hidden sm:table-cell">{t('users.table.contact')}</th>
                  <th className="table-head-cell">{t('users.table.role')}</th>
                  <th className="table-head-cell">{t('users.table.status')}</th>
                  <th className="table-head-cell hidden sm:table-cell">{t('users.table.lastActive')}</th>
                  <th className="relative px-4 sm:px-6 py-3">
                    <span className="sr-only">{t('users.columns.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="table-cell-text">{user.name}</div>
                          <div className="table-cell-subtext sm:hidden">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="flex flex-col space-y-1">
                        <div className="table-cell-subtext flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        <div className="table-cell-subtext flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="status-badge bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {t(`users.status.${user.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="table-cell table-cell-subtext hidden sm:table-cell">
                      {user.lastActive}
                    </td>
                    <td className="table-cell text-right font-medium">
                      <button className="action-button">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {t('users.noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedUsers.map(user => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center gap-4">
                <img className="h-14 w-14 rounded-full object-cover" src={user.avatar} alt={user.name} />
                <div>
                  <div className="text-base font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t(`users.status.${user.status.toLowerCase()}`)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <Mail className="h-4 w-4" /> {user.email}
                <Phone className="h-4 w-4 ml-4" /> {user.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <MapPin className="h-4 w-4" /> {t('users.lastActive')}: {user.lastActive}
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button className="text-gray-400 hover:text-gray-500" title={t('users.more')}>
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={nCurrentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default Users; 