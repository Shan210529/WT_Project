import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// --- AXIOS CONFIGURATION ---
// 1. Set base URL so you don't type http://localhost... every time
axios.defaults.baseURL = 'http://localhost:5000';

// 2. Automatically attach token to every request if it exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// 3. GLOBAL ERROR HANDLER (Fixes "Access without login")
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says "Unauthorized" (401), force logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Force redirect
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);