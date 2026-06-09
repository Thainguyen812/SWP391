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

const summaryCards = [
  {
    title: "TỔNG DOANH THU",
    icon: icon4,
    iconWrapperClassName:
      "inline-flex flex-col items-start p-2 relative flex-[0_0_auto] bg-[#d8e2ff33] rounded",
    iconClassName: "relative w-[22px] h-4",
    content: (
      <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-[3.5px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="h-14 relative self-stretch w-full">
            <div className="absolute top-0 left-0 h-14 flex items-center [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px] whitespace-nowrap">
              45.2
            </div>
            <div className="absolute top-6 left-[108px] h-7 flex items-center [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#44474c] text-xl tracking-[-0.96px] leading-7 whitespace-nowrap">
              Tr
            </div>
          </div>
          <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <img
                className="relative w-[11.67px] h-[7px]"
                alt=""
                src={icon5}
                aria-hidden="true"
              />
            </div>
            <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#00a572] text-sm tracking-[0] leading-5 whitespace-nowrap">
              +12% so với hôm qua
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "XE ĐANG ĐỖ",
    icon: icon6,
    iconWrapperClassName:
      "bg-[#d2e4fb33] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
    iconClassName: "relative w-[18px] h-4",
    content: (
      <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
            <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px]">
              1,248
            </div>
          </div>
          <div
            className="relative self-stretch w-full h-2 bg-[#efedef] rounded-xl overflow-hidden"
            role="progressbar"
            aria-valuenow={85}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tỷ lệ bãi xe đang sử dụng"
          >
            <div className="w-[85.00%] h-full bg-[#041627]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "HIỆU SUẤT LẤP ĐẦY",
    icon: icon7,
    iconWrapperClassName:
      "bg-[#4edea333] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
    iconClassName: "relative w-5 h-5",
    content: (
      <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-1 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
            <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#041627] text-5xl tracking-[-0.96px] leading-[56px]">
              85%
            </div>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5">
              Tối ưu: 80-90%
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "SỰ CỐ CẦN XỬ LÝ",
    icon: icon8,
    iconWrapperClassName:
      "bg-[#ffdad680] inline-flex flex-col items-start p-2 relative flex-[0_0_auto] rounded",
    iconClassName: "relative w-[22px] h-[19px]",
    cardClassName: "border-[#ba1a1a4c]",
    titleClassName: "text-[#ba1a1a]",
    content: (
      <div className="flex flex-col items-start pt-4 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-end justify-between relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#ba1a1a] text-5xl tracking-[-0.96px] leading-[56px] whitespace-nowrap">
              03
            </div>
          </div>
          <button
            type="button"
            className="inline-flex flex-col items-start relative flex-[0_0_auto] focus:outline-none"
            aria-label="Xem chi tiết sự cố cần xử lý"
          >
            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0058be] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
              Xem chi tiết
            </div>
          </button>
        </div>
      </div>
    ),
  },
];

const distributionItems = [
  { label: "Ô tô", value: "60%", color: "#041627" },
  { label: "Xe vãng lai", value: "25%", color: "#0058be" },
  { label: "Xe VIP", value: "15%", color: "#00311f" },
];

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const revenueAxisLabels = ["60M", "40M", "20M", "0M"];

const employees = [
  {
    initial: "N",
    name: "Nguyễn Văn A",
    role: "Cổng Ra 01",
    count: "342 lượt",
    highlight: {
      icon: icon10,
      label: "TOP 1",
    },
    avatarClassName: "bg-[#d2e4fb]",
    initialClassName: "text-[#041627]",
  },
  {
    initial: "T",
    name: "Trần Thị B",
    role: "Cổng Vào 02",
    count: "315 lượt",
    avatarClassName: "bg-[#efedef]",
    initialClassName: "text-[#44474c]",
  },
  {
    initial: "L",
    name: "Lê Văn C",
    role: "Tuần tra Khu B",
    count: "289 lượt",
    avatarClassName: "bg-[#efedef]",
    initialClassName: "text-[#44474c]",
  },
];

const notifications = [
  {
    title: "Mất kết nối Camera LPR Cổng 03",
    description: (
      <>
        Hệ thống không nhận được tín hiệu từ Camera C03 trong
        <br />5 phút qua. Yêu cầu kiểm tra kỹ thuật ngay lập tức.
      </>
    ),
    time: "10 PHÚT TRƯỚC",
    icon: icon11,
    iconClassName: "relative w-5 h-5",
    containerClassName:
      "flex items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#ffdad633] rounded border border-solid border-[#ba1a1a33]",
    important: true,
    actionLabel: "Chỉ định kỹ thuật",
  },
  {
    title: "Cảnh báo đầy bãi - Khu vực Tầng hầm 1",
    description: (
      <>
        Công suất hiện tại đạt 95%. Hệ thống tự động chuyển
        <br />
        hướng xe mới xuống Tầng hầm 2.
      </>
    ),
    time: "45 PHÚT TRƯỚC",
    icon: icon12,
    iconClassName: "relative w-[22px] h-[19px]",
    containerClassName:
      "flex items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] rounded border border-solid border-transparent",
  },
  {
    title: "Cập nhật phần mềm Barrier v2.1 hoàn tất",
    description: (
      <>
        Tất cả các cổng kiểm soát đã được đồng bộ phiên bản
        <br />
        mới nhất.
      </>
    ),
    time: "2 GIỜ TRƯỚC",
    icon: icon13,
    iconClassName: "relative w-5 h-5",
    containerClassName:
      "flex items-start gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] rounded border border-solid border-transparent",
  },
];

export const SystemOverviewSection = () => {
  return (
    <section className="system-overview-container">
      <header className="system-overview-header">
        <div className="inline-flex flex-col items-start gap-1 relative flex-[0_0_auto]">
          <div className="flex flex-col items-start flex-[0_0_auto] relative self-stretch w-full">
            <h2 className="system-overview-title">
              Tổng quan HS thống
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
            aria-label="Lọc dữ liệu hôm nay"
          >
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <img
                className="relative w-[10.5px] h-[11.67px]"
                alt=""
                src={icon2}
                aria-hidden="true"
              />
            </div>
            <div className="relative flex items-center justify-center w-fit [font-family:'Inter-Bold',Helvetica] font-bold text-[#1b1c1d] text-xs text-center tracking-[0.60px] leading-4 whitespace-nowrap">
              Hôm nay
            </div>
          </button>
          <button
            type="button"
            className="gap-2 px-4 py-[9px] bg-[#2170e4] rounded inline-flex items-center relative flex-[0_0_auto] focus:outline-none"
            aria-label="Xuất báo cáo"
          >
            <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
              <img
                className="relative w-[9.33px] h-[9.33px]"
                alt=""
                src={icon3}
                aria-hidden="true"
              />
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
            className={`relative row-[1_/_2] col-[${index + 1}_/_${index + 2}] w-full h-fit flex flex-col items-start justify-between p-4 bg-white rounded-lg border border-solid shadow-[0px_1px_3px_#0000000d] ${
              card.cardClassName ?? "border-[#e9e7e9]"
            }`}
          >
            <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
              {card.title === "SỰ CỐ CẦN XỬ LÝ" ? (
                <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                  <div className="relative w-2 h-2 bg-[#ba1a1a] rounded-xl" />
                  <p
                    className={`relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-xs tracking-[0.60px] leading-4 whitespace-nowrap ${
                      card.titleClassName ?? "text-[#44474c]"
                    }`}
                  >
                    {card.title}
                  </p>
                </div>
              ) : (
                <div
                  className={`relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-xs tracking-[0.60px] leading-4 whitespace-nowrap ${
                    card.titleClassName ?? "text-[#44474c]"
                  }`}
                >
                  {card.title}
                </div>
              )}
              <div className={card.iconWrapperClassName}>
                <img
                  className={card.iconClassName}
                  alt=""
                  src={card.icon}
                  aria-hidden="true"
                />
              </div>
            </div>
            {card.content}
          </article>
        ))}
      </div>
      <div className="system-overview-main-grid">
        <article className="relative row-[1_/_2] col-[1_/_3] w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex items-center justify-between p-4 flex-[0_0_auto] [border-bottom-style:solid] relative self-stretch w-full border-b border-[#e9e7e9]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7 whitespace-nowrap">
                Doanh thu 7 ngày qua
              </h3>
            </div>
            <button
              type="button"
              className="flex-col justify-center p-1 rounded-sm inline-flex items-center relative flex-[0_0_auto] focus:outline-none"
              aria-label="Tùy chọn biểu đồ doanh thu"
            >
              <div className="inline-flex items-start justify-center relative flex-[0_0_auto]">
                <img
                  className="relative w-1 h-4"
                  alt=""
                  src={icon9}
                  aria-hidden="true"
                />
              </div>
            </button>
          </div>
          <div
            className="relative self-stretch w-full h-[302px]"
            role="img"
            aria-label="Biểu đồ doanh thu 7 ngày qua"
          >
            <div className="flex flex-col w-[calc(100%_-_32px)] h-[calc(100%_-_32px)] items-center justify-end absolute top-4 left-4 opacity-70">
              <div className="relative w-[608.66px] h-[270px]">
                <img
                  className="absolute w-full h-full top-0 left-0"
                  alt=""
                  src={vector}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="inline-flex flex-col h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-4">
              {revenueAxisLabels.map((label) => (
                <div
                  key={label}
                  className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]"
                >
                  <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#74777d] text-xs tracking-[0] leading-4 whitespace-nowrap">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex w-[calc(100%_-_64px)] items-start justify-between absolute left-12 bottom-2">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]"
                >
                  <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#74777d] text-xs tracking-[0] leading-4 whitespace-nowrap">
                    {day}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col w-[calc(100%_-_64px)] h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-12">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`dashed-line-${index}`}
                  className="h-px [border-bottom-style:dashed] relative self-stretch w-full border-b border-[#e9e7e9]"
                />
              ))}
              <div className="relative self-stretch w-full h-px border-b [border-bottom-style:solid] border-[#c4c6cd]" />
            </div>
          </div>
        </article>
        <article className="relative row-[1_/_2] col-[3_/_4] w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex flex-col items-start p-4 relative self-stretch w-full flex-[0_0_auto] border-b [border-bottom-style:solid] border-[#e9e7e9]">
            <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7">
                Phân bổ phương tiện
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col w-[150px] h-[174px] items-start pt-0 pb-6 px-0 relative z-[1]">
              <div
                className="relative w-[150px] h-[150px] rounded-[75px]"
                style={{
                  background:
                    "conic-gradient(#041627 0deg 216deg, #0058be 216deg 306deg, #00311f 306deg 360deg)",
                }}
                role="img"
                aria-label="Biểu đồ tròn phân bổ phương tiện: Ô tô 60%, Xe vãng lai 25%, Xe VIP 15%"
              >
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
                <div
                  key={item.label}
                  className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]"
                >
                  <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                    <div
                      className="relative w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
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
        <article className="relative row-[1_/_2] col-[1_/_2] w-full h-fit flex flex-col items-start pt-0 pb-[180.5px] px-0 bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
          <div className="flex items-center justify-between p-4 flex-[0_0_auto] [border-bottom-style:solid] relative self-stretch w-full border-b border-[#e9e7e9]">
            <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
              <h3 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#041627] text-xl tracking-[0] leading-7 whitespace-nowrap">
                Nhân viên xuất sắc ca hiện tại
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex flex-col items-start relative flex-[0_0_auto] focus:outline-none"
              aria-label="Xem tất cả nhân viên xuất sắc"
            >
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#0058be] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
                Xem tất cả
              </div>
            </button>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            {employees.map((employee, index) => (
              <div
                key={employee.name}
                className={`flex items-center justify-between p-4 relative self-stretch w-full flex-[0_0_auto] ${
                  index > 0
                    ? "border-t [border-top-style:solid] border-[#e9e7e9]"
                    : ""
                }`}
              >
                <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
                  <div
                    className={`flex w-10 h-10 items-center justify-center relative rounded-xl ${employee.avatarClassName}`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-fit [font-family:'Inter-SemiBold',Helvetica] font-semibold text-xl text-center tracking-[0] leading-7 whitespace-nowrap ${employee.initialClassName}`}
                    >
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
                  {employee.highlight ? (
                    <div className="flex items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="inline-flex flex-col items-end relative flex-[0_0_auto]">
                        <img
                          className="relative w-[11.67px] h-[11.08px]"
                          alt=""
                          src={employee.highlight.icon}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="inline-flex flex-col items-end relative flex-[0_0_auto]">
                        <div className="relative flex items-center justify-end w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#00a572] text-[10px] text-right tracking-[0] leading-[15px] whitespace-nowrap">
                          {employee.highlight.label}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="relative row-[1_/_2] col-[2_/_3] w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d]">
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
            {notifications.map((notification) => (
              <div
                key={notification.title}
                className={notification.containerClassName}
              >
                <div className="inline-flex flex-col items-start pt-1 pb-0 px-0 relative self-stretch flex-[0_0_auto]">
                  <img
                    className={notification.iconClassName}
                    alt=""
                    src={notification.icon}
                    aria-hidden="true"
                  />
                </div>
                <div className="inline-flex flex-col items-start gap-1 relative self-stretch flex-[0_0_auto]">
                  <div className="flex flex-col items-start flex-[0_0_auto] relative self-stretch w-full">
                    <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#1b1c1d] text-sm tracking-[0] leading-[17.5px] whitespace-nowrap">
                      {notification.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <p
                      className={`relative mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#44474c] text-sm tracking-[0] leading-5 ${
                        notification.title ===
                        "Cập nhật phần mềm Barrier v2.1 hoàn tất"
                          ? "w-[359.96px]"
                          : "w-fit"
                      }`}
                    >
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
                      <button
                        type="button"
                        className="flex-col justify-center inline-flex items-center relative flex-[0_0_auto] focus:outline-none"
                        aria-label={notification.actionLabel}
                      >
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
