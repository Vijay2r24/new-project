import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Toolbar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";
import Pagination from '../components/Pagination';
import ActionButtons from '../components/ActionButtons';
import NotFoundMessage from '../components/NotFoundMessage';
const UserRolesList = () => {
  const navigate = useNavigate();
  const aUserRoles = [
    { roleid: '1', rolename: 'Admin', storename: 'Global Store', status: 'Active' },
    { roleid: '2', rolename: 'Manager', storename: 'Main Branch', status: 'Active' },
    { roleid: '3', rolename: 'Staff', storename: 'Downtown Store', status: 'Inactive' },
  ];

  const [sSearchTerm, setSearchTerm] = useState('');
  const [sViewMode, setViewMode] = useState('table');
  const [nCurrentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRoles = aUserRoles.filter(role =>
    role.rolename.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
    role.storename.toLowerCase().includes(sSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (nCurrentPage - 1) * itemsPerPage,
    nCurrentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  const handleEdit = () => {

  }
  const handleDelete = () => {

  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">User Roles</h1>
            <p className="mt-1 text-sm text-gray-500">Manage user roles and their permissions</p>
          </div>
          {/* Add Role Button Placeholder */}
          <button
            onClick={() => navigate("/addUserRole")}
            className='btn-primary'>
            <UserPlus className="h-5 w-5 mr-2" />
            Add Role
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search by Role Name or Store..."
        viewMode={sViewMode}
        setViewMode={setViewMode}
        additionalFilters={[]}
        handleFilterChange={() => { }}
      />
      {/* User Roles List */}
      {sViewMode === 'table' ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    Role ID
                  </th>
                  <th scope="col" className="table-head-cell">
                    Role Name
                  </th>
                  <th scope="col" className="table-head-cell hidden sm:table-cell">
                    Store Name
                  </th>
                  <th scope="col" className="table-head-cell">
                    Status
                  </th>
                  <th scope="col" className="table-head-cell text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {paginatedRoles.map((role) => (
                  <tr key={role.roleid} className="table-row">
                    <td className="table-cell">
                      {role.roleid}
                    </td>
                    <td className="table-cell">
                      {role.rolename}
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      {role.storename}
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${role.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {role.status}
                      </span>
                    </td>
                    <td className="table-cell text-left font-medium">
                      <ActionButtons
                        id={''}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMore={() => console.log('More options for')}
                      />
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                     <NotFoundMessage  message ='No user roles found.'/>
                    </td>
                  </tr>
                )}
                {filteredRoles.length > 0 && paginatedRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <NotFoundMessage message='No user roles found on this page.' />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.roleid} className="bg-white shadow-md rounded-lg p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{role.rolename}</h3>
                  <p className="text-sm text-gray-500 mt-1">Role ID: {role.roleid}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${role.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {role.status}
                </span>
              </div>
              <div className="flex-grow text-base text-gray-700 mb-4">
                <p><strong>Store:</strong> {role.storename}</p>
              </div>
              {/* Actions */}
              <ActionButtons
                id={''}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMore={() => console.log('More options for')}
              />
            </div>
          ))}
          {filteredRoles.length === 0 && (
            
             <NotFoundMessage message='No user roles found.' />
           
          )}
        </div>
      )}
      {/* Pagination component */}
      <Pagination
        currentPage={nCurrentPage}
        totalPages={totalPages}
        totalItems={filteredRoles.length}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handlePageClick={handlePageClick}
      />
    </div>
  );
};

export default UserRolesList; 