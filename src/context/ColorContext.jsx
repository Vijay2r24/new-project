import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiGet} from '../utils/ApiUtils.jsx';
import { GET_All_COLORSAPI} from '../contants/apiRoutes';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [aColors, setColors] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [iTotalItems, setTotalItems] = useState(0);

  const fetchColors = useCallback(async (pageNumber = 1, pageSize = 10, searchText = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber,
        pageSize,
        searchText,
      };
      const response = await apiGet(GET_All_COLORSAPI, params, token);
      if (response.data.status === 'SUCCESS') {
        setColors(response.data.data);
        setTotalItems(response.data.totalItems); // Assuming API returns totalCount
      } else {
        setError(response.data.message || 'Failed to fetch colors');
      }
    } catch (err) {
      setError('An error occurred while fetching colors.');
      console.error('Error fetching colors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return (
    <ColorContext.Provider value={{ aColors, bLoading, sError, fetchColors, iTotalItems }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => useContext(ColorContext); 