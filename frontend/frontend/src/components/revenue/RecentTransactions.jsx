import { SearchOutlined, FilterOutlined, ExclamationCircleOutlined, SyncOutlined, StarFilled, CreditCardOutlined } from "@ant-design/icons";

export const RecentTransactions = ({ transactions }) => {
  if (!transactions) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 rounded-lg shadow-sm flex flex-col mt-6 transition-colors">
      <div className="flex-between p-5 border-b border-[#e9e7e9] dark:border-slate-700">
        <h3 className="text-h3 text-[#041627] dark:text-slate-100">Giao dịch gần đây</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Mã GD, Biển số..." 
              className="pl-9 pr-4 py-1.5 border border-[#e2e8f0] dark:border-slate-600 rounded-md text-sm focus:outline-none focus:border-[#1677ff] dark:focus:border-blue-500 w-64 placeholder-[#94a3b8] dark:placeholder-slate-400 bg-transparent dark:text-white transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-[#e2e8f0] dark:border-slate-600 rounded-md text-sm text-[#475569] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <FilterOutlined /> Lọc
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e9e7e9] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800/50">
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Mã GD</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Thời gian</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Biển số</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Loại vé</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Số tiền</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Phương thức</th>
              <th className="py-4 px-6 text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e7e9] dark:divide-slate-700">
            {transactions.items.map((trx, idx) => {
              let statusBadge = null;
              if (trx.status === "THÀNH CÔNG") {
                statusBadge = <span className="inline-flex items-center px-2 py-1 rounded bg-[#ecfdf5] text-[#10b981] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5"></span>{trx.status}</span>;
              } else if (trx.status === "ĐÃ GHI NHẬN") {
                statusBadge = <span className="inline-flex items-center px-2 py-1 rounded bg-[#f1f5f9] text-[#64748b] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#64748b] mr-1.5"></span>{trx.status}</span>;
              } else if (trx.status === "CẦN XỬ LÝ") {
                statusBadge = (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-[#fef2f2] text-[#ef4444] text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mr-1.5"></span>{trx.status}</span>
                    <button className="text-[#0058be] text-xs font-medium hover:underline">Xử lý</button>
                  </div>
                );
              }

              return (
                <tr key={idx} className="hover:bg-[#f8fafc] dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-[#0f172a] dark:text-slate-200 whitespace-nowrap">{trx.id}</td>
                  <td className="py-4 px-6 text-sm text-[#475569] dark:text-slate-400 whitespace-nowrap">{trx.time}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 bg-[#f1f5f9] dark:bg-slate-700 border border-[#cbd5e1] dark:border-slate-600 rounded text-sm font-bold text-[#0f172a] dark:text-slate-200">
                      {trx.plate}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-[#0f172a] dark:text-slate-200 font-medium whitespace-nowrap">
                    {trx.type.includes("VIP") ? <span className="text-[#0ea5e9] dark:text-blue-400 flex items-center gap-1"><StarFilled className="text-xs" /> {trx.type}</span> : trx.type}
                  </td>
                  <td className="py-4 px-6 text-sm text-[#0f172a] dark:text-slate-200 font-medium text-right whitespace-nowrap">{trx.amount}</td>
                  <td className="py-4 px-6 text-sm text-[#475569] dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                    {trx.method === 'VNPAY' && <SyncOutlined className="text-[#0058be] dark:text-blue-400" />}
                    {trx.method === 'Lỗi kết nối' && <ExclamationCircleOutlined className="text-[#ef4444] dark:text-red-400" />}
                    {trx.method !== 'VNPAY' && trx.method !== 'Lỗi kết nối' && <CreditCardOutlined className="text-[#64748b] dark:text-slate-400" />}
                    {trx.method}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex justify-end">{statusBadge}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Paginator */}
      <div className="flex-between p-4 border-t border-[#e9e7e9] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
        <span className="text-sm text-[#64748b] dark:text-slate-400">Hiển thị 1-4 trên {transactions.total} giao dịch</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded border border-[#e2e8f0] dark:border-slate-600 flex items-center justify-center text-[#94a3b8] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700">{"<"}</button>
          <button className="w-8 h-8 rounded border border-[#1677ff] bg-[#eff6ff] dark:bg-blue-900/30 text-[#1677ff] dark:text-blue-400 flex items-center justify-center font-medium">1</button>
          <button className="w-8 h-8 rounded border border-[#e2e8f0] dark:border-slate-600 flex items-center justify-center text-[#475569] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">2</button>
          <button className="w-8 h-8 rounded border border-[#e2e8f0] dark:border-slate-600 flex items-center justify-center text-[#475569] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">3</button>
          <span className="w-8 h-8 flex items-center justify-center text-[#94a3b8] dark:text-slate-500">...</span>
          <button className="w-8 h-8 rounded border border-[#e2e8f0] dark:border-slate-600 flex items-center justify-center text-[#475569] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">{">"}</button>
        </div>
      </div>
    </div>
  );
};
