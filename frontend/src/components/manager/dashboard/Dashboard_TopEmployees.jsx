import { Card, CardHeader, CardBody } from '../../common/Card';
import { useNavigate } from "react-router-dom";

export const TopEmployees = ({ employees, loading }) => {
  const navigate = useNavigate();

  return (
    <Card noPadding>
      <CardHeader 
        title="Nhân viên xuất sắc ca hiện tại" 
        action={
          <button 
            type="button" 
            onClick={() => navigate('/staff')}
            className="text-caption-bold text-[#0058be] focus:outline-none hover:underline"
          >
            Xem tất cả
          </button>
        }
      />
      <CardBody className="pb-2">
        {employees.length === 0 && !loading && (
          <div className="p-4 text-gray-500 text-sm text-center w-full">Không có dữ liệu</div>
        )}
        {employees.map((employee, index) => (
          <div key={employee.name} className={`flex items-center justify-between p-4 w-full ${index > 0 ? "border-t border-[#e9e7e9]" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex-center rounded-xl ${employee.avatarClassName}`}>
                <span className={`text-h3 ${employee.initialClassName}`}>
                  {employee.initial}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#041627] text-base">{employee.name}</span>
                <span className="text-body text-[#44474c]">{employee.role}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-body-strong text-[#041627]">{employee.count}</span>
              {employee.highlight && (
                <div className="flex items-center gap-1 mt-1">
                  {employee.highlight.icon}
                  <span className="text-micro text-[#00a572]">{employee.highlight.label}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
