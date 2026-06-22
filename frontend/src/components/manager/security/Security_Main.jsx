import { useState, useEffect } from "react";
import { WarningFilled, DownloadOutlined, SaveOutlined } from "@ant-design/icons";
import { notification, Modal } from "antd";
import { SecurityPolicies } from "./Security_Policies";
import { SecurityRBAC } from "./Security_RBAC";
import { SecurityLogs } from "./Security_Logs";
import { securityService } from '../../../services/securityService';

export const SecurityMain = () => {
  const [policies, setPolicies] = useState(null);
  const [rbacStats, setRbacStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [polData, rbacData, logData] = await Promise.all([
          securityService.getSecurityPolicies(),
          securityService.getRBACStats(),
          securityService.getSecurityLogs()
        ]);
        setPolicies(polData);
        setRbacStats(rbacData);
        setLogs(logData);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu bảo mật:", err);
        notification.error({ message: "Không thể lấy dữ liệu bảo mật" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePolicyChange = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await securityService.saveSecurityPolicies(policies);
      if (res.success) {
        notification.success({ 
          message: 'Lưu thành công', 
          description: 'Chính sách bảo mật đã được cập nhật.',
          placement: 'topRight' 
        });
      }
    } catch (err) {
      notification.error({ message: "Lỗi khi lưu cấu hình bảo mật" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f8fafc] dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#f8fafc] dark:bg-slate-900 overflow-y-auto overflow-x-hidden transition-colors custom-scrollbar pb-6">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bảo mật Hệ thống
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Quản lý chính sách an toàn, quyền truy cập và giám sát cảnh báo toàn cục.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                notification.success({
                  message: "Xuất báo cáo thành công",
                  description: "Tệp báo cáo bảo mật hệ thống đã được tải xuống.",
                  placement: "topRight"
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <DownloadOutlined />
              Xuất Báo Cáo
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <SaveOutlined />
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-8 flex items-start justify-between">
          <div className="flex gap-3">
            <WarningFilled className="text-red-500 text-lg mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Phát hiện 3 lần đăng nhập thất bại liên tiếp
              </h3>
              <p className="text-sm text-slate-600">
                Tài khoản "nhanvien_bx02" từ IP 192.168.1.45. Cần xác minh ngay.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              Modal.warning({
                title: 'Chi tiết cảnh báo an ninh',
                content: (
                  <div className="mt-4">
                    <p><b>Tài khoản:</b> nhanvien_bx02</p>
                    <p><b>IP Truy cập:</b> 192.168.1.45</p>
                    <p><b>Thời gian:</b> Vừa xong</p>
                    <p className="mt-2 text-red-600">Đã tạm khóa tài khoản để đảm bảo an toàn. Vui lòng liên hệ nhân sự để cấp lại mật khẩu.</p>
                  </div>
                ),
                okText: 'Đã xử lý',
              });
            }}
            className="text-xs font-bold text-red-600 uppercase tracking-wider mt-1 hover:text-red-700 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Policies) - takes 7 columns */}
          <div className="lg:col-span-7">
            <SecurityPolicies policies={policies} onChange={handlePolicyChange} />
          </div>

          {/* Right Column (RBAC & Logs) - takes 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1">
              <SecurityRBAC data={rbacStats} />
            </div>
            <div className="flex-1">
              <SecurityLogs data={logs} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
