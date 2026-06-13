import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { SystemOverviewSection } from './components/dashboard/Dashboard_Main';
import { MonitoringPage } from './components/monitoring/Monitoring_Main';
import { RevenuePage } from './components/revenue/Revenue_Main';
import { CustomerPage } from './components/customers/Customer_Main';
import { PersonnelMain } from './components/personnel/Personnel_Main';
import { SettingsMain } from './components/settings/Settings_Main';



function App() {
  return (
    <BrowserRouter>
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
            <div className="flex flex-col items-center justify-center w-full h-full p-8">
              <h2 className="text-2xl font-bold text-gray-700">Tính năng đang phát triển</h2>
              <p className="text-gray-500 mt-2">Vui lòng quay lại sau.</p>
            </div>
          } />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
