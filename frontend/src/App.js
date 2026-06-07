import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import StaffDashboard from './components/StaffDashboard';

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard/>} />
        <Route path="/manager" element={<ManagerDashboard/>} />
        <Route path="/staff" element={<StaffDashboard/>} />
        <Route path="/" element={<div>Welcome to Parking Management System</div>} />
      </Routes>
    </BrowserRouter>
  );
}
