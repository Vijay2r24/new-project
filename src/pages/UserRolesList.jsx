import { useState, useEffect } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import Toolbar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";
import Pagination from '../components/Pagination';
import ActionButtons from '../components/ActionButtons';
import NotFoundMessage from '../components/NotFoundMessage';
import { useTranslation } from 'react-i18next';
import { useTitle } from '../context/TitleContext';
import { useRoles } from '../context/AllDataContext.jsx';

const UserRolesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const { data: aRoles = [], loading: bLoading, error: nError, total, fetch } = useRoles();
  const [sSearchTerm, setSearchTerm] = useState('');
  const [sViewMode, setViewMode] = useState('table');
  const [nCurrentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const nTotalPages = Math.ceil(total / itemsPerPage);

  useEffect(() => {
    fetch({ pageNumber: nCurrentPage, pageSize: itemsPerPage, searchText: sSearchTerm });
  }, [nCurrentPage, sSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sSearchTerm]);

  useEffect(() => {
    setTitle(t('USER_ROLES_LIST.TITLE'));
    return () => setTitle('');
  }, [setTitle, t]);

  const paginatedRoles = aRoles || [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, nTotalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  const handleEdit = (id) => {
    navigate(`/editUserRole/${id}`);
  }
  const handleDelete = () => {

  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="mt-1 text-secondary">{t('USER_ROLES_LIST.DESCRIPTION')}</p>
          </div>
          <button
            onClick={() => navigate("/addUserRole")}
            className='btn-primary'>
            <UserPlus className="h-5 w-5 mr-2" />
            {t('USER_ROLES_LIST.ADD_ROLE')}
          </button>
        </div>
      </div>
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t('USER_ROLES_LIST.SEARCH_PLACEHOLDER')}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        additionalFilters={[]}
        handleFilterChange={() => { }}
      />
      {bLoading ? (
        <div className="text-center py-8">{t('COMMON.LOADING')}...</div>
      ) : nError ? (
        <div className="text-center py-8 text-red-500">{nError}</div>
      ) : sViewMode === 'table' ? (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th scope="col" className="table-head-cell">
                    {t('USER_ROLES_LIST.TABLE.ROLE_ID')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('USER_ROLES_LIST.TABLE.ROLE_NAME')}
                  </th>
                  <th scope="col" className="table-head-cell hidden sm:table-cell">
                    {t('USER_ROLES_LIST.TABLE.STORE_NAME')}
                  </th>
                  <th scope="col" className="table-head-cell">
                    {t('COMMON.STATUS')}
                  </th>
                  <th scope="col" className="table-head-cell text-center">
                    {t('COMMON.ACTIONS')}
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {(paginatedRoles).map((role) => (
                  <tr key={role.roleid || role.RoleID} className="table-row">
                    <td className="table-cell">
                      {role.roleid || role.RoleID}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="status-badge bg-blue-100 text-blue-800">
                          {role.rolename || role.RoleName}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      {role.storename || role.StoreName}
                    </td>
                    <td className="table-cell">
                     <span className={`status-badge ${role.status === 'Active'
                        ? 'status-active'
                        : 'status-inactive'
                        }`}>
                        {role.status || role.Status}
                      </span>
                    </td>
                    <td className="table-cell text-center font-medium align-middle">
                      <div className="flex justify-center items-center">
                        <ActionButtons
                          id={role.roleid || role.RoleID}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onMore={() => console.log('More options for', role)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {aRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <NotFoundMessage message={t('USER_ROLES_LIST.NO_ROLES_FOUND')} />
                    </td>
                  </tr>
                )}
                {aRoles.length > 0 && paginatedRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <NotFoundMessage message={t('USER_ROLES_LIST.NO_ROLES_ON_PAGE')} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aRoles.map((role) => (
            <div key={role.roleid || role.RoleID} className="bg-white shadow-md rounded-lg p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="status-badge bg-blue-100 text-blue-800">
                      {role.rolename || role.RoleName}
                    </span>
                  </div>
                  <p className="text-secondary">{t('USER_ROLES_LIST.TABLE.ROLE_ID')}: {role.roleid || role.RoleID}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${(role.status || role.Status) === t('COMMON.ACTIVE') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {role.status || role.Status}
                </span>
              </div>
              <div className="flex-grow text-base text-gray-700 mb-4">
                <p><strong>{t('USER_ROLES_LIST.TABLE.STORE_NAME')}:</strong> {role.storename || role.StoreName}</p>
              </div>
              <ActionButtons
                id={role.roleid || role.RoleID}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMore={() => console.log('More options for', role)}
              />
            </div>
          ))}
          {aRoles.length === 0 && (
            <NotFoundMessage message={t('USER_ROLES_LIST.NO_ROLES_FOUND')} />
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
    </div>
  );
};

export default UserRolesList;