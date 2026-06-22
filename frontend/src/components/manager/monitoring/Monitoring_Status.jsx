import { Card, CardHeader, CardBody } from '../../common/Card';

export const ParkingStatusCard = ({ status, loading }) => {
  if (loading || !status) {
    return (
      <Card noPadding>
        <CardHeader title="Trạng thái bãi" action={<div className="w-5 h-5 rounded-full border border-[#041627] flex items-center justify-center"><div className="w-2.5 h-px bg-[#041627]"></div><div className="w-px h-2.5 bg-[#041627] absolute"></div></div>} />
        <CardBody className="p-4 items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#0058be] border-t-transparent rounded-full animate-spin my-8"></div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card noPadding>
      <CardHeader 
        title="Trạng thái bãi" 
        action={
          <div className="w-5 h-5 rounded-full border border-[#041627] flex items-center justify-center relative">
            <div className="w-2.5 h-px bg-[#041627]"></div>
            <div className="w-px h-2.5 bg-[#041627] absolute"></div>
          </div>
        } 
      />
      <CardBody className="p-4 gap-4">
        {/* Tổng số chỗ */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex-between">
            <span className="text-body text-[#44474c]">Tổng số chỗ</span>
            <span className="text-body-strong text-[#041627]">{status.totalCapacity.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-[#041627] rounded-full"></div>
        </div>

        {/* Hiện đang đỗ */}
        <div className="flex flex-col gap-1 w-full">
          <div className="flex-between">
            <span className="text-body text-[#44474c]">Hiện đang đỗ ({status.parkedPercentage}%)</span>
            <span className="text-body-strong text-[#ba1a1a]">{status.currentlyParked.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-[#efedef] rounded-full overflow-hidden">
            <div className="h-full bg-[#ba1a1a]" style={{ width: `${status.parkedPercentage}%` }}></div>
          </div>
        </div>

        {/* Còn trống */}
        <div className="flex flex-col gap-1 w-full pb-2 border-b border-dashed border-[#e9e7e9]">
          <div className="flex-between">
            <span className="text-body text-[#44474c]">Còn trống</span>
            <span className="text-body-strong text-[#4edea3]">{status.availableSpots.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-[#efedef] rounded-full overflow-hidden">
            <div className="h-full bg-[#4edea3]" style={{ width: `${100 - status.parkedPercentage}%` }}></div>
          </div>
        </div>

        {/* Xe VIP */}
        <div className="flex-between w-full pt-1">
          <div className="flex items-center gap-2">
            <div className="text-[#fbbd23]">★</div>
            <span className="text-body text-[#44474c]">Xe VIP hiện diện</span>
          </div>
          <span className="text-body-strong text-[#041627]">{status.vipVehicles}</span>
        </div>
      </CardBody>
    </Card>
  );
};
