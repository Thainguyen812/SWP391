import { DollarOutlined, ArrowUpOutlined, CarOutlined, PieChartOutlined, WarningOutlined } from "@ant-design/icons";

export const SummaryCards = ({ data }) => {
  if (!data) return null;

  const cards = [
    {
      title: "TỔNG DOANH THU",
      icon: <DollarOutlined className="text-[#1677ff] text-xl" />,
      iconWrapperClassName: "bg-[#d8e2ff33] dark:bg-[#1677ff]/20",
      content: (
        <div className="flex flex-col gap-[3.5px] mt-4 w-full">
          <div className="h-14 relative w-full">
            <div className="absolute top-0 left-0 h-14 flex items-center text-h1 text-[#041627]">
              {data?.totalRevenue?.value || "0"}
            </div>
            <div className="absolute top-6 left-[108px] h-7 flex items-center text-h2 text-[#44474c]">
              {data?.totalRevenue?.unit || "Tr"}
            </div>
          </div>
          <div className="flex items-center gap-1 w-full">
            {data?.totalRevenue?.isPositive && (
              <ArrowUpOutlined className="text-[#00a572] text-xs" />
            )}
            <p className="text-body text-[#00a572]">
              {data?.totalRevenue?.trend || "..."}
            </p>
          </div>
        </div>
      )
    },
    {
      title: "XE ĐANG ĐỖ",
      icon: <CarOutlined className="text-[#2b6a9a] dark:text-[#3b82f6] text-xl" />,
      iconWrapperClassName: "bg-[#d2e4fb33] dark:bg-[#3b82f6]/20",
      content: (
        <div className="flex flex-col gap-2 mt-4 w-full">
          <div className="text-h1 text-[#041627]">
            {data?.activeSessions?.value || "0"}
          </div>
          <div className="w-full h-2 bg-[#efedef] rounded-xl overflow-hidden">
            <div className="h-full bg-[#041627] transition-all duration-1000" style={{ width: `${data?.activeSessions?.progress || 0}%` }} />
          </div>
        </div>
      )
    },
    {
      title: "HIỆU SUẤT LẤP ĐẦY",
      icon: <PieChartOutlined className="text-[#4edea3] text-xl" />,
      iconWrapperClassName: "bg-[#4edea333] dark:bg-[#4edea3]/20",
      content: (
        <div className="flex flex-col gap-1 mt-4 w-full">
          <div className="text-h1 text-[#041627]">
            {data?.occupancyRate?.value || "0%"}
          </div>
          <div className="text-body text-[#44474c]">
            {data?.occupancyRate?.trend || "..."}
          </div>
        </div>
      )
    },
    {
      title: "SỰ CỐ CẦN XỬ LÝ",
      icon: <WarningOutlined className="text-[#ba1a1a] dark:text-red-400 text-xl" />,
      iconWrapperClassName: "bg-[#ffdad680] dark:bg-red-500/20",
      cardClassName: "border-[#ba1a1a4c]",
      titleClassName: "text-[#ba1a1a]",
      isAlert: true,
      content: (
        <div className="flex flex-col justify-end mt-4 w-full h-full gap-[3.5px]">
          <div className="flex items-end justify-between w-full h-14">
            <div className="text-h1 text-[#ba1a1a] leading-none">
              {data?.issues?.value || "0"}
            </div>
            <button 
              type="button" 
              className="text-caption-bold text-[#0058be] hover:underline mb-1"
              onClick={() => {
                const el = document.getElementById('system-notifications');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.style.transition = 'all 0.5s ease';
                  el.style.transform = 'scale(1.02)';
                  el.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.3)';
                  setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.boxShadow = 'none';
                  }, 800);
                }
              }}
            >
              {data?.issues?.trend || "Xem"}
            </button>
          </div>
          <div className="h-4"></div> {/* Spacer to match other cards' trend height if needed, or just let flex-end push it to bottom */}
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 w-full">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`relative w-full h-full flex flex-col items-start justify-between p-4 bg-white rounded-lg border shadow-sm ${
            card.cardClassName ?? "border-[#e9e7e9]"
          }`}
        >
          <div className="flex-between w-full">
            <div className="flex items-center gap-1">
              {card.isAlert && <div className="w-2 h-2 bg-[#ba1a1a] rounded-xl" />}
              <h3 className={`text-caption-bold ${card.titleClassName ?? "text-[#44474c]"}`}>
                {card.title}
              </h3>
            </div>
            <div className={`p-2 rounded flex-center ${card.iconWrapperClassName}`}>
              {card.icon}
            </div>
          </div>
          {card.content}
        </article>
      ))}
    </div>
  );
};
