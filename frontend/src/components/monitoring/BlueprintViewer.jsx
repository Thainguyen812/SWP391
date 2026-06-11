import { Card } from "../common/Card";

export const BlueprintViewer = ({ selectedBranch, onChangeBranch, selectedFloor, onChangeFloor }) => {
  return (
    <Card noPadding className="h-full flex flex-col">
      {/* Top Controls */}
      <div className="flex items-center gap-4 p-4 border-b border-[#e9e7e9]">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-[#44474c] pointer-events-none">🏢</span>
          <select 
            className="appearance-none pl-9 pr-8 py-1.5 border border-[#c4c6cd] rounded cursor-pointer hover:bg-gray-50 text-body-strong text-[#1b1c1d] focus:outline-none"
            value={selectedBranch}
            onChange={(e) => onChangeBranch(e.target.value)}
          >
            <option value="HQ">Cơ sở chính (HQ)</option>
            <option value="BR2">Cơ sở 02</option>
          </select>
          <span className="absolute right-3 text-[#44474c] text-xs pointer-events-none">▼</span>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-[#44474c] pointer-events-none">📚</span>
          <select 
            className="appearance-none pl-9 pr-8 py-1.5 border border-[#c4c6cd] rounded cursor-pointer hover:bg-gray-50 text-body-strong text-[#1b1c1d] focus:outline-none"
            value={selectedFloor}
            onChange={(e) => onChangeFloor(e.target.value)}
          >
            <option value="T1">Tầng 1 (Trệt)</option>
            <option value="B1">Tầng hầm B1</option>
            <option value="B2">Tầng hầm B2</option>
          </select>
          <span className="absolute right-3 text-[#44474c] text-xs pointer-events-none">▼</span>
        </div>
      </div>

      {/* Blueprint Image Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#f8fafc] overflow-hidden relative">
        <div className="w-full max-w-3xl border border-[#e9e7e9] bg-white rounded shadow-sm relative p-2">
          {/* Placeholder cho Sơ đồ bãi xe. Khi có ảnh thật sẽ thay URL vào src */}
          <img 
            src={`https://placehold.co/800x400/e2e8f0/64748b?text=SMART+PARKING+BLUEPRINT+LEVEL+${selectedFloor}`} 
            alt={`Smart Parking Blueprint Level ${selectedFloor}`} 
            className="w-full h-auto object-contain rounded"
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white px-4 py-2 rounded shadow border border-[#e9e7e9]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4edea3] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c]">CÒN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ba1a1a] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c]">ĐÃ ĐỖ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#fbbd23] rounded-sm"></div>
              <span className="text-caption-bold text-[#44474c]">XE VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#e2e8f0] rounded-sm border border-[#cbd5e1]"></div>
              <span className="text-caption-bold text-[#44474c]">BẢO TRÌ</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
