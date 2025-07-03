import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { apiGet, apiPut } from '../utils/ApiUtils.jsx';
import { STATUS } from '../contants/constants.jsx';
import { useTranslation } from 'react-i18next';
import {
  GET_ALL_ATTRIBUTES,
  GETALL_BRANDS,
  GETALL_CATEGORY,
  GET_All_COLORSAPI,
  AttributeType,
  GETALLROLESS_API,
  getAllStores,
  updateBrandById,
  updateCategoryById
} from '../contants/apiRoutes';

const AllDataContext = createContext();

const aResourceConfigs = [
  {
    key: 'attributes',
    api: GET_ALL_ATTRIBUTES,
    totalKey: null,
  },
  {
    key: 'brands',
    api: GETALL_BRANDS,
    totalKey: 'totalRecords',
    updateStatusApi: updateBrandById,
  },
  {
    key: 'categories',
    api: GETALL_CATEGORY,
    totalKey: 'totalRecords',
    updateStatusApi: updateCategoryById,
  },
  {
    key: 'colors',
    api: GET_All_COLORSAPI,
    totalKey: 'totalItems',
  },
  {
    key: 'attributeTypes',
    api: AttributeType,
    totalKey: 'totalCount',
  },
  {
    key: 'roles',
    api: GETALLROLESS_API,
    totalKey: null,
    rolesPagination: true,
  },
  {
    key: 'stores',
    api: getAllStores,
    totalKey: 'totalRecords',
  },
];

export const AllDataProvider = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState({});
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
      const oResponse = await apiGet(api, params, token);
      let data = [];
      let total = 0;
      if (rolesPagination) {
        if (
          oResponse.data &&
          (oResponse.data.status === STATUS.SUCCESS.toUpperCase() || oResponse.data.STATUS === STATUS.SUCCESS.toUpperCase()) &&
          oResponse.data.data &&
          oResponse.data.data.RolesPAginationData &&
          Array.isArray(oResponse.data.data.RolesPAginationData.data)
        ) {
          data = oResponse.data.data.RolesPAginationData.data;
          total = oResponse.data.data.RolesPAginationData.totalRecords || 0;
        }
      } else if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        data = oResponse.data.data;
        if (totalKey && oResponse.data[totalKey] !== undefined) {
          total = oResponse.data[totalKey];
        } else if (totalKey && oResponse.data.data && oResponse.data.data[totalKey] !== undefined) {
          total = oResponse.data.data[totalKey];
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

  const toggleStatus = useCallback(async (key, updateApi, id, newIsActive, fetchParams = {}) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { IsActive: newIsActive };
      const oResponse = await apiPut(`${updateApi}/${id}/status`, payload, token);
      if (oResponse.data.status === STATUS.SUCCESS.toUpperCase()) {
        const config = aResourceConfigs.find(c => c.key === key);
        if (config) {
          fetchAll(key, config.api, fetchParams, config.totalKey, config.rolesPagination);
        }
        return { status: STATUS.SUCCESS.toUpperCase() };
      } else {
        return { status: 'ERROR', message: oResponse.data.message || t('CONTEXT.ERROR_UPDATING_STATUS') };
      }
    } catch (err) {
      return { status: 'ERROR', message: t('COMMON.UNEXPECTED_ERROR') };
    }
  }, [fetchAll, t]);

  useEffect(() => {
    aResourceConfigs.forEach(cfg => {
      fetchAll(cfg.key, cfg.api, {}, cfg.totalKey, cfg.rolesPagination);
    });
  }, [fetchAll]);

  const contextValue = useMemo(() => ({
    ...aResourceConfigs.reduce((acc, cfg) => {
      acc[cfg.key] = {
        data: state[cfg.key]?.data || [],
        loading: !!state[cfg.key]?.loading,
        error: state[cfg.key]?.error || null,
        total: state[cfg.key]?.total || 0,
        fetch: (params = {}) => fetchAll(cfg.key, cfg.api, params, cfg.totalKey, cfg.rolesPagination),
      };
      if (cfg.updateStatusApi) {
        acc[cfg.key].toggleStatus = (id, newIsActive, fetchParams = {}) => toggleStatus(cfg.key, cfg.updateStatusApi, id, newIsActive, fetchParams);
      }
      return acc;
    }, {}),
  }), [state, fetchAll, toggleStatus]);

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