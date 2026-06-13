import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import { BlueprintViewer } from "./Monitoring_Blueprint";
import { ParkingStatusCard } from "./Monitoring_Status";
import { ActivityLogCard } from "./Monitoring_Activity";
import { ErrorState } from "../common/ErrorState";
import { PageLayout } from "../common/PageLayout";

export const MonitoringPage = () => {
  const [branch, setBranch] = useState("HQ");
  const [floor, setFloor] = useState("B1");
  const [status, setStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statusData, activitiesData] = await Promise.all([
          dashboardService.getMonitoringStatus(branch, floor),
          dashboardService.getRecentActivities(branch, floor)
        ]);
        
        setStatus(statusData);
        setActivities(activitiesData);
        setError(null);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu giám sát:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend hoặc bật Mock API.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Giả lập Real-time update mỗi 10 giây (Tùy chọn)
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [branch, floor]);

  if (error) {
    return (
      <ErrorState 
        title="Lỗi kết nối dữ liệu"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <PageLayout
      title="Giám sát thời gian thực"
      subtitle="Theo dõi trạng thái bãi đỗ xe và các hoạt động đang diễn ra"
      actions={
        <div className="flex items-center gap-2 mr-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Trực tuyến</span>
        </div>
      }
    >
      <div className="flex gap-6 w-full h-[calc(100vh-200px)] min-h-[600px]">
        {/* Cột Trái (Sơ đồ) - Chiếm 70% */}
        <div className="flex-grow w-[70%] h-full">
          <BlueprintViewer 
            selectedBranch={branch} 
            onChangeBranch={setBranch}
            selectedFloor={floor}
            onChangeFloor={setFloor}
          />
        </div>

        {/* Cột Phải (Thống kê) - Chiếm 30% */}
        <div className="flex flex-col gap-6 w-[30%] h-full min-w-[300px]">
          <ParkingStatusCard status={status} loading={loading} />
          <div className="flex-1 overflow-hidden flex flex-col">
            <ActivityLogCard activities={activities} loading={loading} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
