import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPage } from './components/auth/AuthPage';
import { authService } from './services/authService';
import { SystemOverviewSection } from './components/manager/dashboard/Dashboard_Main';
import { MonitoringPage } from './components/manager/monitoring/Monitoring_Main';
import { RevenuePage } from './components/manager/revenue/Revenue_Main';
import { CustomerPage } from './components/manager/customers/Customer_Main';
import { SettingsMain } from './components/manager/settings/Settings_Main';
import { PersonnelMain } from './components/manager/personnel/Personnel_Main';
import { SecurityMain } from './components/manager/security/Security_Main';
import { LogsMain } from './components/manager/logs/Logs_Main';
import { HandoverMain } from './components/manager/handover/Handover_Main';
import { SupportMain } from './components/manager/support/Support_Main';
import { TransactionHistory } from './components/manager/transactions/TransactionHistory';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffGateControl } from './components/staff/StaffGateControl';
import { StaffPayment } from './components/staff/StaffPayment';
import { StaffMonitoring } from './components/staff/StaffMonitoring';
import { StaffSecurityAlerts } from './components/staff/StaffSecurityAlerts';
import { StaffLostCard } from './components/staff/StaffLostCard';
import { StaffSettings } from './components/staff/StaffSettings';
import { StaffSupport } from './components/staff/StaffSupport';
import StaffLayout from './components/layout/StaffLayout';
import { DriverPwa } from './components/driver/DriverPwa';
import { Dashboard as LegacyDashboard } from './components/driver/Dashboard';
import { useNavigate } from 'react-router-dom';
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

const LegacyAdminWrapper = () => {
  const navigate = useNavigate();
  const rawUser = authService.getUser();
  const currentUser = rawUser 
    ? { name: rawUser.fullName || rawUser.username, phone: rawUser.username, role: rawUser.role }
    : { name: 'Admin', phone: '0901234567', role: 'ADMIN' };
  
  return (
    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
      <LegacyDashboard 
        user={currentUser}
        accessToken="mock-access"
        onLogout={() => {
          authService.logout();
          navigate('/login');
        }}
      />
    </ProtectedRoute>
  );
};

const RootRedirect = () => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'DRIVER') {
    return <Navigate to="/driver" replace />;
  } else if (user.role === 'STAFF') {
    return <Navigate to="/staff-dashboard" replace />;
  } else {
    return <Navigate to="/admin" replace />;
  }
};

const DriverAppWrapper = () => {
  const user = authService.getUser() || { 
    username: 'driver', 
    fullName: 'Tài xế', 
    role: 'DRIVER',
    email: 'driver@urbanpark.com',
    phone: '0912345678'
  };
  const navigate = useNavigate();
  
  return (
    <DriverPwa 
      user={{ 
        phone: user.phone || user.username, 
        name: user.fullName, 
        role: user.role,
        email: user.email
      }}
      accessToken={localStorage.getItem('token')}
      onLogout={() => {
        authService.logout();
        navigate('/login');
      }}
    />
  );
};

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
        <Route path="/" element={<RootRedirect />} />
        <Route path="/admin" element={<LegacyAdminWrapper />} />

        {/* Protected Routes */}
        
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
        <Route path="/transactions" element={
          <ProtectedPage allowedRoles={managementRoles}><TransactionHistory /></ProtectedPage>
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
        <Route path="/handover" element={
            <ProtectedPage allowedRoles={managementRoles}><HandoverMain /></ProtectedPage>
          } />
        <Route path="/support" element={
            <ProtectedPage allowedRoles={managementRoles}><SupportMain /></ProtectedPage>
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
        <Route path="/staff-monitoring" element={
          <StaffProtectedPage><StaffMonitoring /></StaffProtectedPage>
        } />
        <Route path="/staff-security" element={
          <StaffProtectedPage><StaffSecurityAlerts /></StaffProtectedPage>
        } />
        <Route path="/staff-lost-card" element={
          <StaffProtectedPage><StaffLostCard /></StaffProtectedPage>
        } />
        <Route path="/staff-transactions" element={<StaffProtectedPage><TransactionHistory /></StaffProtectedPage>} />
        <Route path="/staff-settings" element={<StaffProtectedPage><StaffSettings /></StaffProtectedPage>} />
        <Route path="/staff-support" element={<StaffProtectedPage><StaffSupport /></StaffProtectedPage>} />

        {/* Nhóm Khách hàng (Driver) */}
        <Route path="/driver" element={
          <DriverPage>
            <DriverAppWrapper />
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
