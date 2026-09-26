const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('landstack_jwt');
export const setAuthToken = (token) => localStorage.setItem('landstack_jwt', token);
export const removeAuthToken = () => localStorage.removeItem('landstack_jwt');

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    throw error;
  }

  return data;
};
