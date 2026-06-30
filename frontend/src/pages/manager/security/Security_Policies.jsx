import { SafetyCertificateOutlined } from "@ant-design/icons";

export const SecurityPolicies = ({ policies, onChange }) => {
  if (!policies) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SafetyCertificateOutlined className="text-blue-600 text-xl" />
          <h2 className="text-lg font-bold text-slate-800">Chính sách Đăng nhập</h2>
        </div>

        {/* 2FA Section */}
        <div className="flex items-start justify-between py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Xác thực 2 Yếu tố (2FA)</h3>
            <p className="text-xs text-slate-500">Bắt buộc đối với toàn bộ nhân viên cấp Quản lý và Kỹ thuật viên hệ thống.</p>
          </div>
          <button 
            onClick={() => onChange('is2FAEnabled', !policies.is2FAEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${policies.is2FAEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${policies.is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Session Timeout */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Thời gian chờ Phiên làm việc (Session Timeout)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Desktop (Admin)</label>
              <select 
                value={policies.sessionTimeoutDesktop}
                onChange={(e) => onChange('sessionTimeoutDesktop', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 appearance-none bg-white"
              >
                <option>30 Phút</option>
                <option>1 Giờ</option>
                <option>4 Giờ</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Mobile (Staff PWA)</label>
              <select 
                value={policies.sessionTimeoutMobile}
                onChange={(e) => onChange('sessionTimeoutMobile', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 appearance-none bg-white"
              >
                <option>4 Giờ</option>
                <option>8 Giờ</option>
                <option>12 Giờ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="py-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Yêu cầu Mật khẩu</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-3">
              <span className="text-sm text-slate-700">Độ dài tối thiểu (Ký tự)</span>
              <input 
                type="number" 
                value={policies.passwordMinLength} 
                onChange={(e) => onChange('passwordMinLength', parseInt(e.target.value))}
                className="w-16 border border-slate-300 rounded-md px-2 py-1 text-sm text-center outline-none focus:border-blue-500" 
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={policies.passwordRequireSpecial} 
                onChange={(e) => onChange('passwordRequireSpecial', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
              />
              <span className="text-sm text-slate-700">Bắt buộc ký tự đặc biệt (!@#$%^&*)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={policies.passwordRequireNumber} 
                onChange={(e) => onChange('passwordRequireNumber', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
              />
              <span className="text-sm text-slate-700">Bắt buộc chữ số</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
