import { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";
import icon2 from "../../assets/icons/icon-2.svg";
import icon3 from "../../assets/icons/icon-3.svg";
import icon4 from "../../assets/icons/icon-4.svg";
import icon5 from "../../assets/icons/icon-5.svg";
import icon6 from "../../assets/icons/icon-6.svg";
import icon7 from "../../assets/icons/icon-7.svg";
import icon8 from "../../assets/icons/icon-8.svg";
import icon9 from "../../assets/icons/icon-9.svg";
import icon10 from "../../assets/icons/icon-10.svg";
import icon11 from "../../assets/icons/icon-11.svg";
import icon12 from "../../assets/icons/icon-12.svg";
import icon13 from "../../assets/icons/icon-13.svg";
import vector from "../../assets/icons/vector.svg";
import "./SystemOverview.css";

const distributionItems = [
  { label: "Ô tô", value: "60%", color: "#041627" },
  { label: "Xe vãng lai", value: "25%", color: "#0058be" },
  { label: "Xe VIP", value: "15%", color: "#00311f" },
];

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const revenueAxisLabels = ["60M", "40M", "20M", "0M"];

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
          iconClassName: alert.type === 'warning' ? "relative w-[22px] h-[19px]" : "relative w-5 h-5",
          containerClassName: alert.type === 'error' 
            ? "flex items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#ffdad633] rounded border border-solid border-[#ba1a1a33]"
            : "flex items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] rounded border border-solid border-transparent",
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

  const summaryCards = [
    {
      title: "TỔNG DOANH THU",
      icon: icon4,
      iconWrapperClassName: "inline-flex flex-col items-start p-2 relative flex-[0_0_auto] bg-[#d8e2ff33] rounded",
      iconClassName: "relative w-[22px] h-4",
      content: (
        <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-[3.5px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="h-14 relative self-stretch w-full">
              <div className="absolute top-0 left-0 h-14 flex items-center [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px] whitespace-nowrap">
                {summaryData?.totalRevenue?.value || "0"}
              </div>
              <div className="absolute top-6 left-[108px] h-7 flex items-center [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#44474c] text-xl tracking-[-0.96px] leading-7 whitespace-nowrap">
                {summaryData?.totalRevenue?.unit || "Tr"}
              </div>
            </div>
            <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
              {summaryData?.totalRevenue?.isPositive && (
                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <img className="relative w-[11.67px] h-[7px]" alt="" src={icon5} />
                </div>
              )}
              <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#00a572] text-sm tracking-[0] leading-5 whitespace-nowrap">
                {summaryData?.totalRevenue?.trend || "..."}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "XE ĐANG ĐỖ",
      icon: icon6,
      iconWrapperClassName: "bg-[#d2e4fb33] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
      iconClassName: "relative w-[18px] h-4",
      content: (
        <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px]">
                {summaryData?.activeSessions?.value || "0"}
              </div>
            </div>
            <div className="relative self-stretch w-full h-2 bg-[#efedef] rounded-xl overflow-hidden">
              <div className="h-full bg-[#041627] transition-all duration-1000" style={{ width: `${summaryData?.activeSessions?.progress || 0}%` }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "HIỆU SUẤT LẤP ĐẦY",
      icon: icon7,
      iconWrapperClassName: "bg-[#4edea333] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
      iconClassName: "relative w-5 h-5",
      content: (
        <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px]">
                {summaryData?.occupancyRate?.value || "0%"}
              </div>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5">
                {summaryData?.occupancyRate?.trend || "..."}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "SỰ CỐ CẦN XỬ LÝ",
      icon: icon8,
      iconWrapperClassName: "bg-[#ffdad680] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
      iconClassName: "relative w-[22px] h-[19px]",
      cardClassName: "border-[#ba1a1a4c]",
      titleClassName: "text-[#ba1a1a]",
      content: (
        <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-end justify-between relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#ba1a1a] text-5xl tracking-[-0.96px] leading-[56px] whitespace-nowrap">
                {summaryData?.issues?.value || "0"}
              </div>
            </div>
            <button type="button" className="inline-flex flex-col items-start relative flex-[0_0_auto] focus:outline-none">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0058be] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
                {summaryData?.issues?.trend || "Xem"}
              </div>
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="system-overview-container">
      {/* Loading overlay for the whole section */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f8fafc]/70 backdrop-blur-[1px]">
          <div className="w-10 h-10 border-4 border-[#0058be] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <header className="system-overview-header">
        <div className="inline-flex flex-col items-start gap-1 relative flex-[0_0_auto]">
          <div className="flex flex-col items-start flex-[0_0_auto] relative self-stretch w-full">
            <h2 className="system-overview-title">
              Tổng quan hệ thống
            </h2>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <p className="system-overview-subtitle">
              Dữ liệu cập nhật theo thời gian thực: 24/10/2023 14:30
            </p>
          </div>
        </div>
        <div className="system-overview-header-actions">
          <button
            type="button"
            className="gap-2 px-4 py-2 bg-[#efedef] rounded border border-solid border-[#c4c6cd] inline-flex items-center relative flex-[0_0_auto] focus:outline-none"
          >
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <img className="relative w-[10.5px] h-[11.67px]" alt="" src={icon2} />
            </div>
            <div className="relative flex items-center justify-center w-fit [font-family:'Inter-Bold',Helvetica] font-bold text-[#1b1c1d] text-xs text-center tracking-[0.60px] leading-4 whitespace-nowrap">
              Hôm nay
            </div>
          </button>
          <button
            type="button"
            className="gap-2 px-4 py-[9px] bg-[#2170e4] rounded inline-flex items-center relative flex-[0_0_auto] focus:outline-none"
          >
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <img className="relative w-[9.33px] h-[9.33px]" alt="" src={icon3} />
            </div>
            <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#fefcff] text-xs text-center tracking-[0.60px] leading-4 whitespace-nowrap">
              Xuất báo cáo
            </div>
          </button>
        </div>
      </header>

      <div className="system-overview-grid">
        {summaryCards.map((card, index) => (
          <article
            key={card.title}
            className={`relative w-full h-fit flex flex-col items-start justify-between p-4 bg-white rounded-lg border border-solid shadow-[0px_1px_3px_#0000000d] ${
              card.cardClassName ?? "border-[#e9e7e9]"
            }`}
          >
            <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
              {card.title === "SỰ CỐ CẦN XỬ LÝ" ? (
                <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                  <div className="relative w-2 h-2 bg-[#ba1a1a] rounded-xl" />
                  <p className={`relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-xs tracking-[0.60px] leading-4 whitespace-nowrap ${card.titleClassName ?? "text-[#44474c]"}`}>
                    {card.title}
                  </p>
                </div>
              ) : (
                <div className={`relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-xs tracking-[0.60px] leading-4 whitespace-nowrap ${card.titleClassName ?? "text-[#44474c]"}`}>
                  {card.title}
                </div>
              )}
              <div className={card.iconWrapperClassName}>
                <img className={card.iconClassName} alt="" src={card.icon} />
              </div>
            </div>
            {card.content}
          </article>
        ))}
      </div>

      <div className="system-overview-main-grid">
        <article className="relative w-full h-fit col-span-2 flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex items-center justify-between p-4 flex-[0_0_auto] [border-bottom-style:solid] relative self-stretch w-full border-b border-[#e9e7e9]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7 whitespace-nowrap">
                Doanh thu 7 ngày qua
              </h3>
            </div>
            <button type="button" className="flex-col justify-center p-1 rounded-sm inline-flex items-center relative flex-[0_0_auto] focus:outline-none">
              <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                <img className="relative w-1 h-4" alt="" src={icon9} />
              </div>
            </button>
          </div>
          <div className="relative self-stretch w-full h-[302px]" role="img">
            <div className="flex flex-col w-[calc(100%_-_32px)] h-[calc(100%_-_32px)] items-center justify-end absolute top-4 left-4 opacity-70">
              <div className="relative w-[608.66px] h-[270px]">
                <img className="absolute w-full h-full top-0 left-0" alt="" src={vector} />
              </div>
            </div>
            <div className="inline-flex flex-col h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-4">
              {revenueAxisLabels.map((label) => (
                <div key={label} className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                  <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#74777d] text-xs tracking-[0] leading-4 whitespace-nowrap">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex w-[calc(100%_-_64px)] items-start justify-between absolute left-12 bottom-2">
              {weekdays.map((day) => (
                <div key={day} className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]">
                  <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#74777d] text-xs tracking-[0] leading-4 whitespace-nowrap">
                    {day}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col w-[calc(100%_-_64px)] h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-12">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`dashed-line-${index}`} className="h-px [border-bottom-style:dashed] relative self-stretch w-full border-b border-[#e9e7e9]" />
              ))}
              <div className="relative self-stretch w-full h-px border-b [border-bottom-style:solid] border-[#c4c6cd]" />
            </div>
          </div>
        </article>

        <article className="relative w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex flex-col items-start p-4 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#e9e7e9]">
            <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7">
                Phân bổ phương tiện
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col w-[150px] h-[174px] items-start pt-0 pb-6 px-0 relative z-[1]">
              <div className="relative w-[150px] h-[150px] rounded-[75px]" style={{ background: "conic-gradient(#041627 0deg 216deg, #0058be 216deg 306deg, #00311f 306deg 360deg)" }}>
                <div className="absolute top-5 left-5 w-[110px] h-[110px] bg-white rounded-[55px]" />
                <div className="inline-flex flex-col items-start absolute top-[53px] left-[45px]">
                  <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl text-center tracking-[0] leading-7 whitespace-nowrap">
                      1,248
                    </div>
                  </div>
                  <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#74777d] text-xs text-center tracking-[0.60px] leading-4 whitespace-nowrap">
                      TỔNG SỐ
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto] z-0">
              {distributionItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                  <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                    <div className="relative w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                      <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5 whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#041627] text-sm tracking-[0] leading-5 whitespace-nowrap">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-0 pb-8 px-0 self-stretch w-full">
        <article className="relative w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex items-center justify-between p-4 flex-[0_0_auto] [border-bottom-style:solid] relative self-stretch w-full border-b border-[#e9e7e9]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7 whitespace-nowrap">
                Nhân viên xuất sắc ca hiện tại
              </h3>
            </div>
            <button type="button" className="inline-flex flex-col items-start relative flex-[0_0_auto] focus:outline-none">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0058be] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
                Xem tất cả
              </div>
            </button>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] pb-2">
            {employees.length === 0 && !loading && (
              <div className="p-4 text-gray-500 text-sm text-center w-full">Không có dữ liệu</div>
            )}
            {employees.map((employee, index) => (
              <div key={employee.name} className={`flex items-center justify-between p-4 relative self-stretch w-full flex-[0_0_auto] ${index > 0 ? "border-t border-solid border-[#e9e7e9]" : ""}`}>
                <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
                  <div className={`flex w-10 h-10 items-center justify-center relative rounded-xl ${employee.avatarClassName}`}>
                    <div className={`relative flex items-center justify-center w-fit [font-family:'Inter-SemiBold',Helvetica] font-semibold text-xl text-center tracking-[0] leading-7 whitespace-nowrap ${employee.initialClassName}`}>
                      {employee.initial}
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#041627] text-base tracking-[0] leading-5 whitespace-nowrap">
                        {employee.name}
                      </div>
                    </div>
                    <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                      <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5 whitespace-nowrap">
                        {employee.role}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <div className="flex flex-col items-end relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex items-center justify-end w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#041627] text-sm text-right tracking-[0] leading-5 whitespace-nowrap">
                      {employee.count}
                    </div>
                  </div>
                  {employee.highlight && (
                    <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-end relative flex-[0_0_auto]">
                        <img className="relative w-[11.67px] h-[11.08px]" alt="" src={employee.highlight.icon} />
                      </div>
                      <div className="inline-flex flex-col items-end relative flex-[0_0_auto]">
                        <div className="relative flex items-center justify-end w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#00a572] text-[10px] text-right tracking-[0] leading-[15px] whitespace-nowrap">
                          {employee.highlight.label}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="relative w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex items-center justify-between p-4 flex-[0_0_auto] [border-bottom-style:solid] relative self-stretch w-full border-b border-[#e9e7e9]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7 whitespace-nowrap">
                Thông báo hS thống
              </h3>
            </div>
            <div className="inline-flex items-start relative flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start px-2 py-1 relative self-stretch flex-[0_0_auto] bg-[#ffdad6] rounded-sm">
                <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#93000a] text-[10px] tracking-[0] leading-[15px] whitespace-nowrap">
                  2 QUAN TRHNG
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full flex-[0_0_auto]">
            {notifications.length === 0 && !loading && (
              <div className="p-4 text-gray-500 text-sm text-center w-full">Không có thông báo</div>
            )}
            {notifications.map((notification, index) => (
              <div key={index} className={notification.containerClassName}>
                <div className="inline-flex flex-col items-start pt-1 pb-0 px-0 relative self-stretch flex-[0_0_auto]">
                  <img className={notification.iconClassName} alt="" src={notification.icon} />
                </div>
                <div className="inline-flex flex-col items-start gap-1 relative self-stretch flex-[0_0_auto]">
                  <div className="flex flex-col items-start flex-[0_0_auto] relative self-stretch w-full">
                    <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#1b1c1d] text-sm tracking-[0] leading-[17.5px] whitespace-nowrap">
                      {notification.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <p className="relative mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5">
                      {notification.description}
                    </p>
                  </div>
                  {notification.actionLabel ? (
                    <div className="flex items-center gap-[11.99px] pt-1 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                        <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#74777d] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
                          {notification.time}
                        </div>
                      </div>
                      <button type="button" className="flex-col justify-center inline-flex items-center relative flex-[0_0_auto] focus:outline-none">
                        <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0058be] text-xs text-center tracking-[0.60px] leading-4 whitespace-nowrap">
                          {notification.actionLabel}
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start pt-1 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#74777d] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
                        {notification.time}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};
