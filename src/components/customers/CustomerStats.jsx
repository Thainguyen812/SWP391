import { TeamOutlined, CalendarOutlined, StarOutlined, WarningOutlined, ArrowUpOutlined } from '@ant-design/icons';

export const CustomerStats = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-6 w-full animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "TỔNG KHÁCH HÀNG",
      icon: <TeamOutlined className="text-[#1677ff] text-xl" />,
      value: stats.total.value,
      sub: stats.total.trend,
      subIcon: stats.total.isPositive ? <ArrowUpOutlined className="text-[#00a572] text-xs" /> : null,
      subClass: "text-[#00a572]"
    },
    {
      title: "KHÁCH THUÊ THÁNG",
      icon: <CalendarOutlined className="text-[#1677ff] text-xl" />,
      value: stats.monthly.value,
      sub: stats.monthly.sub,
      subClass: "text-[#44474c] dark:text-slate-400"
    },
    {
      title: "VIP",
      icon: <StarOutlined className="text-[#eab308] text-xl" />,
      value: stats.vip.value,
      sub: stats.vip.sub,
      subClass: "text-[#44474c] dark:text-slate-400"
    },
    {
      title: "CẦN GIA HẠN",
      icon: <WarningOutlined className="text-[#ba1a1a] text-xl" />,
      value: stats.expired.value,
      sub: stats.expired.sub,
      subClass: "text-[#ba1a1a]",
      valueClass: "text-[#ba1a1a]"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 w-full">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-[#e9e7e9] dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-bold text-[#44474c] dark:text-slate-300 uppercase tracking-wide">
              {card.title}
            </h3>
            <div className="p-1 rounded bg-[#f0f5ff] dark:bg-slate-700">
              {card.icon}
            </div>
          </div>
          <div>
            <div className={`text-3xl font-bold mb-1 ${card.valueClass || 'text-[#041627] dark:text-white'}`}>
              {card.value}
            </div>
            <div className={`text-sm flex items-center gap-1 ${card.subClass}`}>
              {card.subIcon}
              {card.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
