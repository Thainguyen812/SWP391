import { WifiOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Card } from "../common/Card";

export const SettingsSensors = ({ data, onChange }) => {
  if (!data) return null;

  return (
    <Card className="w-full flex flex-col p-6 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e9e7e9] dark:border-slate-700">
        <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-[#f0f5ff] dark:bg-blue-900/20 text-[#2f54eb] rounded-lg">
            <WifiOutlined className="text-xl" />
          </div>
          Vòng từ & Cảm biến
        </h3>
      </div>

      <div className="flex flex-col gap-5">
        {/* Làn VÀO */}
        <div className="flex flex-col p-4 border border-[#e9e7e9] dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-[#041627] dark:text-slate-200 text-sm">
              Loop Làn VÀO (Detector 1)
            </span>
            {data.loopIn.active && <CheckCircleFilled className="text-emerald-500" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#64748b] dark:text-slate-400">Tần số:</span>
            <select 
              value={data.loopIn.frequency}
              onChange={(e) => onChange('sensors', 'loopIn.frequency', e.target.value)}
              className="w-40 px-3 py-1.5 border border-[#d9d9d9] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm text-[#334155] dark:text-slate-200 focus:outline-none focus:border-[#1677ff]"
            >
              <option value="low">Thấp (Low)</option>
              <option value="medium">Trung bình (Medium)</option>
              <option value="high">Cao (High)</option>
            </select>
          </div>
        </div>

        {/* Làn RA */}
        <div className="flex flex-col p-4 border border-[#e9e7e9] dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-[#041627] dark:text-slate-200 text-sm">
              Loop Làn RA (Detector 2)
            </span>
            {data.loopOut.active && <CheckCircleFilled className="text-emerald-500" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#64748b] dark:text-slate-400">Tần số:</span>
            <select 
              value={data.loopOut.frequency}
              onChange={(e) => onChange('sensors', 'loopOut.frequency', e.target.value)}
              className="w-40 px-3 py-1.5 border border-[#d9d9d9] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-sm text-[#334155] dark:text-slate-200 focus:outline-none focus:border-[#1677ff]"
            >
              <option value="low">Thấp (Low)</option>
              <option value="medium">Trung bình (Medium)</option>
              <option value="high">Cao (High)</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};
