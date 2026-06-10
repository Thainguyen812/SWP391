import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import icon2 from "../../assets/icons/icon-2.svg";
import icon3 from "../../assets/icons/icon-3.svg";
import icon10 from "../../assets/icons/icon-10.svg";
import icon11 from "../../assets/icons/icon-11.svg";
import icon12 from "../../assets/icons/icon-12.svg";
import icon13 from "../../assets/icons/icon-13.svg";
import "./SystemOverview.css";

// Import UI Sections
import { SummaryCards } from "./sections/SummaryCards";
import { RevenueChart } from "./sections/RevenueChart";
import { VehicleDistribution } from "./sections/VehicleDistribution";
import { TopEmployees } from "./sections/TopEmployees";
import { SystemNotifications } from "./sections/SystemNotifications";

export const SystemOverviewSection = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
          highlight: staff.rank === 1 ? { icon: icon10, label: "TOP 1" } : null,
          avatarClassName: index === 0 ? "bg-[#d2e4fb]" : "bg-[#efedef]",
          initialClassName: index === 0 ? "text-[#041627]" : "text-[#44474c]",
        })));

        setNotifications(alerts.map(alert => ({
          title: alert.title,
          description: alert.description,
          time: alert.time,
          icon: alert.type === 'error' ? icon11 : alert.type === 'warning' ? icon12 : icon13,
          iconClassName: alert.type === 'warning' ? "w-[22px] h-[19px]" : "w-5 h-5",
          containerClassName: alert.type === 'error' 
            ? "flex items-start gap-4 p-3 w-full bg-[#ffdad633] rounded border border-[#ba1a1a33]"
            : "flex items-start gap-4 p-3 w-full rounded border border-transparent",
          actionLabel: alert.actionText
        })));
        
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="system-overview-container">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f8fafc]/70 backdrop-blur-[1px]">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header */}
      <header className="system-overview-header">
        <div className="flex flex-col gap-1">
          <h2 className="system-overview-title">Tổng quan Hệ thống</h2>
          <p className="system-overview-subtitle">Dữ liệu cập nhật theo thời gian thực: 24/10/2023 14:30</p>
        </div>
        <div className="system-overview-header-actions">
          <button className="gap-2 px-4 py-2 bg-[#efedef] rounded border border-[#c4c6cd] flex items-center focus:outline-none hover:bg-gray-200 transition-colors">
            <img className="w-[10.5px] h-[11.67px]" alt="calendar" src={icon2} />
            <span className="font-bold text-[#1b1c1d] text-xs">Hôm nay</span>
          </button>
          <button className="gap-2 px-4 py-[9px] bg-[#2170e4] hover:bg-[#1a5bb8] transition-colors rounded flex items-center focus:outline-none">
            <img className="w-[9.33px] h-[9.33px]" alt="export" src={icon3} />
            <span className="font-bold text-white text-xs">Xuất báo cáo</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6 w-full pb-8">
        <SummaryCards data={summaryData} />
        
        <div className="grid grid-cols-3 gap-6 w-full">
          <RevenueChart />
          <VehicleDistribution />
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          <TopEmployees employees={employees} loading={loading} />
          <SystemNotifications notifications={notifications} loading={loading} />
        </div>
      </div>
    </section>
  );
};
