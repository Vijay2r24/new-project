import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiGet } from '../utils/ApiUtils';
import { GETALLROLESS_API } from '../contants/apiRoutes';

const RolesContext = createContext();

export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const fetchRoles = useCallback(async ({ pageNumber = 1, pageSize = 10, searchText = '', t }) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await apiGet(
        GETALLROLESS_API,
        { pageNumber, pageSize, searchText },
        token
      );
      if (
        response.data &&
        response.data.status === 'SUCCESS' &&
        response.data.rolesPaginationData &&
        Array.isArray(response.data.rolesPaginationData.data)
      ) {
        setRoles(response.data.rolesPaginationData.data);
        setTotalPages(response.data.rolesPaginationData.totalPages || 1);
        setTotalRecords(response.data.rolesPaginationData.totalRecords || 0);
      } else {
        setRoles([]);
        setError(response.data?.message || (t && t('common.failedOperation')));
      }
    } catch (err) {
      setRoles([]);
      setError(t ? t('common.failedOperation') : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RolesContext.Provider value={{
      roles,
      loading,
      error,
      totalPages,
      totalRecords,
      fetchRoles,
    }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => useContext(RolesContext); 