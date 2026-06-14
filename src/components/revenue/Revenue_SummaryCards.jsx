import { CalendarOutlined, TableOutlined, BankOutlined, RocketOutlined } from "@ant-design/icons";

export const RevenueSummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Hôm nay */}
      <div className="bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 rounded-lg p-6 shadow-sm flex flex-col justify-between transition-colors">
        <div className="flex-between mb-4">
          <span className="text-body-strong text-[#44474c] dark:text-slate-400 uppercase">HÔM NAY</span>
          <div className="w-10 h-10 rounded-lg bg-[#f8fafc] dark:bg-slate-700 text-[#0058be] dark:text-blue-400 flex items-center justify-center text-xl transition-colors">
            <CalendarOutlined />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-4xl font-bold text-[#041627] dark:text-white transition-colors">{summary.today.value}</span>
          <span className={`text-caption-strong mt-2 ${summary.today.isPositive ? 'text-[#4edea3]' : 'text-[#ba1a1a] dark:text-red-400'}`}>
            {summary.today.trend}
          </span>
        </div>
      </div>

      {/* Tháng này */}
      <div className="bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 rounded-lg p-6 shadow-sm flex flex-col justify-between transition-colors">
        <div className="flex-between mb-4">
          <span className="text-body-strong text-[#44474c] dark:text-slate-400 uppercase">THÁNG NÀY</span>
          <div className="w-10 h-10 rounded-lg bg-[#f8fafc] dark:bg-slate-700 text-[#0058be] dark:text-blue-400 flex items-center justify-center text-xl transition-colors">
            <TableOutlined />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-4xl font-bold text-[#041627] dark:text-white transition-colors">{summary.thisMonth.value}</span>
          <span className={`text-caption-strong mt-2 ${summary.thisMonth.isPositive ? 'text-[#4edea3]' : 'text-[#ba1a1a] dark:text-red-400'}`}>
            {summary.thisMonth.trend}
          </span>
        </div>
      </div>

      {/* Dự kiến năm 2023 */}
      <div className="bg-[#0c1421] rounded-lg p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#1e293b]/50 blur-2xl pointer-events-none"></div>
        
        <div className="flex-between mb-4 relative z-10">
          <span className="text-body-strong text-white uppercase opacity-90">DỰ KIẾN NĂM 2023</span>
          <div className="w-10 h-10 rounded-lg bg-[#1e293b] text-white flex items-center justify-center text-xl border border-white/10">
            <BankOutlined />
          </div>
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-4xl font-bold text-white">{summary.projectedYear.value}</span>
          <span className="text-caption-strong text-[#4edea3] mt-2 flex items-center gap-1.5">
            <RocketOutlined /> {summary.projectedYear.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};
