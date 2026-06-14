import { useState, useEffect } from "react";
import { DownloadOutlined, CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { dashboardService } from "../../services/dashboardService";
import { RevenueSummaryCards } from "./RevenueSummaryCards";
import { RevenueCharts } from "./RevenueCharts";
import { RecentTransactions } from "./RecentTransactions";
import { ErrorState } from "../common/ErrorState";

export const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [sumRes, chartsRes, transRes] = await Promise.all([
          dashboardService.getRevenueSummary(),
          dashboardService.getRevenueCharts(),
          dashboardService.getRevenueTransactions()
        ]);
        
        setSummary(sumRes);
        setCharts(chartsRes);
        setTransactions(transRes);
        setError(null);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu doanh thu:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend hoặc bật Mock API.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <section className="flex flex-col w-full h-full p-6 pb-8 gap-6 bg-[#f8fafc] dark:bg-slate-900 overflow-y-auto transition-colors">
      {/* Header riêng của trang Doanh thu */}
      <header className="flex-between w-full pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 text-[#041627] dark:text-slate-100 transition-colors">Báo cáo Doanh thu</h1>
          <p className="text-body text-[#64748b] dark:text-slate-400 transition-colors">Phân tích dòng tiền và hiệu suất hệ thống toàn diện</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#cbd5e1] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm font-medium text-[#334155] dark:text-slate-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <CalendarOutlined className="text-[#64748b] dark:text-slate-400" />
            Tháng 10, 2023 <DownOutlined className="text-xs" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1677ff] hover:bg-[#0058be] text-white rounded text-sm font-medium shadow-sm transition-colors">
            <DownloadOutlined />
            Xuất báo cáo
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <ErrorState 
          title="Lỗi kết nối dữ liệu"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <RevenueSummaryCards summary={summary} />
          <RevenueCharts barData={charts?.barData} pieData={charts?.pieData} totalVehicleRevenue={charts?.totalVehicleRevenue} />
          <RecentTransactions transactions={transactions} />
        </div>
      )}
    </section>
  );
};
