import { SecurityScanOutlined } from "@ant-design/icons";
import { Card } from '../../common/Card';
import { Switch } from "antd";

export const SettingsBarrier = ({ data, onChange }) => {
  if (!data) return null;

  return (
    <Card className="w-full flex flex-col p-6 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e9e7e9] dark:border-slate-700">
        <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-[#fff1f0] dark:bg-red-900/30 text-[#ff4d4f] rounded-lg">
            <SecurityScanOutlined className="text-xl" />
          </div>
          Kiểm soát Barrier
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">
            Tốc độ nâng/hạ cần (Giây)
          </span>
          <div className="flex items-center gap-3">
            {['1.5s', '3.0s', '6.0s'].map((speed) => (
              <button
                key={speed}
                onClick={() => onChange('barrier', 'speed', speed)}
                className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                  data.speed === speed
                    ? 'border-[#1677ff] text-[#1677ff] bg-[#f0f6ff] dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-[#d9d9d9] text-[#64748b] bg-white hover:border-[#1677ff] hover:text-[#1677ff] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">
            Độ trễ đóng tự động (Auto-close)
          </span>
          <div className="flex items-center w-full relative">
            <input 
              type="number"
              value={data.autoCloseDelay}
              onChange={(e) => onChange('barrier', 'autoCloseDelay', Number(e.target.value))}
              className="w-full pl-4 pr-12 py-2 border border-[#d9d9d9] dark:border-slate-600 rounded text-sm text-[#334155] dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:border-[#1677ff] transition-colors"
            />
            <span className="absolute right-4 text-sm text-[#94a3b8] dark:text-slate-500">giây</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-dashed border-[#e9e7e9] dark:border-slate-700">
          <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">
            Chống va đập (Anti-crash)
          </span>
          <Switch 
            checked={data.antiCrash}
            onChange={(checked) => onChange('barrier', 'antiCrash', checked)}
            checkedChildren="BẬT"
            unCheckedChildren="TẮT"
          />
        </div>
      </div>
    </Card>
  );
};
