import React, { useState } from 'react';
import { 
  SearchOutlined, 
  BellOutlined, 
  MoonOutlined, 
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
  CarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  MoreOutlined,
  WarningOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { DatePicker, notification, Spin } from 'antd';
import dayjs from 'dayjs';
import { useGlobalContext } from '../../../context/GlobalContext';

export const TransactionHistory = () => {
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilter = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      notification.success({message: 'Đã tải xong dữ liệu', placement: 'topRight'});
    }, 800);
  };

  const { transactions, shiftStats, searchValue } = useGlobalContext();

  const handleExport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      notification.success({message: 'Xuất báo cáo thành công', description: 'File báo cáo đã được lưu vào máy dưới dạng Excel/CSV.', placement: 'topRight'});
    }, 1500);
  };

  const ITEMS_PER_PAGE = 10;
  
  const filteredTransactions = transactions.filter(trx => {
    if (!searchValue) return true;
    const lowerSearch = searchValue.toLowerCase();
    return trx.plate?.toLowerCase().includes(lowerSearch) || trx.id?.toLowerCase().includes(lowerSearch);
  });
  
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const currentData = filteredTransactions.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
    }
  };

  const stats = [
    {
      title: "Doanh thu ca trực",
      value: `${shiftStats.revenue.toLocaleString()} đ`,
      trend: "+15%",
      trendColor: "bg-emerald-100 text-emerald-700",
      icon: <WalletOutlined className="text-blue-500 text-xl" />,
      iconBg: "bg-blue-50"
    },
    {
      title: "Giao dịch thành công",
      value: `${shiftStats.transactions}`,
      trend: "Ổn định",
      trendColor: "bg-slate-100 text-slate-600",
      icon: <CheckCircleFilled className="text-emerald-500 text-xl" />,
      iconBg: "bg-emerald-50"
    },
    {
      title: "Giao dịch đang chờ",
      value: "15",
      trend: "! Cần xử lý",
      trendColor: "bg-red-100 text-red-600",
      icon: <FileTextOutlined className="text-slate-500 text-xl" />,
      iconBg: "bg-slate-50"
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] w-full relative">
      <main className="flex-1 p-6 overflow-auto">
        <div className="w-full">
          {/* Header Area (in main content area) */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${stat.trendColor}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="text-slate-500 text-sm mb-1">{stat.title}</div>
                <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loại phương tiện</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer appearance-none">
                <option>Tất cả phương tiện</option>
                <option value="SEDAN_HATCHBACK">Ô tô 4-5 chỗ (Sedan / Hatchback)</option>
                <option value="SUV_CUV_MPV">Xe 7 chỗ (SUV / CUV / MPV)</option>
                <option value="LARGE_VAN_MINIBUS">Xe 9 chỗ & 16 chỗ (Xe Lớn / Minibus)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phương thức thanh toán</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer appearance-none">
                <option>Tất cả phương thức</option>
                <option>Ví UrbanPark</option>
                <option>Tiền mặt</option>
                <option>Thẻ NH / VIP</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Khoảng thời gian</label>
              <div className="relative w-full">
                <DatePicker.RangePicker 
                  className="w-full border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer"
                  defaultValue={[dayjs('2024-05-24', 'YYYY-MM-DD'), dayjs('2024-05-24', 'YYYY-MM-DD')]}
                  format="DD/MM/YYYY"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button onClick={handleFilter} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                <FilterOutlined /> Áp dụng lọc
              </button>
              <button onClick={handleFilter} className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm">
                <ReloadOutlined className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Mã GD</th>
                    <th className="px-6 py-4">Biển số xe</th>
                    <th className="px-6 py-4">Vào</th>
                    <th className="px-6 py-4">Ra</th>
                    <th className="px-6 py-4">Tổng TG</th>
                    <th className="px-6 py-4">Số tiền</th>
                    <th className="px-6 py-4">Thanh toán</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.length > 0 ? currentData.map((trx, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-800">{trx.id}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded font-bold tracking-wider ${trx.hasError ? 'border border-red-500 text-red-600 bg-red-50' : 'bg-slate-100 text-slate-700'}`}>
                            {trx.plate}
                          </span>
                          <CarOutlined className="text-slate-400 text-lg" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-slate-800 font-medium">{trx.inTime}</div>
                        <div className="text-slate-400 text-xs">{trx.inDate}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-slate-800 font-medium">{trx.outTime}</div>
                        <div className="text-slate-400 text-xs">{trx.outDate}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-600">{trx.duration}</td>
                      <td className="px-6 py-5 font-bold text-slate-800">{trx.amount}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {trx.paymentIcon}
                          <span className="text-slate-600 font-medium">{trx.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-center w-28 mx-auto flex items-center justify-center gap-1.5 ${trx.statusColor}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${trx.status === 'Thành công' ? 'bg-emerald-500' : trx.status === 'Thất bại' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                          {trx.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {trx.hasError ? (
                          <button className="text-red-500 hover:text-red-700 p-2"><WarningOutlined className="text-lg" /></button>
                        ) : trx.status === 'Đang xử lý' ? (
                          <button className="text-slate-400 hover:text-slate-600 p-2"><MoreOutlined className="text-lg" /></button>
                        ) : (
                          <button className="text-slate-500 hover:text-blue-600 p-2"><FileTextOutlined className="text-lg" /></button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-10 text-center text-slate-500">
                        Không tìm thấy giao dịch nào phù hợp với "{searchValue}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
              <div className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-700">{filteredTransactions.length > 0 ? (activePage - 1) * ITEMS_PER_PAGE + 1 : 0}-{Math.min(activePage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> trong số <span className="font-bold text-slate-700">{filteredTransactions.length}</span> giao dịch
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(activePage - 1)} disabled={activePage === 1} className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50">&lt;</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => handlePageChange(i + 1)} 
                    className={`w-8 h-8 flex items-center justify-center rounded font-medium transition-colors ${activePage === i + 1 ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(activePage + 1)} disabled={activePage === totalPages} className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50">&gt;</button>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end mb-8">
            <button onClick={handleExport} disabled={isLoading} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
              {isLoading ? <Spin size="small" /> : <DownloadOutlined />} Xuất báo cáo CSV / PDF
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
