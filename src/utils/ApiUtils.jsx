import axios from 'axios';
import { BASE_URL } from '../contants/apiRoutes';
// Create axios instance with optional token
const oCreateApiInstance = (token, isFormData) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // only add token if it exists
    },
  });
};

// GET request
export const apiGet = async (endpoint, oParams = {}, token = null) => {
  const api = oCreateApiInstance(token);
  const oResponse = await api.get(endpoint, {params : oParams });
  return oResponse;
};

// POST request with response type support
export const apiPost = async (endpoint, data, token = null, isFormData = false, responseType = 'json') => {
  const api = oCreateApiInstance(token, isFormData);
  const oResponse = await api.post(endpoint, data, { responseType });
  return oResponse;
};

// PUT request
export const apiPut = async (endpoint, data, token = null, isFormData = false) => {
  const api = oCreateApiInstance(token, isFormData);
  const oResponse = await api.put(endpoint, data);
  return oResponse;
};

// PATCH request
export const apiPatch = async (endpoint, data, token = null, isFormData = false) => {
  const api = oCreateApiInstance(token, isFormData);
  const oResponse = await api.patch(endpoint, data);
  return oResponse;
};

// DELETE request
export const apiDelete = async (endpoint, token = null) => {
  const api = oCreateApiInstance(token);
  const oResponse = await api.delete(endpoint);
  return oResponse;
};
