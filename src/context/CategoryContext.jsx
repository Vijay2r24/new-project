import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiGet, apiPut } from '../utils/ApiUtils.jsx';
import { GETALL_CATEGORY, updateCategoryById } from '../contants/apiRoutes';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [aCategories, setCategories] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [iTotalItems, setTotalItems] = useState(0);

  const fetchCategories = useCallback(async (pageNumber = 1, pageSize = 10, searchText = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber,
        pageSize,
        searchText,
      };
      const response = await apiGet(GETALL_CATEGORY, params, token);
      if (response.data.status === 'SUCCESS') {
        setCategories(response.data.data);           // lowercase "data"
        setTotalItems(response.data.totalRecords);   // correct key name
      } else {
        setError(response.data.message || 'Failed to fetch categories');
      }

    } catch (err) {
      setError('An error occurred while fetching categories.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCategoryStatus = useCallback(async (categoryId, newIsActive) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { IsActive: newIsActive };
      const response = await apiPut(`${updateCategoryById}/${categoryId}/status`, payload, token);
      if (response.data.status === 'SUCCESS') {
        fetchCategories(); // Re-fetch categories to get updated status
        return { status: 'SUCCESS' };
      } else {
        return { status: 'ERROR', message: response.data.message || 'Failed to update category status' };
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
      return { status: 'ERROR', message: 'An unexpected error occurred.' };
    }
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider value={{ aCategories, bLoading, sError, fetchCategories, iTotalItems, toggleCategoryStatus }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext); 