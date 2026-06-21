import { useState, useEffect } from "react";
import { SearchOutlined, CalendarOutlined, UserAddOutlined } from "@ant-design/icons";
import { notification, Modal, Form, Input, Select, DatePicker } from "antd";
import { PageLayout } from '../../common/PageLayout';
import { personnelService } from '../../../services/personnelService';

import { PersonnelList } from "./Personnel_List";
import { PersonnelShiftSchedule } from "./Personnel_ShiftSchedule";
import { PersonnelHandoverLog } from "./Personnel_HandoverLog";

const { Option } = Select;

export const PersonnelMain = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [handover, setHandover] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modals state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [empData, shiftData, handoverData] = await Promise.all([
          personnelService.getPersonnelList(),
          personnelService.getTodayShifts(),
          personnelService.getLatestHandover()
        ]);
        
        setEmployees(empData);
        setShifts(shiftData);
        setHandover(handoverData);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu nhân sự:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchKeyword.trim()) return true;
    const lowerKey = searchKeyword.toLowerCase();
    return emp.name.toLowerCase().includes(lowerKey) || 
           emp.role.toLowerCase().includes(lowerKey);
  });

  // Handlers for Add Employee Modal
  const handleAddEmployee = () => {
    setIsAddModalVisible(true);
  };

  const handleAddSubmit = (values) => {
    notification.success({
      message: 'Thêm nhân viên thành công',
      description: `Nhân viên ${values.name} đã được thêm vào hệ thống.`,
      placement: 'topRight',
    });
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  // Handlers for Schedule Shift Modal
  const handleScheduleShift = () => {
    setIsScheduleModalVisible(true);
  };

  const handleScheduleSubmit = (values) => {
    notification.success({
      message: 'Sắp xếp ca thành công',
      description: `Đã cập nhật lịch trực mới cho nhân viên.`,
      placement: 'topRight',
    });
    setIsScheduleModalVisible(false);
    scheduleForm.resetFields();
  };

  return (
    <>
      <PageLayout
        title="Quản lý Nhân sự & Ca trực"
        subtitle="Cơ sở: Trung tâm thương mại Vincom Center (Cơ sở 01)"
        actions={
          <>
            <div className="relative mr-2">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhân viên..." 
                value={searchKeyword}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 border border-[#e2e8f0] dark:border-slate-600 rounded-md text-sm focus:outline-none focus:border-[#1677ff] dark:focus:border-blue-500 w-64 placeholder-[#94a3b8] dark:placeholder-slate-400 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              />
            </div>
            <button 
              onClick={handleScheduleShift}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-slate-200 shadow-sm"
            >
              <CalendarOutlined />
              Sắp xếp ca
            </button>
            <button 
              onClick={handleAddEmployee}
              className="flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <UserAddOutlined />
              Thêm nhân viên
            </button>
          </>
        }
      >
        <div className="flex gap-6 w-full items-start">
          {/* Left Column: Personnel List & Tabs */}
          <div className="flex-[3] flex flex-col min-w-0">
            <PersonnelList employees={filteredEmployees} loading={loading} />
          </div>

          {/* Right Column: Shifts & Handover */}
          <div className="flex-[2] flex flex-col gap-6 min-w-[360px] sticky top-0">
            <PersonnelShiftSchedule data={shifts} loading={loading} />
            <PersonnelHandoverLog data={handover} loading={loading} />
          </div>
        </div>
      </PageLayout>

      {/* Add Employee Modal */}
      <Modal
        title="Thêm nhân viên mới"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => addForm.submit()}
        okText="Thêm nhân viên"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#1677ff]" }}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit} className="mt-4">
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Nhập họ và tên nhân viên" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="role" label="Vai trò / Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder="Chọn vai trò">
              <Option value="Bảo vệ cổng">Bảo vệ cổng</Option>
              <Option value="Tuần tra">Tuần tra bãi xe</Option>
              <Option value="Kỹ thuật">Kỹ thuật viên</Option>
              <Option value="Quản lý ca">Quản lý ca</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Khu vực trực mặc định">
            <Select placeholder="Chọn khu vực">
              <Option value="Cổng 01 (Vào)">Cổng 01 (Vào)</Option>
              <Option value="Cổng 02 (Ra)">Cổng 02 (Ra)</Option>
              <Option value="Tầng hầm B1">Tầng hầm B1</Option>
              <Option value="Tầng hầm B2">Tầng hầm B2</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Shift Modal */}
      <Modal
        title="Sắp xếp ca trực"
        open={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        onOk={() => scheduleForm.submit()}
        okText="Lưu lịch trực"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#1677ff]" }}
      >
        <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleSubmit} className="mt-4">
          <Form.Item name="employee" label="Chọn nhân viên" rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}>
            <Select placeholder="Chọn nhân viên" showSearch optionFilterProp="children">
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Ngày trực" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="shift" label="Ca trực" rules={[{ required: true, message: 'Vui lòng chọn ca!' }]}>
            <Select placeholder="Chọn ca trực">
              <Option value="morning">Ca Sáng (06:00 - 14:00)</Option>
              <Option value="afternoon">Ca Chiều (14:00 - 22:00)</Option>
              <Option value="night">Ca Đêm (22:00 - 06:00)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Trạm / Cổng trực">
            <Select placeholder="Chọn khu vực phân công">
              <Option value="Cổng 01 (Vào)">Cổng 01 (Vào)</Option>
              <Option value="Cổng 02 (Ra)">Cổng 02 (Ra)</Option>
              <Option value="Tầng hầm B1">Tầng hầm B1</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
