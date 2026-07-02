import { useState, useEffect } from "react";
import { DownloadOutlined, CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { DatePicker, notification } from "antd";
import dayjs from "dayjs";
import { dashboardService } from '../../../services/dashboardService';
import { RevenueSummaryCards } from "./Revenue_Summary";
import { RevenueCharts } from "./Revenue_Charts";
import { RecentTransactions } from "./Revenue_Transactions";
import { ErrorState } from '../../../components/common/ErrorState';
import { PageLayout } from '../../../components/common/PageLayout';

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
                description: "Tệp báo cáo doanh thu đã được tải xuống.", 
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
          <RevenueCharts 
            barData={charts?.barData} 
            pieData={charts?.pieData} 
            totalVehicleRevenue={charts?.totalVehicleRevenue} 
          />
          <RecentTransactions transactions={transactions} />
        </div>
      )}
    </PageLayout>
  );
};
