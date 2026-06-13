import { Card, CardHeader, CardBody } from "../common/Card";

export const ActivityLogCard = ({ activities, loading }) => {
  return (
    <Card noPadding>
      <CardHeader 
        title="Hoạt động vào/ra" 
        action={
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-lg">⏱</span>
          </div>
        }
      />
      <CardBody className="pb-2">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#0058be] border-t-transparent rounded-full animate-spin my-8"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center w-full">Không có dữ liệu</div>
        ) : (
          <div className="flex flex-col w-full">
            {activities.map((activity, index) => (
              <div key={activity.id} className={`flex items-start justify-between p-4 w-full ${index > 0 ? "border-t border-[#e9e7e9]" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 flex-center rounded ${activity.isVip ? 'bg-[#fef3c7] text-[#f59e0b]' : 'bg-[#e0f2fe] text-[#0284c7]'}`}>
                    {activity.status === 'Vào' ? '→]' : '[←'}
                    {activity.isVip && <span className="absolute -top-1 -right-1 text-[10px]">★</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-strong text-[#041627]">{activity.plateNumber}</span>
                    <span className="text-caption text-[#74777d]">{activity.vehicleType} • {activity.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-caption text-[#44474c]">{activity.time}</span>
                  <span className={`text-caption-bold ${activity.status === 'Vào' ? 'text-[#00a572]' : 'text-[#ba1a1a]'}`}>{activity.status}</span>
                </div>
              </div>
            ))}
            
            <div className="w-full p-4 border-t border-[#e9e7e9] flex-center">
              <button type="button" className="text-caption-strong text-[#0058be] hover:underline focus:outline-none">
                Xem tất cả lịch sử
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
