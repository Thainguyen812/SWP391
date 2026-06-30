import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPage } from './pages/auth/AuthPage';
import { authService } from './services/authService';
import { SystemOverviewSection } from './pages/manager/dashboard/Dashboard_Main';
import { MonitoringPage } from './pages/manager/monitoring/Monitoring_Main';
import { RevenuePage } from './pages/manager/revenue/Revenue_Main';
import { CustomerPage } from './pages/manager/customers/Customer_Main';
import { SettingsMain } from './pages/manager/settings/Settings_Main';
import { PersonnelMain } from './pages/manager/personnel/Personnel_Main';
import { SecurityMain } from './pages/manager/security/Security_Main';
import { LogsMain } from './pages/manager/logs/Logs_Main';
import { HandoverMain } from './pages/manager/handover/Handover_Main';
import { SupportMain } from './pages/manager/support/Support_Main';
import { TransactionHistory } from './pages/manager/transactions/TransactionHistory';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffGateControl } from './pages/staff/StaffGateControl';
import { StaffPayment } from './pages/staff/StaffPayment';
import { StaffMonitoring } from './pages/staff/StaffMonitoring';
import { StaffSecurityAlerts } from './pages/staff/StaffSecurityAlerts';
import { StaffLostCard } from './pages/staff/StaffLostCard';
import { StaffSettings } from './pages/staff/StaffSettings';
import { StaffSupport } from './pages/staff/StaffSupport';
import StaffLayout from './components/layout/StaffLayout';
import { DriverLayout } from './pages/driver/DriverLayout';
import { DriverDashboardPanel } from './pages/driver/DriverDashboardPanel';
import { DriverHome } from './pages/driver/DriverHome';
import { DriverVehicles } from './pages/driver/DriverVehicles';
import { DriverVipReg } from './pages/driver/DriverVipReg';
import { DriverBilling } from './pages/driver/DriverBilling';
import { DriverSettings } from './pages/driver/DriverSettings';
import { DriverSupport } from './pages/driver/DriverSupport';

import { Dashboard as LegacyDashboard } from './pages/admin/AdminDashboard';
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
  const user = authService.getUser() || { username: 'driver', fullName: 'Tài xế', role: 'DRIVER' };
  const navigate = useNavigate();
  
  return (
    <DriverLayout 
      user={{ phone: user.username, name: user.fullName, role: user.role }}
      accessToken={localStorage.getItem('token')}
      onLogout={() => {
        authService.logout();
        navigate('/login');
      }}
    />
  );
};

import React from 'react';


function App() {
  const managementRoles = ['MANAGER', 'ADMIN'];

  return (
    <BrowserRouter>
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
        <Route path="/driver" element={<DriverPage><DriverAppWrapper /></DriverPage>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="panel" element={<DriverDashboardPanel />} />
          <Route path="home" element={<DriverHome />} />
          <Route path="vehicles" element={<DriverVehicles />} />
          <Route path="vip" element={<DriverVipReg />} />
          <Route path="billing" element={<DriverBilling />} />
          <Route path="settings" element={<DriverSettings />} />
          <Route path="support" element={<DriverSupport />} />
        </Route>

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
    </BrowserRouter>
  )
}

export default App;
