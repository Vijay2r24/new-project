import axios from 'axios';

// Your backend base URL
const BASE_URL = 'https://httpbin.org'; // CHANGE THIS TO YOUR ACTUAL BACKEND URL

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
  const oResponse = await api.get(endpoint, { oParams });
  return oResponse;
};

// POST request
export const apiPost = async (endpoint, data, token = null, isFormData) => {
  const api = oCreateApiInstance(token, isFormData);
  const oResponse = await api.post(endpoint, data);
  return oResponse;
};

// PUT request
export const apiPut = async (endpoint, data, token = null, isFormData = false) => {
  const api = oCreateApiInstance(token, isFormData);
  const oResponse = await api.put(endpoint, data);
  return oResponse;
};

// DELETE request
export const apiDelete = async (endpoint, token = null) => {
  const api = oCreateApiInstance(token);
  const oResponse = await api.delete(endpoint);
  return oResponse;
};
