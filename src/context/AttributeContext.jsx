import { createContext, useState, useEffect, useContext } from 'react';
import { apiGet } from '../utils/ApiUtils.jsx';
import { GET_ALL_ATTRIBUTES } from '../contants/apiRoutes.jsx';

const AttributeContext = createContext();

export const AttributeProvider = ({ children }) => {
  const [aAttributes, setAttributes] = useState([]);
  const [bLoading, setLoading] = useState(true);
  const [sError, setError] = useState(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await apiGet(GET_ALL_ATTRIBUTES, {}, token);
        if (response.data.status === 'SUCCESS') {
          setAttributes(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch attributes');
        }
      } catch (err) {
        setError('An error occurred while fetching attributes.');
        console.error('Error fetching attributes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttributes();
  }, []);

  return (
    <AttributeContext.Provider value={{ aAttributes, bLoading, sError }}>
      {children}
    </AttributeContext.Provider>
  );
};

export const useAttributes = () => useContext(AttributeContext); 