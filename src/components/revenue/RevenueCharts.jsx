import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const RevenueCharts = ({ barData, pieData, totalVehicleRevenue }) => {
  if (!barData || !pieData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Bar Chart - 30 days */}
      <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 rounded-lg shadow-sm p-6 flex flex-col transition-colors">
        <div className="flex-between w-full mb-6">
          <h3 className="text-h3 text-[#041627] dark:text-slate-100 transition-colors">Biểu đồ doanh thu 30 ngày</h3>
          <div className="flex border border-[#e9e7e9] dark:border-slate-600 rounded bg-[#f8fafc] dark:bg-slate-700 p-0.5 transition-colors">
            <button className="px-3 py-1 bg-white dark:bg-slate-800 shadow-sm rounded text-caption-strong text-[#041627] dark:text-white transition-colors">Doanh thu</button>
            <button className="px-3 py-1 text-caption text-[#44474c] dark:text-slate-400 hover:text-[#041627] dark:hover:text-white transition-colors">Lượt xe</button>
          </div>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#1677ff" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart - Vehicle types */}
      <div className="bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 rounded-lg shadow-sm p-6 flex flex-col transition-colors">
        <h3 className="text-h3 text-[#041627] dark:text-slate-100 mb-2 transition-colors">Cơ cấu loại phương tiện</h3>
        
        <div className="flex-1 w-full h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={65}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner text for Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-caption text-[#64748b] dark:text-slate-400">Tổng</span>
            <span className="text-xl font-bold text-[#041627] dark:text-white">{totalVehicleRevenue}</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-col gap-3 mt-2">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-caption-strong text-[#44474c] dark:text-slate-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-caption text-[#041627] dark:text-white font-semibold">{item.value}M</span>
                <span className="text-caption text-[#64748b] dark:text-slate-400 w-8 text-right">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
