import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { SystemOverviewSection } from './components/dashboard/Dashboard_Main';
import { MonitoringPage } from './components/monitoring/Monitoring_Main';
import { RevenuePage } from './components/revenue/Revenue_Main';
import { CustomerPage } from './components/customers/Customer_Main';
import { SettingsMain } from './components/settings/Settings_Main';
// Helper component to wrap protected pages with MainLayout
const ProtectedPage = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <MainLayout>
      {children}
    </MainLayout>
  </ProtectedRoute>
);

// Helper component cho Driver Web App (Không cần MainLayout của Admin)
const DriverPage = ({ children }) => (
  <ProtectedRoute allowedRoles={['DRIVER']}>
    {children}
  </ProtectedRoute>
);

function App() {
  const managementRoles = ['MANAGER', 'ADMIN', 'STAFF'];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        <Route path="/settings" element={
          <ProtectedPage allowedRoles={managementRoles}><SettingsMain /></ProtectedPage>
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
    </BrowserRouter>
  )
}

export default App;
