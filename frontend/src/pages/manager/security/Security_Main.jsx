import { useState, useEffect } from "react";
import { WarningFilled, DownloadOutlined, SaveOutlined } from "@ant-design/icons";
import { notification, Modal } from "antd";
import { SecurityPolicies } from "./Security_Policies";
import { SecurityRBAC } from "./Security_RBAC";
import { SecurityLogs } from "./Security_Logs";
import { securityService } from '../../../services/securityService';
import { PageLayout } from '../../../components/common/PageLayout';
import { exportToCSV } from '../../../utils/exportUtils';
import dayjs from 'dayjs';

export const SecurityMain = () => {
  const [policies, setPolicies] = useState(null);
  const [rbacStats, setRbacStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [polData, rbacData, logData, alertsData] = await Promise.all([
          securityService.getSecurityPolicies(),
          securityService.getRBACStats(),
          securityService.getSecurityLogs(),
          securityService.getSecurityAlerts()
        ]);
        setPolicies(polData);
        setRbacStats(rbacData);
        setLogs(logData);
        setAlerts(alertsData);
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

  const warningLog = alerts && alerts.length > 0 ? alerts[0] : logs.find(l => l.type === 'warning');

  return (
    <PageLayout
      title="Bảo mật Hệ thống"
      subtitle="Quản lý chính sách an toàn, quyền truy cập và giám sát cảnh báo toàn cục."
      actions={
        <>
          <button 
            onClick={() => {
              exportToCSV(logs, `Bao_cao_bao_mat_${dayjs().format('YYYY-MM-DD')}.csv`, {
                id: 'Mã log',
                type: 'Loại',
                content: 'Nội dung',
                time: 'Thời gian'
              });
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
            className={`flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] text-white text-sm font-bold rounded-lg transition-colors shadow-sm ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <SaveOutlined />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Alert Banner */}
        {warningLog && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start justify-between">
            <div className="flex gap-3">
              <WarningFilled className="text-red-500 text-lg mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Phát hiện cảnh báo an ninh
                </h3>
                <p className="text-sm text-slate-600">
                  {warningLog.content || warningLog.reason}
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                Modal.warning({
                  title: 'Chi tiết cảnh báo an ninh',
                  content: (
                    <div className="mt-4">
                      <p><b>Nội dung:</b> {warningLog.content || warningLog.reason}</p>
                      <p><b>Thời gian:</b> {warningLog.time}</p>
                      <p><b>Vị trí/Biển số:</b> {warningLog.plate || 'N/A'}</p>
                      <p className="mt-2 text-red-600">Hệ thống đã ghi nhận cảnh báo. Vui lòng kiểm tra chi tiết để đảm bảo an toàn.</p>
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
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
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
    </PageLayout>
  );
};
