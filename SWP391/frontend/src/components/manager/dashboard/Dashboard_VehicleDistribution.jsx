import { Card, CardHeader, CardBody } from '../../common/Card';

const distributionItems = [
  { label: "Ô tô", value: "60%", color: "#041627" },
  { label: "Xe vãng lai", value: "25%", color: "#0058be" },
  { label: "Xe VIP", value: "15%", color: "#00311f" },
];

export const VehicleDistribution = () => {
  return (
    <Card noPadding>
      <CardHeader title="Phân bổ phương tiện" />
      <CardBody className="p-6 items-center justify-center">
        <div className="w-[150px] h-[174px] pb-6 relative z-[1]">
          <div 
            className="w-[150px] h-[150px] rounded-[75px] relative" 
            style={{ background: "conic-gradient(#041627 0deg 216deg, #0058be 216deg 306deg, #00311f 306deg 360deg)" }}
          >
            <div className="absolute top-5 left-5 w-[110px] h-[110px] bg-white rounded-full flex flex-col items-center justify-center">
              <span className="text-h3 text-[#041627]">1,248</span>
              <span className="text-caption-bold text-[#74777d]">TỔNG SỐ</span>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-3">
          {distributionItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-body text-[#44474c]">{item.label}</span>
              </div>
              <span className="text-body-strong text-[#041627]">{item.value}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
