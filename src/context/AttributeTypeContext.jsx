import  { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { apiGet } from '../utils/ApiUtils.jsx';
import { AttributeType } from '../contants/apiRoutes';

const AttributeTypeContext = createContext();

export const AttributeTypeProvider = ({ children }) => {
  const [aAttributeTypes, setAttributeTypes] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);
  const [iTotalItems, setTotalItems] = useState(0);

  const fetchAttributeTypes = useCallback(async (pageNumber = 1, pageSize = 10, searchText = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = {
        pageNumber,
        pageSize,
        searchText,
      };
      const response = await apiGet(AttributeType, params, token);
      if (response.data.status === 'SUCCESS') {
        setAttributeTypes(response.data.data);
        setTotalItems(response.data.totalCount); // Assuming API returns totalCount
      } else {
        setError(response.data.message || 'Failed to fetch attribute types');
      }
    } catch (err) {
      setError('An error occurred while fetching attribute types.');
      console.error('Error fetching attribute types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttributeTypes();
  }, [fetchAttributeTypes]);

  return (
    <AttributeTypeContext.Provider value={{ aAttributeTypes, bLoading, sError, fetchAttributeTypes, iTotalItems }}>
      {children}
    </AttributeTypeContext.Provider>
  );
};

export const useAttributeTypes = () => useContext(AttributeTypeContext);
