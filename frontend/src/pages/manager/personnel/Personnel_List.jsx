import { useState } from "react";
import { ClockCircleOutlined, PhoneOutlined } from "@ant-design/icons";

export const PersonnelList = ({ employees, loading }) => {
  const [activeTab, setActiveTab] = useState("all");

  const filterEmployees = () => {
    if (!employees) return [];
    if (activeTab === "active") return employees.filter(e => e.status === "active");
    if (activeTab === "leave") return employees.filter(e => e.status === "leave");
    return employees;
  };

  const filteredData = filterEmployees();

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e9e7e9] dark:border-slate-700 pb-4">
        <button 
          onClick={() => setActiveTab("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all" 
            ? "bg-[#e2e8f0] dark:bg-slate-700 text-[#0f172a] dark:text-slate-100" 
            : "text-[#64748b] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setActiveTab("active")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "active" 
            ? "bg-[#e2e8f0] dark:bg-slate-700 text-[#0f172a] dark:text-slate-100" 
            : "text-[#64748b] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          Đang trực
        </button>
        <button 
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "leave" 
            ? "bg-[#e2e8f0] dark:bg-slate-700 text-[#0f172a] dark:text-slate-100" 
            : "text-[#64748b] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          Nghỉ phép
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-2 py-10 text-center text-gray-500">
            Không có dữ liệu nhân sự.
          </div>
        ) : (
          filteredData.map((emp) => {
            const isActive = emp.status === "active";
            const isLeave = emp.status === "leave";
            
            return (
              <div 
                key={emp.id} 
                className={`flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-[#e9e7e9] dark:border-slate-700 overflow-hidden relative ${!isActive && !isLeave ? 'opacity-80' : ''}`}
              >
                {/* Active Indicator Border */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                )}
                
                {/* Avatar */}
                <div className="flex-shrink-0 z-10 pl-1">
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className={`w-14 h-14 rounded object-cover ${isLeave ? 'grayscale opacity-70' : ''}`}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-base font-bold truncate ${isLeave ? 'text-[#64748b] dark:text-slate-400' : 'text-[#0f172a] dark:text-slate-100'}`}>
                      {emp.name}
                    </h4>
                    {/* Status Badge */}
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d1fae5] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider">
                        Đang trực
                      </span>
                    ) : isLeave ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f5f9] text-[#64748b] dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Nghỉ phép
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f5f9] text-[#64748b] dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Nghỉ ca
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 truncate ${isLeave ? 'text-[#94a3b8] dark:text-slate-500' : 'text-[#475569] dark:text-slate-300'}`}>
                    {emp.role}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748b] dark:text-slate-400 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <ClockCircleOutlined className={isActive ? "text-[#1677ff]" : ""} /> 
                      <span className={isLeave ? "text-amber-500 dark:text-amber-400" : ""}>{emp.time}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-1.5">
                        <PhoneOutlined /> {emp.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
