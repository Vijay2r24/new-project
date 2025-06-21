import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiGet, apiPut } from '../utils/ApiUtils.jsx';
import { GETALL_BRANDS, updateBrandById } from '../contants/apiRoutes';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [aBrands, setBrands] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [iTotalItems, setTotalItems] = useState(0);

  const fetchBrands = useCallback(async (pageNumber = 1, pageSize = 10, searchText = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber,
        pageSize,
        searchText,
      };
      const response = await apiGet(GETALL_BRANDS, params, token);
      if (response.data.status === 'SUCCESS') {
        setBrands(response.data.data);
        setTotalItems(response.data.totalRecords); // Correct key from API
      } else {
        setError(response.data.message || 'Failed to fetch brands');
      }

    } catch (err) {
      setError('An error occurred while fetching brands.');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBrandStatus = useCallback(async (brandId, newIsActive) => {
    try {
      const token = localStorage.getItem("token");
      const payload = { IsActive: newIsActive };
      const response = await apiPut(`${updateBrandById}/${brandId}/status`, payload, token);
      if (response.data.status === 'SUCCESS') {
        fetchBrands();
        return { status: 'SUCCESS' };
      } else {
        return { status: 'ERROR', message: response.data.message || 'Failed to update brand status' };
      }
    } catch (err) {
      console.error('Error toggling brand status:', err);
      return { status: 'ERROR', message: 'An unexpected error occurred.' };
    }
  }, [fetchBrands]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <BrandContext.Provider value={{ aBrands, bLoading, sError, fetchBrands, iTotalItems, toggleBrandStatus }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = () => useContext(BrandContext); 