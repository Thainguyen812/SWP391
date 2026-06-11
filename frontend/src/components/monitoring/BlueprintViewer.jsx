import { Card } from "../common/Card";
import { BankOutlined, DownOutlined, BookOutlined } from "@ant-design/icons";

export const BlueprintViewer = ({ selectedBranch, onChangeBranch, selectedFloor, onChangeFloor }) => {
  return (
    <Card noPadding className="h-full flex flex-col bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
      {/* Top Controls */}
      <div className="flex items-center gap-4 p-4 border-b border-[#e9e7e9] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/50 transition-colors">
        <div className="relative flex items-center">
          <BankOutlined className="absolute left-3 text-[#44474c] dark:text-slate-400 pointer-events-none" />
          <select 
            className="appearance-none pl-9 pr-8 py-1.5 border border-[#c4c6cd] dark:border-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-body-strong text-[#1b1c1d] dark:text-slate-200 focus:outline-none bg-transparent transition-colors"
            value={selectedBranch}
            onChange={(e) => onChangeBranch(e.target.value)}
          >
            <option value="HQ" className="dark:bg-slate-800">Cơ sở chính (HQ)</option>
            <option value="BR2" className="dark:bg-slate-800">Cơ sở 02</option>
          </select>
          <DownOutlined className="absolute right-3 text-[#44474c] dark:text-slate-400 text-[10px] pointer-events-none" />
        </div>

        <div className="relative flex items-center">
          <BookOutlined className="absolute left-3 text-[#44474c] dark:text-slate-400 pointer-events-none" />
          <select 
            className="appearance-none pl-9 pr-8 py-1.5 border border-[#c4c6cd] dark:border-slate-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-body-strong text-[#1b1c1d] dark:text-slate-200 focus:outline-none bg-transparent transition-colors"
            value={selectedFloor}
            onChange={(e) => onChangeFloor(e.target.value)}
          >
            <option value="T1" className="dark:bg-slate-800">Tầng trệt (T1)</option>
            <option value="B1" className="dark:bg-slate-800">Tầng hầm B1</option>
            <option value="B2" className="dark:bg-slate-800">Tầng hầm B2</option>
          </select>
          <DownOutlined className="absolute right-3 text-[#44474c] dark:text-slate-400 text-[10px] pointer-events-none" />
        </div>
      </div>

      {/* Blueprint Image Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-slate-900 overflow-hidden relative transition-colors">
        <div className="w-full max-w-3xl border border-[#e9e7e9] dark:border-slate-700 bg-white dark:bg-slate-800 rounded shadow-sm relative p-2 transition-colors">
          {/* Placeholder cho Sơ đồ bãi xe. Khi có ảnh thật sẽ thay URL vào src */}
          <img 
            src={`https://placehold.co/800x400/e2e8f0/64748b?text=SMART+PARKING+BLUEPRINT+LEVEL+${selectedFloor}`} 
            alt={`Smart Parking Blueprint Level ${selectedFloor}`} 
            className="w-full h-auto object-contain rounded"
          />
          {/* Legend Footer */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white dark:bg-slate-800 px-4 py-2 rounded shadow border border-[#e9e7e9] dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4edea3] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c] dark:text-slate-300">CÒN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ba1a1a] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c] dark:text-slate-300">ĐÃ ĐỖ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#fbbd23] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c] dark:text-slate-300">XE VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#e2e8f0] dark:bg-slate-700 rounded-sm border border-[#cbd5e1] dark:border-slate-600"></div>
              <span className="text-caption-bold text-[#44474c] dark:text-slate-300">BẢO TRÌ</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
