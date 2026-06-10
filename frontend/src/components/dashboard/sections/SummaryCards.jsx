import icon4 from "../../../assets/icons/icon-4.svg";
import icon5 from "../../../assets/icons/icon-5.svg";
import icon6 from "../../../assets/icons/icon-6.svg";
import icon7 from "../../../assets/icons/icon-7.svg";
import icon8 from "../../../assets/icons/icon-8.svg";

export const SummaryCards = ({ data }) => {
  if (!data) return null;

  const cards = [
    {
      title: "TỔNG DOANH THU",
      icon: icon4,
      iconWrapperClassName: "bg-[#d8e2ff33]",
      iconClassName: "w-[22px] h-4",
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
              <img className="w-[11.67px] h-[7px]" alt="trend up" src={icon5} />
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
      icon: icon6,
      iconWrapperClassName: "bg-[#d2e4fb33]",
      iconClassName: "w-[18px] h-4",
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
      icon: icon7,
      iconWrapperClassName: "bg-[#4edea333]",
      iconClassName: "w-5 h-5",
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
      icon: icon8,
      iconWrapperClassName: "bg-[#ffdad680]",
      iconClassName: "w-[22px] h-[19px]",
      cardClassName: "border-[#ba1a1a4c]",
      titleClassName: "text-[#ba1a1a]",
      isAlert: true,
      content: (
        <div className="flex-between items-end mt-4 w-full">
          <div className="text-h1 text-[#ba1a1a]">
            {data?.issues?.value || "0"}
          </div>
          <button type="button" className="text-caption-bold text-[#0058be] hover:underline">
            {data?.issues?.trend || "Xem"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 w-full">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`relative w-full h-fit flex flex-col items-start justify-between p-4 bg-white rounded-lg border shadow-sm ${
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
              <img className={card.iconClassName} alt="" src={card.icon} />
            </div>
          </div>
          {card.content}
        </article>
      ))}
    </div>
  );
};
