import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import { CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
<<<<<<< HEAD
import "./Dashboard_Main.css";
=======
import "./SystemOverview.css";
import "./SystemOverview.css";
>>>>>>> origin/main

// Import UI Sections
import { SummaryCards } from "./Dashboard_SummaryCards";
import { RevenueChart } from "./Dashboard_RevenueChart";
import { VehicleDistribution } from "./Dashboard_VehicleDistribution";
import { TopEmployees } from "./Dashboard_TopEmployees";
<<<<<<< HEAD
import { SystemNotifications } from "./Dashboard_SystemNotifications";
import { ErrorState } from "../common/ErrorState";
=======
import { SystemNotifications } from "./Dashboard_Notifications";
import { ErrorState } from "../common/ErrorState";
import { PageLayout } from "../common/PageLayout";
>>>>>>> origin/main
import { TrophyOutlined, ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined } from "@ant-design/icons";

export const SystemOverviewSection = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summary, topStaff, alerts] = await Promise.all([
          dashboardService.getSummaryStats(),
          dashboardService.getTopStaff(),
          dashboardService.getSystemAlerts()
        ]);
        
        setSummaryData(summary);
        
        setEmployees(topStaff.map((staff, index) => ({
          initial: staff.initial,
          name: staff.name,
          role: staff.location,
          count: staff.count + " lượt",
          highlight: staff.rank === 1 ? { icon: <TrophyOutlined className="text-yellow-500" />, label: "TOP 1" } : null,
          avatarClassName: index === 0 ? "bg-[#d2e4fb]" : "bg-[#efedef]",
          initialClassName: index === 0 ? "text-[#041627]" : "text-[#44474c]",
        })));

        setNotifications(alerts.map(alert => ({
          title: alert.title,
          description: alert.description,
          time: alert.time,
          icon: alert.type === 'error' ? <ExclamationCircleOutlined className="text-[#ba1a1a] text-xl" /> : alert.type === 'warning' ? <WarningOutlined className="text-yellow-500 text-xl" /> : <InfoCircleOutlined className="text-blue-500 text-xl" />,
          containerClassName: alert.type === 'error' 
            ? "flex items-start gap-4 p-3 w-full bg-[#ffdad633] rounded border border-[#ba1a1a33]"
            : "flex items-start gap-4 p-3 w-full rounded border border-transparent",
          actionLabel: alert.actionText
        })));
        
        setNotifications(alerts);
        setError(null);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend hoặc bật Mock API.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
<<<<<<< HEAD
    <section className="system-overview-container dark:bg-slate-900 transition-colors">
=======
    <div className="relative h-full w-full">
>>>>>>> origin/main
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f8fafc]/70 backdrop-blur-[1px]">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

<<<<<<< HEAD
      {/* Header */}
      <header className="system-overview-header">
        <div className="flex flex-col gap-1">
          <h2 className="system-overview-title">Tổng quan Hệ thống</h2>
          <p className="system-overview-subtitle">Dữ liệu cập nhật theo thời gian thực: 24/10/2023 14:30</p>
        </div>
        <div className="system-overview-header-actions">
          <button className="gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded border border-[#c4c6cd] dark:border-slate-600 flex items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <CalendarOutlined className="text-[#64748b] dark:text-slate-400" />
            <span className="font-bold text-[#1b1c1d] dark:text-slate-200 text-xs">Hôm nay</span>
          </button>
          <button className="gap-2 px-4 py-[9px] bg-[#1677ff] hover:bg-[#0058be] transition-colors rounded flex items-center focus:outline-none">
            <DownloadOutlined className="text-white" />
            <span className="font-bold text-white text-xs">Xuất báo cáo</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6 w-full pb-8">
=======
      <PageLayout
        title="Tổng quan Hệ thống"
        subtitle="Dữ liệu cập nhật theo thời gian thực: 24/10/2023 14:30"
        actions={
          <>
            <button className="gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded border border-[#c4c6cd] dark:border-slate-600 flex items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <CalendarOutlined className="text-[#64748b] dark:text-slate-400" />
              <span className="font-bold text-[#1b1c1d] dark:text-slate-200 text-xs">Hôm nay</span>
            </button>
            <button className="gap-2 px-4 py-[9px] bg-[#1677ff] hover:bg-[#0058be] transition-colors rounded flex items-center focus:outline-none">
              <DownloadOutlined className="text-white" />
              <span className="font-bold text-white text-xs">Xuất báo cáo</span>
            </button>
          </>
        }
      >
>>>>>>> origin/main
        <SummaryCards data={summaryData} />
        
        <div className="grid grid-cols-3 gap-6 w-full">
          <RevenueChart />
          <VehicleDistribution />
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          <TopEmployees employees={employees} loading={loading} />
          <div id="system-notifications">
            <SystemNotifications notifications={notifications} loading={loading} />
          </div>
        </div>
<<<<<<< HEAD
      </div>
    </section>
=======
      </PageLayout>
    </div>
>>>>>>> origin/main
  );
};
