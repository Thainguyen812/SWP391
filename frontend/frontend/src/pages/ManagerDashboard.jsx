import MainLayout from "../components/layout/MainLayout";
import { SystemOverviewSection } from "../components/dashboard/SystemOverview";

const ManagerDashboard = () => {
  return (
    <MainLayout>
      <SystemOverviewSection />
    </MainLayout>
  );
};

export default ManagerDashboard;
