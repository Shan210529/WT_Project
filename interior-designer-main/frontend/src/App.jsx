import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DesignEditor from './pages/DesignEditor';

// Updated Protection Logic
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Check if token exists AND is not the string "undefined"
  if (!token || token === 'undefined') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/design/new" element={
            <ProtectedRoute>
              <DesignEditor />
            </ProtectedRoute>
          } 
        />

        <Route path="/design/:id" element={
            <ProtectedRoute>
              <DesignEditor />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;