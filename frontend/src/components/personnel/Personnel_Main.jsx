import { useState, useEffect } from "react";
import { SearchOutlined, CalendarOutlined, UserAddOutlined } from "@ant-design/icons";
import { PageLayout } from "../common/PageLayout";
import { personnelService } from "../../services/personnelService";

import { PersonnelList } from "./Personnel_List";
import { PersonnelShiftSchedule } from "./Personnel_ShiftSchedule";
import { PersonnelHandoverLog } from "./Personnel_HandoverLog";

export const PersonnelMain = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [handover, setHandover] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [empData, shiftData, handoverData] = await Promise.all([
          personnelService.getPersonnelList(),
          personnelService.getTodayShifts(),
          personnelService.getLatestHandover()
        ]);
        
        setEmployees(empData);
        setShifts(shiftData);
        setHandover(handoverData);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu nhân sự:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchKeyword.trim()) return true;
    const lowerKey = searchKeyword.toLowerCase();
    return emp.name.toLowerCase().includes(lowerKey) || 
           emp.role.toLowerCase().includes(lowerKey);
  });

  return (
    <PageLayout
      title="Quản lý Nhân sự & Ca trực"
      subtitle="Cơ sở: Trung tâm thương mại Vincom Center (Cơ sở 01)"
      actions={
        <>
          <div className="relative mr-2">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              value={searchKeyword}
              onChange={handleSearchChange}
              className="pl-9 pr-4 py-2 border border-[#e2e8f0] dark:border-slate-600 rounded-md text-sm focus:outline-none focus:border-[#1677ff] dark:focus:border-blue-500 w-64 placeholder-[#94a3b8] dark:placeholder-slate-400 bg-white dark:bg-slate-800 dark:text-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-slate-200 shadow-sm">
            <CalendarOutlined />
            Sắp xếp ca
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <UserAddOutlined />
            Thêm nhân viên
          </button>
        </>
      }
    >
      <div className="flex gap-6 w-full items-start">
        {/* Left Column: Personnel List & Tabs */}
        <div className="flex-[3] flex flex-col min-w-0">
          <PersonnelList employees={filteredEmployees} loading={loading} />
        </div>

        {/* Right Column: Shifts & Handover */}
        <div className="flex-[2] flex flex-col gap-6 min-w-[360px] sticky top-0">
          <PersonnelShiftSchedule data={shifts} loading={loading} />
          <PersonnelHandoverLog data={handover} loading={loading} />
        </div>
      </div>
    </PageLayout>
  );
};
