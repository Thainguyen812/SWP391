import { ArrowRightOutlined } from "@ant-design/icons";
import { Card } from "../common/Card";

export const PersonnelShiftSchedule = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="w-full flex-1">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card className="w-full flex flex-col p-5 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg mb-6">
      <div className="w-full flex items-center justify-between mb-4 pb-2">
        <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100">
          Phân ca hôm nay (14/11)
        </h3>
        <button className="text-sm font-medium text-[#1677ff] hover:text-[#0058be] flex items-center gap-1 transition-colors">
          Chi tiết tuần <ArrowRightOutlined className="text-xs" />
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e9e7e9] dark:border-slate-700">
              <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider">Trạm / Cổng</th>
              <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider text-center">
                <div className="flex flex-col">
                  <span>Ca Sáng</span>
                  <span className="text-[10px] font-normal">06:00-14:00</span>
                </div>
              </th>
              <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider text-center">
                <div className="flex flex-col">
                  <span>Ca Chiều</span>
                  <span className="text-[10px] font-normal">14:00-22:00</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((shift, index) => (
              <tr key={index} className="border-b border-[#f1f5f9] dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="py-3 px-2 text-sm font-semibold text-[#334155] dark:text-slate-300">
                  {shift.location}
                </td>
                <td className="py-3 px-2 text-sm text-[#475569] dark:text-slate-400 text-center">
                  <span className="flex items-center justify-center gap-1.5">
                    {shift.morning !== 'Trống ca' ? (
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ) : null}
                    {shift.morning}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-[#475569] dark:text-slate-400 text-center">
                   <span className={`flex items-center justify-center gap-1.5 ${shift.afternoon === 'Trống ca' ? 'text-amber-500 dark:text-amber-400 font-medium' : ''}`}>
                    {shift.afternoon !== 'Trống ca' && shift.afternoon ? (
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ) : null}
                    {shift.afternoon}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
