import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
<<<<<<< HEAD
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

=======
>>>>>>> origin/main
import { SystemOverviewSection } from './components/dashboard/Dashboard_Main';
import { MonitoringPage } from './components/monitoring/Monitoring_Main';
import { RevenuePage } from './components/revenue/Revenue_Main';
import { CustomerPage } from './components/customers/Customer_Main';
<<<<<<< HEAD
// import { PersonnelMain } from './components/personnel/Personnel_Main';
import { SettingsMain } from './components/settings/Settings_Main';

// Helper component to wrap protected pages with MainLayout
const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>
      {children}
    </MainLayout>
  </ProtectedRoute>
);
=======
import { PersonnelMain } from './components/personnel/Personnel_Main';
import { SettingsMain } from './components/settings/Settings_Main';


>>>>>>> origin/main

function App() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/overview" replace />} />
        
        <Route path="/overview" element={
          <ProtectedPage><SystemOverviewSection /></ProtectedPage>
        } />
        
        <Route path="/monitoring" element={
          <ProtectedPage><MonitoringPage /></ProtectedPage>
        } />
        
        <Route path="/revenue" element={
          <ProtectedPage><RevenuePage /></ProtectedPage>
        } />
        
        {/* <Route path="/staff" element={<ProtectedPage><PersonnelMain /></ProtectedPage>} /> */}
        
        <Route path="/customers" element={
          <ProtectedPage><CustomerPage /></ProtectedPage>
        } />
        
        <Route path="/settings" element={<ProtectedPage><SettingsMain /></ProtectedPage>} />

        {/* Catch-all cho các chức năng chưa làm */}
        <Route path="*" element={
          <ProtectedPage>
=======
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<SystemOverviewSection />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/staff" element={<PersonnelMain />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/settings" element={<SettingsMain />} />
          {/* Catch-all cho các chức năng chưa làm */}
          <Route path="*" element={
>>>>>>> origin/main
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
