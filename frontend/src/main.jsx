import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reception from './pages/Reception.jsx';
import Triage from './pages/Triage.jsx';
import Doctor from './pages/Doctor.jsx';
import Display from './pages/Display.jsx';
import Login from './pages/Login.jsx';
import App from './App.jsx'
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

<ToastContainer position="top-right" />




const Start = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <App />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Start />} />
          <Route path="dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="reception" element={
            <ProtectedRoute><Reception /></ProtectedRoute>
          } />
          <Route path="triage" element={
            <ProtectedRoute><Triage /></ProtectedRoute>
          } />
          <Route path="doctor" element={
            <ProtectedRoute><Doctor /></ProtectedRoute>
          } />
          <Route path="display" element={
            <ProtectedRoute><Display /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
