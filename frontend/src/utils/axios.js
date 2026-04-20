import axios from 'axios';

const defaultApiBaseURL = import.meta.env.MODE === 'development'
  ? 'http://localhost:4000'
  : 'https://train-reservation.onrender.com';

const defaultSocketURL = import.meta.env.MODE === 'development'
  ? 'http://localhost:4000'
  : 'https://train-reservation.onrender.com';

export const getApiBaseURL = () => import.meta.env.VITE_API_BASE_URL || defaultApiBaseURL;

export const getSocketURL = () => import.meta.env.VITE_SOCKET_URL || defaultSocketURL;

const axiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    if (!error.response) {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      config.headers.Authorization = `Bearer ${tokenData}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export default axiosInstance; 