import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { apiGet, apiPut, apiPatch, apiPost } from '../utils/ApiUtils.jsx';
import { STATUS } from '../contants/constants.jsx';
import { useTranslation } from 'react-i18next';
import {
   GET_ALL_ATTRIBUTES,
  GETALL_BRANDS,
  GETALL_CATEGORY,
  GET_All_COLORSAPI,
  ATTRIBUTE_TYPE,
  GET_ALL_ROLES_API,
  GET_ALL_STORES,
} from '../contants/apiRoutes';

const AllDataContext = createContext();
const aResourceConfigsStatic = [
  {
    key: 'attributes',
    api: GET_ALL_ATTRIBUTES,
    totalKey: 'totalRecords',
    idField: 'AttributeID',
  },
  {
    key: 'colors',
    api: GET_All_COLORSAPI,
    totalKey: 'totalRecords',
    idField: 'ColourID',
  },
  {
    key: 'attributeTypes',
    api: ATTRIBUTE_TYPE,
    totalKey: 'totalRecords',
    idField: 'AttributeTypeID',
  },
  {
    key: 'roles',
    api: GET_ALL_ROLES_API,
    totalKey: null,
    rolesPagination: true,
  },
  {
    key: 'stores',
    api: GET_ALL_STORES,
    totalKey: 'totalRecords',
  },
  {
    key: 'brands',
    api: GETALL_BRANDS,
    totalKey: 'totalRecords',
    idField: 'BrandID',
  },
  {
    key: 'categories',
    api: GETALL_CATEGORY,
    totalKey: 'totalRecords',
    idField: 'CategoryID',
  },
];


const updateStatusById = async (key, id, newStatus, apiRoute, idField, setState, t) => {
  try {
    const token = localStorage.getItem('token');
    const payload = { Status: newStatus ? 'Active' : 'Inactive' };
    const response = await apiPatch(`${apiRoute}/${id}`, payload, token);
    const backendMessage = response?.data?.MESSAGE || t('CONTEXT.STATUS_UPDATE_SUCCESS');
    if (response?.data?.STATUS === STATUS.SUCCESS.toUpperCase()) {
      setState(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          data: (prev[key]?.data || []).map(item => {
            const itemId = item[idField] || item[idField.toLowerCase()];
            if (itemId === id) {
              return { ...item, status: payload.Status, Status: payload.Status };
            }
            return item;
          })
        }
      }));
      return { status: STATUS.SUCCESS, message: backendMessage };
    } else {
      return { status: STATUS.ERROR, message: response?.data?.MESSAGE || t('CONTEXT.ERROR_UPDATING_STATUS') };
    }
  } catch (err) {
    return { status: STATUS.ERROR, message: t('COMMON.UNEXPECTED_ERROR') };
  }
};

export const AllDataProvider = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState({});
  const aResourceConfigs = useMemo(() => aResourceConfigsStatic, []);
  const fetchAll = useCallback(async (key, api, params = {}, totalKey, rolesPagination) => {
    setState(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        loading: true,
        error: null,
      },
    }));
    try {
      const token = localStorage.getItem('token');
      const filteredParams = { ...params };
      if (filteredParams.pageNumber === undefined) delete filteredParams.pageNumber;
      // Don't remove pageSize - let it be optional for the API
      const oResponse = await apiGet(api, filteredParams, token);
      let data = [];
      let total = 0;
      if (rolesPagination) {  
        if (
          oResponse.data &&
          (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase() || oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) &&
          oResponse.data.data &&
          oResponse.data.data.RolesPAginationData &&
          Array.isArray(oResponse.data.data.RolesPAginationData.data)
        ) {
          data = oResponse.data.data.RolesPAginationData.data;
          total = oResponse.data.data.RolesPAginationData.totalRecords || 0;
        }
      } else if (oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) {
        if (oResponse.data.data && Array.isArray(oResponse.data.data.data)) {
          data = oResponse.data.data.data;
          if (totalKey && oResponse.data.data[totalKey] !== undefined) {
            total = oResponse.data.data[totalKey];
          }
        } else {
          data = oResponse.data.data;
          if (totalKey && oResponse.data[totalKey] !== undefined) {
            total = oResponse.data[totalKey];
          } else if (totalKey && oResponse.data.data && oResponse.data.data[totalKey] !== undefined) {
            total = oResponse.data.data[totalKey];
          }
        }
      }
      setState(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          data,
          total,
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          loading: false,
          error: t('CONTEXT.ERROR_FETCHING_DATA'),
        },
      }));
    }
  }, [t]);


  const contextValue = useMemo(() => ({
    ...aResourceConfigs.reduce((acc, cfg) => {
      if (["colors", "attributes", "brands", "attributeTypes"].includes(cfg.key)) {
        acc[cfg.key] = {
          data: state[cfg.key]?.data || [],
          loading: !!state[cfg.key]?.loading,
          error: state[cfg.key]?.error || null,
          total: state[cfg.key]?.total || 0,
          fetch: (params = {}) => {
            const mappedParams = { ...params };
            if (params.page !== undefined) mappedParams.pageNumber = params.page;
            if (params.limit !== undefined) mappedParams.pageSize = params.limit;
            // Don't remove pageSize if it's not provided - let it be optional
            return fetchAll(cfg.key, cfg.api, mappedParams, cfg.totalKey, cfg.rolesPagination);
          },
          fetchAll: () => {
            // Fetch all data without pagination for dropdowns
            return fetchAll(cfg.key, cfg.api, {}, cfg.totalKey, cfg.rolesPagination);
          },
          updateStatusById: (id, newStatus, apiRoute, idField) => updateStatusById(cfg.key, id, newStatus, apiRoute, idField, setState, t),
        };
      } else {
        acc[cfg.key] = {
          data: state[cfg.key]?.data || [],
          loading: !!state[cfg.key]?.loading,
          error: state[cfg.key]?.error || null,
          total: state[cfg.key]?.total || 0,
          fetch: (params = {}) => fetchAll(cfg.key, cfg.api, params, cfg.totalKey, cfg.rolesPagination),
          fetchAll: () => {
            // Fetch all data without pagination for dropdowns
            return fetchAll(cfg.key, cfg.api, {}, cfg.totalKey, cfg.rolesPagination);
          },
          updateStatusById: (id, newStatus, apiRoute, idField) => updateStatusById(cfg.key, id, newStatus, apiRoute, idField, setState, t),
        };
      }
      return acc;
    }, {}),
  }), [state, fetchAll, aResourceConfigs, t]);

  return (
    <AllDataContext.Provider value={contextValue}>
      {children}
    </AllDataContext.Provider>
  );
};

export const useAttributes = () => useContext(AllDataContext).attributes;
export const useBrands = () => useContext(AllDataContext).brands;
export const useCategories = () => useContext(AllDataContext).categories;
export const useColors = () => useContext(AllDataContext).colors;
export const useAttributeTypes = () => useContext(AllDataContext).attributeTypes;
export const useRoles = () => useContext(AllDataContext).roles;
export const useStores = () => useContext(AllDataContext).stores;
export const useProducts = () => useContext(AllDataContext).products;
export const useUsers = () => useContext(AllDataContext).users; 