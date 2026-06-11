import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import { BlueprintViewer } from "./BlueprintViewer";
import { ParkingStatusCard } from "./ParkingStatusCard";
import { ActivityLogCard } from "./ActivityLogCard";

export const MonitoringPage = () => {
  const [branch, setBranch] = useState("HQ");
  const [floor, setFloor] = useState("B1");
  const [status, setStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Lỗi lấy dữ liệu giám sát:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Giả lập Real-time update mỗi 10 giây (Tùy chọn)
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [branch, floor]);

  return (
    <section className="flex flex-col w-full h-full p-6 pb-8 gap-6">
      {/* Header riêng của trang Giám sát */}
      <header className="flex-between w-full pb-4 border-b border-[#e9e7e9]">
        <h1 className="text-h2 text-[#041627]">Giám sát bãi xe thời gian thực</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-body text-[#44474c]">Hệ thống:</span>
            <span className="text-body-strong text-[#041627] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              Hoạt động
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Grid 2 cột */}
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
    </section>
  );
};
