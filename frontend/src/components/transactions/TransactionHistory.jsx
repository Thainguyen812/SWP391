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

export const TransactionHistory = () => {
  const [activePage, setActivePage] = useState(1);

  const stats = [
    {
      title: "Doanh thu ca trực",
      value: "12.450.000 đ",
      trend: "+15%",
      trendColor: "bg-emerald-100 text-emerald-700",
      icon: <WalletOutlined className="text-blue-500 text-xl" />,
      iconBg: "bg-blue-50"
    },
    {
      title: "Giao dịch thành công",
      value: "482",
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

  const transactions = [
    {
      id: "#TRX-8829",
      plate: "29A-123.45",
      type: "car",
      inTime: "08:15",
      inDate: "24/05",
      outTime: "10:30",
      outDate: "24/05",
      duration: "2h 15m",
      amount: "45,000 đ",
      paymentMethod: "Ví UrbanPark",
      paymentIcon: <WalletOutlined className="text-blue-600" />,
      status: "Thành công",
      statusColor: "bg-emerald-100 text-emerald-700",
      hasError: false
    },
    {
      id: "#TRX-8830",
      plate: "51G-999.01",
      type: "moto",
      inTime: "09:00",
      inDate: "24/05",
      outTime: "--:--",
      outDate: "",
      duration: "Đang đỗ",
      amount: "0 đ",
      paymentMethod: "Tiền mặt",
      paymentIcon: <WalletOutlined className="text-slate-600" />,
      status: "Đang xử lý",
      statusColor: "bg-slate-100 text-slate-600",
      hasError: false
    },
    {
      id: "#TRX-8831",
      plate: "30H-556.78",
      type: "car",
      inTime: "07:45",
      inDate: "24/05",
      outTime: "09:15",
      outDate: "24/05",
      duration: "1h 30m",
      amount: "30,000 đ",
      paymentMethod: "Thẻ VIP",
      paymentIcon: <CheckCircleFilled className="text-slate-800" />,
      status: "Thành công",
      statusColor: "bg-emerald-100 text-emerald-700",
      hasError: false
    },
    {
      id: "#TRX-8832",
      plate: "15A-888.88",
      type: "car",
      inTime: "10:00",
      inDate: "24/05",
      outTime: "10:15",
      outDate: "24/05",
      duration: "15m",
      amount: "15,000 đ",
      paymentMethod: "Thẻ NH",
      paymentIcon: <CreditCardOutlined className="text-blue-500" />,
      status: "Thất bại",
      statusColor: "bg-red-100 text-red-600",
      hasError: true
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] w-full relative">
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Area (in main content area) */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-slate-500">
              <span className="hover:text-slate-700 cursor-pointer">Trang chủ</span>
              <span className="mx-2">&gt;</span>
              <span className="font-bold text-slate-800">Lịch sử giao dịch</span>
            </div>
            <div className="relative hidden md:block">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm biển số hoặc mã..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-full text-sm w-[280px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
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
                <option>Ô tô</option>
                <option>Xe máy</option>
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
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Hôm nay, 24/05/2024" 
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors cursor-pointer"
                  readOnly
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📅</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                <FilterOutlined /> Áp dụng lọc
              </button>
              <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm">
                <ReloadOutlined />
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
                  {transactions.map((trx, index) => (
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
              <div className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-700">1-10</span> trong số <span className="font-bold text-slate-700">482</span> giao dịch
              </div>
              
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-white font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors font-medium">3</button>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors font-medium">48</button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">&gt;</button>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end mb-8">
            <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <DownloadOutlined /> Xuất báo cáo CSV / PDF
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
