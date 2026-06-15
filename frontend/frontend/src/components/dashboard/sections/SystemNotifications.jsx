import { Card, CardHeader, CardBody } from "../common/Card";
import { Badge } from "../common/Badge";

export const SystemNotifications = ({ notifications, loading }) => {
  return (
    <Card noPadding>
      <CardHeader 
        title="Thông báo hệ thống" 
        action={
          <Badge type="danger">2 QUAN TRỌNG</Badge>
        }
      />
      <CardBody className="p-4 gap-4">
        {notifications.length === 0 && !loading && (
          <div className="p-4 text-gray-500 text-sm text-center w-full">Không có thông báo</div>
        )}
        {notifications.map((notification, index) => (
          <div key={index} className={notification.containerClassName}>
            <div className="pt-1">
              {notification.icon}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <p className="text-body-strong text-[#1b1c1d]">{notification.title}</p>
              <p className="text-body text-[#44474c]">{notification.description}</p>
              
              <div className="flex items-center gap-3 mt-1">
                <span className="text-caption-bold text-[#74777d]">{notification.time}</span>
                {notification.actionLabel && (
                  <button type="button" className="text-caption-bold text-[#0058be] hover:underline focus:outline-none">
                    {notification.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
