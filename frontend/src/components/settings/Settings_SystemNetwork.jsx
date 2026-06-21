import { DatabaseOutlined, ClusterOutlined, InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Card } from "../common/Card";

export const SettingsSystemNetwork = ({ data, onChange }) => {
  if (!data) return null;

  return (
    <Card className="w-full flex flex-col p-6 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg h-full">
      
      <div className="flex items-start gap-8 h-full">
        {/* Network Inputs */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f1f5f9] dark:bg-slate-700 text-[#475569] dark:text-slate-300 rounded-lg mb-2">
            <DatabaseOutlined className="text-xl" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">IP Local Máy chủ</span>
            <div className="flex items-center w-full relative">
              <ClusterOutlined className="absolute left-3 text-[#94a3b8] dark:text-slate-500" />
              <input 
                type="text"
                value={data.network.ipServer}
                onChange={(e) => onChange('network', 'ipServer', e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#d9d9d9] dark:border-slate-600 rounded text-sm text-[#334155] dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:border-[#1677ff] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">Subnet Mask</span>
            <input 
              type="text"
              value={data.network.subnetMask}
              onChange={(e) => onChange('network', 'subnetMask', e.target.value)}
              className="w-full px-4 py-2 border border-[#d9d9d9] dark:border-slate-600 rounded text-sm text-[#334155] dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:border-[#1677ff] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#475569] dark:text-slate-300 font-medium">Gateway</span>
            <input 
              type="text"
              value={data.network.gateway}
              onChange={(e) => onChange('network', 'gateway', e.target.value)}
              className="w-full px-4 py-2 border border-[#d9d9d9] dark:border-slate-600 rounded text-sm text-[#334155] dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:border-[#1677ff] transition-colors"
            />
          </div>
        </div>

        {/* Firmware Section */}
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-slate-900/50 p-5 rounded-lg border border-[#e2e8f0] dark:border-slate-700/50">
          <h4 className="font-bold text-[#041627] dark:text-slate-200 mb-4">
            Phiên bản Hệ thống<br/>(Firmware)
          </h4>
          
          <div className="flex items-center gap-2 mb-2">
            <SettingOutlined className="text-[#64748b] dark:text-slate-400 text-lg" />
            <span className="font-mono font-medium text-[#334155] dark:text-slate-300">
              {data.firmware.currentVersion}
            </span>
          </div>
          
          <span className="text-xs text-[#64748b] dark:text-slate-400 mb-6">
            Cập nhật lần cuối: {data.firmware.lastUpdated}
          </span>

          {data.firmware.hasUpdate && (
            <div className="mt-auto flex flex-col gap-2 p-3 bg-[#f0f6ff] dark:bg-blue-900/20 rounded border border-[#bae0ff] dark:border-blue-800/50">
              <div className="flex gap-2">
                <InfoCircleOutlined className="text-[#1677ff] mt-0.5" />
                <p className="text-sm text-[#0958d9] dark:text-blue-300 m-0">
                  Đã có phiên bản mới ({data.firmware.newVersion}). {data.firmware.updateNotes}
                </p>
              </div>
              <button className="text-left text-sm font-medium text-[#1677ff] hover:text-[#0058be] transition-colors mt-2">
                Tiến hành cập nhật
              </button>
            </div>
          )}
        </div>
      </div>

    </Card>
  );
};
