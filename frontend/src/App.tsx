import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Customers from './pages/Customers';
import Products from './pages/Products';
import Challans from './pages/Challans';
import Users from './pages/Users';

import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/challans" element={<Challans />} />
              <Route path="/users" element={<Users />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
