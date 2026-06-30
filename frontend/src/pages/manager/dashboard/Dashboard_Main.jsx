import { useState, useEffect } from "react";
import { dashboardService } from '../../../services/dashboardService';
import { DatePicker, notification } from "antd";
import dayjs from "dayjs";
import { useGlobalContext } from '../../../context/GlobalContext';
import "./Dashboard_Main.css";

// Import UI Sections
import { SummaryCards } from "./Dashboard_SummaryCards";
import { RevenueChart } from "./Dashboard_RevenueChart";
import { VehicleDistribution } from "./Dashboard_VehicleDistribution";
import { TopEmployees } from "./Dashboard_TopEmployees";
import { SystemNotifications } from "./Dashboard_SystemNotifications";
import { ErrorState } from '../../../components/common/ErrorState';
import { PageLayout } from '../../../components/common/PageLayout';
import { TrophyOutlined, ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, DownloadOutlined } from "@ant-design/icons";

export const SystemOverviewSection = () => {
  const { searchValue, activeLocation } = useGlobalContext();
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
          type: alert.type,
          icon: alert.type === 'error' ? <ExclamationCircleOutlined className="text-[#ba1a1a] text-xl" /> : alert.type === 'warning' ? <WarningOutlined className="text-yellow-500 text-xl" /> : <InfoCircleOutlined className="text-blue-500 text-xl" />,
          containerClassName: alert.type === 'error' 
            ? "flex items-start gap-4 p-3 w-full bg-[#ffdad633] rounded border border-[#ba1a1a33]"
            : "flex items-start gap-4 p-3 w-full rounded border border-transparent",
          actionLabel: alert.actionText
        })));
        
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

  // Filter based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchValue.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notif => 
    notif.title.toLowerCase().includes(searchValue.toLowerCase()) || 
    notif.description.toLowerCase().includes(searchValue.toLowerCase())
  );

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
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f8fafc]/70 backdrop-blur-[1px]">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <PageLayout
        title="Tổng quan Hệ thống"
        subtitle="Dữ liệu cập nhật theo thời gian thực: 24/10/2023 14:30"
        actions={
          <>
            <DatePicker 
              defaultValue={dayjs()} 
              format="DD/MM/YYYY"
              allowClear={false}
              className="px-4 py-2 bg-white dark:bg-slate-800 rounded border border-[#c4c6cd] dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold text-[#1b1c1d] dark:text-slate-200 text-xs shadow-sm focus:outline-none focus:border-blue-500"
            />
            <button 
              className="gap-2 px-4 py-[9px] bg-[#1677ff] hover:bg-[#0058be] transition-colors rounded flex items-center focus:outline-none"
              onClick={() => {
                notification.success({ 
                  message: "Xuất báo cáo thành công", 
                  description: "Tệp báo cáo tổng quan hệ thống đã được tải xuống.", 
                  placement: "topRight" 
                });
              }}
            >
              <DownloadOutlined className="text-white" />
              <span className="font-bold text-white text-xs">Xuất báo cáo</span>
            </button>
          </>
        }
      >
        <SummaryCards data={summaryData} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="md:col-span-2">
            <RevenueChart />
          </div>
          <div className="md:col-span-1">
            <VehicleDistribution />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
          <TopEmployees employees={filteredEmployees} loading={loading} />
          <div id="system-notifications">
            <SystemNotifications notifications={filteredNotifications} loading={loading} />
          </div>
        </div>
      </PageLayout>
    </div>
  );
};
