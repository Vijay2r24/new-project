import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, UserPlus, LayoutGrid, List, Edit, Trash,} from 'lucide-react';
import Toolbar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";

const UserRolesList = () => {
  const navigate = useNavigate();
  // Placeholder data
  const userRoles = [
    { roleid: '1', rolename: 'Admin', storename: 'Global Store', status: 'Active' },
    { roleid: '2', rolename: 'Manager', storename: 'Main Branch', status: 'Active' },
    { roleid: '3', rolename: 'Staff', storename: 'Downtown Store', status: 'Inactive' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRoles = userRoles.filter(role =>
    role.rolename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.storename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

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
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search by Role Name or Store..."
        viewMode={viewMode}
        setViewMode={setViewMode}
        additionalFilters={[]}
        handleFilterChange={() => {}}
      />

      {/* User Roles List */}
      {viewMode === 'table' ? (
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
                      <div className="flex items-center justify-start space-x-2">
                        <button onClick={() => handleEdit(store.id)} className="action-button" title="Edit">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(store.id)} className="action-button" title="Delete">
                          <Trash className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleMore(store.id)} className="action-button" title="More">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No user roles found.
                    </td>
                  </tr>
                )}
                {filteredRoles.length > 0 && paginatedRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No user roles found on this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Section */}
          <div className="pagination-section flex items-center justify-between">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <div className="pagination-wrapper hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div className="pagination-text">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredRoles.length)}</span> of{' '}
                <span className="font-medium">{filteredRoles.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={`pagination-btn${currentPage === idx + 1 ? ' pagination-btn-active' : ''}`}
                    onClick={() => handlePageClick(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
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
              <div className="text-right">
                 <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 mr-2" title="Edit Role">
                   <Edit className="h-5 w-5" />
                 </button>
                 <button className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100" title="Delete Role">
                   <Trash2 className="h-5 w-5" />
                 </button>
              </div>
            </div>
          ))}
          {filteredRoles.length === 0 && (
             <div className="col-span-full py-8 text-center text-gray-500">
               No user roles found.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRolesList; 