import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPage } from './components/auth/AuthPage';
import { SystemOverviewSection } from './components/dashboard/Dashboard_Main';
import { MonitoringPage } from './components/monitoring/Monitoring_Main';
import { RevenuePage } from './components/revenue/Revenue_Main';
import { CustomerPage } from './components/customers/Customer_Main';
import { SettingsMain } from './components/settings/Settings_Main';
import { PersonnelMain } from './components/personnel/Personnel_Main';
import { SecurityMain } from './components/security/Security_Main';
import { LogsMain } from './components/logs/Logs_Main';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffGateControl } from './components/staff/StaffGateControl';
import { StaffPayment } from './components/staff/StaffPayment';
import StaffLayout from './components/layout/StaffLayout';
import { GlobalProvider } from './context/GlobalContext';

const ProtectedPage = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <MainLayout>
      {children}
    </MainLayout>
  </ProtectedRoute>
);

const StaffProtectedPage = ({ children }) => (
  <ProtectedRoute allowedRoles={['STAFF']}>
    <StaffLayout>
      {children}
    </StaffLayout>
  </ProtectedRoute>
);

// Helper component cho Driver Web App (Không cần MainLayout của Admin)
const DriverPage = ({ children }) => (
  <ProtectedRoute allowedRoles={['DRIVER']}>
    {children}
  </ProtectedRoute>
);

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('React Error Boundary caught an error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee2e2', color: '#991b1b', height: '100vh', width: '100vw', overflow: 'auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Hệ thống giao diện gặp lỗi (React Crash)</h1>
          <h2 style={{ fontSize: '16px', marginTop: '10px' }}>Vui lòng copy toàn bộ lỗi dưới đây gửi cho Agent:</h2>
          <pre style={{ background: '#fef2f2', padding: 15, borderRadius: 5, marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h3 style={{ fontSize: '16px', marginTop: '20px' }}>Component Stack:</h3>
          <pre style={{ background: '#fef2f2', padding: 15, borderRadius: 5, marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.info && this.state.info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const managementRoles = ['MANAGER', 'ADMIN'];

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <GlobalProvider>
          <Routes>
        {/* Public Route */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/overview" replace />} />
        
        {/* Nhóm Quản trị */}
        <Route path="/overview" element={
          <ProtectedPage allowedRoles={managementRoles}><SystemOverviewSection /></ProtectedPage>
        } />
        <Route path="/monitoring" element={
          <ProtectedPage allowedRoles={managementRoles}><MonitoringPage /></ProtectedPage>
        } />
        <Route path="/revenue" element={
          <ProtectedPage allowedRoles={['MANAGER', 'ADMIN']}><RevenuePage /></ProtectedPage>
        } />
        <Route path="/customers" element={
          <ProtectedPage allowedRoles={managementRoles}><CustomerPage /></ProtectedPage>
        } />
        <Route path="/staff" element={
          <ProtectedPage allowedRoles={managementRoles}><PersonnelMain /></ProtectedPage>
        } />
        <Route path="/security" element={
          <ProtectedPage allowedRoles={managementRoles}><SecurityMain /></ProtectedPage>
        } />
        <Route path="/settings" element={
          <ProtectedPage allowedRoles={managementRoles}><SettingsMain /></ProtectedPage>
        } />
        <Route path="/logs" element={
          <ProtectedPage allowedRoles={managementRoles}><LogsMain /></ProtectedPage>
        } />

        {/* Nhóm Nhân viên (Staff) */}
        <Route path="/staff-dashboard" element={
          <StaffProtectedPage><StaffDashboard /></StaffProtectedPage>
        } />
        <Route path="/staff-gate-control" element={
          <StaffProtectedPage><StaffGateControl /></StaffProtectedPage>
        } />
        <Route path="/staff-payment" element={
          <StaffProtectedPage><StaffPayment /></StaffProtectedPage>
        } />

        {/* Nhóm Khách hàng (Driver) */}
        <Route path="/driver" element={
          <DriverPage>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Giao diện Driver</h1>
              <p>Trang này đang được phát triển bởi Dev khác.</p>
            </div>
          </DriverPage>
        } />

        {/* Catch-all */}
        <Route path="*" element={
          <ProtectedPage allowedRoles={managementRoles}>
            <div className="flex flex-col items-center justify-center w-full h-full p-8">
              <h2 className="text-2xl font-bold text-gray-700">Tính năng đang phát triển</h2>
              <p className="text-gray-500 mt-2">Vui lòng quay lại sau.</p>
            </div>
          </ProtectedPage>
        } />
          </Routes>
        </GlobalProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App;
