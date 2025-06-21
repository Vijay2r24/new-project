import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiGet } from '../utils/ApiUtils';
import { getAllStores } from '../contants/apiRoutes';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [aStores, setStores] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [iTotalItems, setTotalItems] = useState(0);

  const fetchStores = useCallback(async (pageNumber = 1, pageSize = 1000, searchText = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const params = {
        pageNumber,
        pageSize,
        searchText,
      };
      const response = await apiGet(getAllStores, params, token);
      if (response.data.status === 'SUCCESS') {
        setStores(response.data.data);
        setTotalItems(response.data.totalRecords);
      } else {
        setError(response.data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      setError('An error occurred while fetching stores.');
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <StoreContext.Provider value={{ aStores, bLoading, sError, fetchStores, iTotalItems }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStores = () => useContext(StoreContext); 