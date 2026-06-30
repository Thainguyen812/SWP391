import { useState } from "react";
import { EditOutlined, UnlockOutlined } from "@ant-design/icons";
import { Modal, Table, Checkbox, notification } from "antd";

export const SecurityRBAC = ({ data = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: 'Phân hệ / Chức năng',
      dataIndex: 'module',
      key: 'module',
      fixed: 'left',
      width: 180,
      render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: 'Super Admin',
      dataIndex: 'superAdmin',
      key: 'superAdmin',
      align: 'center',
      render: () => <Checkbox checked disabled />, // Always checked and disabled
    },
    {
      title: 'Quản lý Cơ sở',
      dataIndex: 'manager',
      key: 'manager',
      align: 'center',
      render: (checked) => <Checkbox defaultChecked={checked} />,
    },
    {
      title: 'Kế toán',
      dataIndex: 'accountant',
      key: 'accountant',
      align: 'center',
      render: (checked) => <Checkbox defaultChecked={checked} />,
    },
    {
      title: 'Nhân viên Bãi xe',
      dataIndex: 'staff',
      key: 'staff',
      align: 'center',
      render: (checked) => <Checkbox defaultChecked={checked} />,
    },
  ];

  const dataSource = [
    { key: '1', module: 'Quản lý Khách hàng', manager: true, accountant: false, staff: true },
    { key: '2', module: 'Nhân sự & Ca trực', manager: true, accountant: false, staff: false },
    { key: '3', module: 'Báo cáo Doanh thu', manager: true, accountant: true, staff: false },
    { key: '4', module: 'Giám sát Bãi xe', manager: true, accountant: false, staff: true },
    { key: '5', module: 'Nhật ký Hệ thống', manager: true, accountant: false, staff: false },
    { key: '6', module: 'Cấu hình Thiết bị', manager: false, accountant: false, staff: false },
    { key: '7', module: 'Bảo mật Hệ thống', manager: false, accountant: false, staff: false },
  ];

  const handleSave = () => {
    notification.success({
      message: 'Cập nhật phân quyền thành công',
      description: 'Chính sách truy cập RBAC đã được áp dụng cho toàn hệ thống.',
      placement: 'topRight'
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UnlockOutlined className="text-blue-600 text-lg" />
            <h2 className="text-base font-bold text-slate-800">Kiểm soát Truy cập (RBAC)</h2>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
          >
            <EditOutlined />
          </button>
        </div>

        <div className="p-5 flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
            <span>Vai trò</span>
            <span>Tài khoản</span>
          </div>

          <div className="space-y-1">
            {data.map((role, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${role.color}`}></div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{role.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full text-center text-xs font-bold text-blue-600 uppercase tracking-wider py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Quản lý phân quyền chi tiết
          </button>
        </div>
      </div>

      <Modal
        title="Quản lý Phân quyền chi tiết (RBAC Matrix)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        width={800}
        okText="Lưu phân quyền"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#1677ff]" }}
      >
        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-4">
            Tích chọn để cấp quyền truy cập vào các phân hệ tương ứng cho từng nhóm vai trò. Quyền của Super Admin được cấp mặc định và không thể thay đổi.
          </p>
          <Table 
            columns={columns} 
            dataSource={dataSource} 
            pagination={false}
            scroll={{ x: 700 }}
            bordered
            size="middle"
          />
        </div>
      </Modal>
    </>
  );
};
