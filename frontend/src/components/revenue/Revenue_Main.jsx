import { useState, useEffect } from "react";
import { DownloadOutlined, CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { dashboardService } from "../../services/dashboardService";
import { RevenueSummaryCards } from "./Revenue_Summary";
import { RevenueCharts } from "./Revenue_Charts";
import { RecentTransactions } from "./Revenue_Transactions";
import { ErrorState } from "../common/ErrorState";
import { PageLayout } from "../common/PageLayout";

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
    <PageLayout
      title="Báo cáo Doanh thu"
      subtitle="Phân tích dòng tiền và hiệu suất hệ thống toàn diện"
      actions={
        <>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#cbd5e1] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm font-medium text-[#334155] dark:text-slate-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <CalendarOutlined className="text-[#64748b] dark:text-slate-400" />
            Tháng 10, 2023 <DownOutlined className="text-xs" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1677ff] hover:bg-[#0058be] text-white rounded text-sm font-medium shadow-sm transition-colors">
            <DownloadOutlined />
            Xuất báo cáo
          </button>
        </>
      }
    >
      {loading ? (
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <ErrorState 
          title="Lỗi tải dữ liệu"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <div className="flex flex-col gap-6 w-full pb-8">
          <RevenueSummaryCards summary={summary} />
          <RevenueCharts charts={charts} />
          <RecentTransactions transactions={transactions} />
        </div>
      )}
    </PageLayout>
  );
};
