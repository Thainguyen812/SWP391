import { CameraOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { Card } from '../../common/Card';

export const SettingsCameraLPR = ({ data, onChange }) => {
  if (!data) return null;

  return (
    <Card className="w-full flex flex-col p-6 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e9e7e9] dark:border-slate-700">
        <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-[#f0f6ff] dark:bg-blue-900/30 text-[#1677ff] rounded-lg">
            <CameraOutlined className="text-xl" />
          </div>
          Camera Nhận diện biển số (LPR)
        </h3>
        {data.status === 'online' && (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-[#d1fae5] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider rounded">
            ONLINE
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Làn VÀO */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#041627] dark:text-slate-200">Làn VÀO - Cam Chính</span>
            <span className="text-sm font-medium text-[#1677ff]">IP: {data.lanVao.ip}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-[#64748b] dark:text-slate-400">
              <span>Độ nhạy nhận diện (Confidence)</span>
              <span className="font-bold text-[#334155] dark:text-slate-300">{data.lanVao.confidence}%</span>
            </div>
            {/* Custom Progress Bar */}
            <div className="w-full h-2 bg-[#e2e8f0] dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#cbd5e1] dark:bg-slate-500 rounded-full"
                style={{ width: `${data.lanVao.confidence}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-sm text-[#334155] dark:text-slate-300">Chế độ ban đêm (Hồng ngoại)</span>
            <Switch 
              checked={data.lanVao.nightMode} 
              onChange={(checked) => onChange('camera', 'lanVao.nightMode', checked)}
            />
          </div>
        </div>

        {/* Làn RA */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#041627] dark:text-slate-200">Làn RA - Cam Chính</span>
            <span className="text-sm font-medium text-[#1677ff]">IP: {data.lanRa.ip}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-[#64748b] dark:text-slate-400">
              <span>Độ nhạy nhận diện (Confidence)</span>
              <span className="font-bold text-[#334155] dark:text-slate-300">{data.lanRa.confidence}%</span>
            </div>
            {/* Custom Progress Bar */}
            <div className="w-full h-2 bg-[#e2e8f0] dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#cbd5e1] dark:bg-slate-500 rounded-full"
                style={{ width: `${data.lanRa.confidence}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-sm text-[#334155] dark:text-slate-300">Chế độ ban đêm (Hồng ngoại)</span>
            <Switch 
              checked={data.lanRa.nightMode} 
              onChange={(checked) => onChange('camera', 'lanRa.nightMode', checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
