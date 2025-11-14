// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reception from './pages/Reception.jsx';
import Triage from './pages/Triage.jsx';
import Doctor from './pages/Doctor.jsx';
import Display from './pages/Display.jsx';
import Users from './pages/Users.jsx';
import ProtectedRoute from './layouts/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reception" element={<Reception />} />
          <Route path="triage" element={<Triage />} />
          <Route path="doctor" element={<Doctor />} />
          <Route path="display" element={<Display />} />
          <Route path="users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer position="top-right" />
    </BrowserRouter>
  );
}
