import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StorefrontLayout } from '../layouts/StorefrontLayout';
import { AdminApp } from '../AdminApp';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 🛒 Public Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />} />
      <Route path="/cart" element={<StorefrontLayout />} />

      {/* 🔐 Exact Native Dinora Admin Dashboard from Frontend */}
      <Route path="/adminpanel" element={<AdminApp />} />
      <Route path="/adminpanel/*" element={<AdminApp />} />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
