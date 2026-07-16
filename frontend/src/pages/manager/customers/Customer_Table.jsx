import { useState, useEffect } from 'react';
import { Pagination } from 'antd';
import { EditOutlined, HistoryOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export const CustomerTable = ({ customers, loading, onOpenVipApproval }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [customers]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = customers.slice(startIndex, endIndex);
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 w-12 text-center">
                <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600" />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khách hàng</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Biển số xe</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại thẻ</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày hết hạn</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {currentData.map((c, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-4 text-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-gray-200 font-mono text-sm rounded border border-gray-200 dark:border-slate-500 inline-block">
                    {c.plate}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {c.type === 'VIP' && <span className="bg-[#041627] dark:bg-blue-900 text-white text-xs px-2 py-0.5 rounded font-medium">VIP</span>}
                  {c.type === 'Tháng' && <span className="text-gray-600 dark:text-gray-300 text-sm">Tháng</span>}
                  {c.type === 'Guest' && <span className="bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded">Guest</span>}
                  {!['VIP', 'Tháng', 'Guest', 'Registered', 'Driver'].includes(c.type) && (
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                      {c.type === 'Registered' ? 'Registered' : c.type || 'Customer'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {c.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded border border-green-100 dark:border-green-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> ACTIVE
                    </span>
                  )}
                  {c.status === 'EXPIRED' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded border border-red-100 dark:border-red-800">
                      EXPIRED
                    </span>
                  )}
                  {c.status === 'IN_PARK' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded border border-emerald-100 dark:border-emerald-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> IN_PARK
                    </span>
                  )}
                  {c.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded border border-orange-100 dark:border-orange-800 animate-pulse">
                      <ExclamationCircleOutlined /> CHỜ DUYỆT
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {c.status === 'EXPIRED' ? <span className="text-red-600 dark:text-red-400 font-medium">{c.expireDate}</span> : c.expireDate}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {c.status === 'EXPIRED' && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors font-medium mr-2">
                        Gia hạn
                      </button>
                    )}
                    {c.status === 'PENDING' && (
                      <button 
                        onClick={() => onOpenVipApproval(c)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded transition-colors font-medium shadow-sm flex items-center gap-1 mr-2"
                      >
                        <CheckCircleOutlined /> Duyệt
                      </button>
                    )}
                    {c.status !== 'PENDING' && (
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <EditOutlined />
                      </button>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <HistoryOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy khách hàng nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-slate-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {customers.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, customers.length)} trong số {customers.length}
        </span>
        <Pagination 
          current={currentPage} 
          total={customers.length} 
          pageSize={pageSize} 
          onChange={(page) => setCurrentPage(page)} 
          size="small" 
          showSizeChanger={false} 
        />
      </div>
    </div>
  );
};
