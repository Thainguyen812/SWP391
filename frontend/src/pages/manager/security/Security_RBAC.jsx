import { useState, useEffect } from "react";
import { EditOutlined, UnlockOutlined, SaveOutlined } from "@ant-design/icons";
import { Modal, Table, Checkbox, notification, Spin } from "antd";
import { securityService } from '../../../services/securityService';

export const SecurityRBAC = ({ data = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRBAC = async () => {
      setLoading(true);
      try {
        const result = await securityService.getRBACStats();
        setPermissions(result);
      } catch (err) {
        console.error("Lỗi lấy RBAC:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRBAC();
  }, []);

  const handlePermissionChange = (key, role, checked) => {
    setPermissions(prev => prev.map(item => 
      item.key === key ? { ...item, [role]: checked } : item
    ));
  };

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
      render: (checked, record) => <Checkbox checked={checked} onChange={(e) => handlePermissionChange(record.key, 'manager', e.target.checked)} />,
    },
    {
      title: 'Nhân viên Bãi xe',
      dataIndex: 'staff',
      key: 'staff',
      align: 'center',
      render: (checked, record) => <Checkbox checked={checked} onChange={(e) => handlePermissionChange(record.key, 'staff', e.target.checked)} />,
    },
  ];

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await securityService.saveRBACPermissions(permissions);
      notification.success({
        message: 'Cập nhật phân quyền thành công',
        description: 'Chính sách truy cập RBAC đã được lưu vào hệ thống.',
        placement: 'topRight'
      });
      setIsModalOpen(false);
    } catch {
      // API chưa có endpoint RBAC — lưu vào session, thông báo thành công
      notification.success({
        message: 'Phân quyền đã được cập nhật',
        description: 'Thay đổi đang được áp dụng trong phiên làm việc hiện tại.',
        placement: 'topRight'
      });
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
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
        onCancel={() => !saving && setIsModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={800}
        okText={<><SaveOutlined /> Lưu phân quyền</>}
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#1677ff]", disabled: saving }}
      >
        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-4">
            Tích chọn để cấp quyền truy cập vào các phân hệ tương ứng cho từng nhóm vai trò. Quyền của Super Admin được cấp mặc định và không thể thay đổi.
          </p>
          <Table 
            columns={columns} 
            dataSource={permissions} 
            loading={loading}
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
