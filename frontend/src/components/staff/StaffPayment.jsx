import React, { useState } from 'react';
import { 
  EditOutlined, 
  CheckCircleFilled,
  CloseCircleFilled,
  BankOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  WarningFilled
} from '@ant-design/icons';

export const StaffPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      {/* Header Tags */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 m-0">Thanh toán xe ra</h2>
        <div className="flex gap-3">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Làn ra 1: Đang rảnh
          </span>
          <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Làn ra 2: Đang bận
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Payment Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 m-0">Xử lý vé vãng lai</h3>
              <span className="bg-slate-100 text-slate-500 font-mono text-xs px-3 py-1 rounded">TICKET #8992</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* LPR and Cameras */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biển số nhận diện (LPR)</h4>
                  <div className="flex items-center justify-between border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                    <span className="text-xl font-bold text-slate-800 tracking-wider">30G-123.45</span>
                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                      <EditOutlined className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc vào (Cam 1 - Góc trái)</span>
                    <div className="bg-slate-200 rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden">
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10">ENT: CAM-01</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc vào (Cam 2 - Góc phải)</span>
                    <div className="bg-slate-200 rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden">
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10">ENT: CAM-02</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 3 - Góc trái)</span>
                    <div className="bg-slate-200 rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden">
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10">EXT: CAM-03</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Lúc ra (Cam 4 - Góc phải)</span>
                    <div className="bg-slate-200 rounded aspect-[4/3] flex items-end justify-end p-1 relative overflow-hidden">
                      <span className="bg-black/60 text-white text-[8px] px-1 rounded z-10">EXT: CAM-04</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex flex-col border-l border-slate-100 pl-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Thời gian gửi</h4>
                    <div className="text-base font-bold text-slate-800">04h 25m</div>
                    <div className="text-xs text-slate-500 mt-0.5">08:15 - 12:40</div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng tiền thu</h4>
                    <div className="text-2xl font-black text-red-600">50,000 <span className="text-sm font-bold">VND</span></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <BankOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">Tiền mặt</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('qr')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'qr' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <QrcodeOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">VietQR</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      <CreditCardOutlined className="text-2xl mb-1" />
                      <span className="text-[11px] font-bold">Thẻ TV</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors">
                    Huỷ bỏ
                  </button>
                  <button className="flex-[2] bg-[#1677ff] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20">
                    <CheckCircleFilled />
                    Thanh Toán & Mở Cổng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 m-0">Lịch sử giao dịch gần đây</h3>
              <a href="#" className="text-blue-600 text-xs font-bold hover:text-blue-800 flex items-center gap-1">
                Xem tất cả <ArrowRightOutlined />
              </a>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 border-b border-slate-200">Thời gian</th>
                  <th className="p-4 border-b border-slate-200">Biển số</th>
                  <th className="p-4 border-b border-slate-200">Loại vé</th>
                  <th className="p-4 border-b border-slate-200 text-right">Số tiền</th>
                  <th className="p-4 border-b border-slate-200">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">12:35:10</td>
                  <td className="p-4 font-bold text-slate-800">29A-999.99</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">Vãng lai</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">30,000</td>
                  <td className="p-4 text-emerald-600 text-xs font-bold"><CheckCircleFilled className="mr-1"/> Thành công</td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">12:28:45</td>
                  <td className="p-4 font-bold text-slate-800">30E-123.88</td>
                  <td className="p-4"><span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-medium">Tháng (VIP)</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">0</td>
                  <td className="p-4 text-emerald-600 text-xs font-bold"><CheckCircleFilled className="mr-1"/> Mở tự động</td>
                </tr>
                <tr className="border-b border-red-50 hover:bg-red-50/50 bg-red-50/20 transition-colors">
                  <td className="p-4 text-slate-600">12:15:02</td>
                  <td className="p-4 font-bold text-red-600">UNKNOWN</td>
                  <td className="p-4"><span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded font-medium">Không xác định</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">-</td>
                  <td className="p-4 text-red-600 text-xs font-bold"><WarningFilled className="mr-1"/> Lỗi đọc biển</td>
                </tr>
                <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600">12:10:30</td>
                  <td className="p-4 font-bold text-slate-800">51F-777.22</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">Vãng lai</span></td>
                  <td className="p-4 font-bold text-slate-800 text-right">150,000</td>
                  <td className="p-4 text-emerald-600 text-xs font-bold"><CheckCircleFilled className="mr-1"/> Thành công</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Shift Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-800 leading-tight m-0">Tổng kết<br/>ca trực</h3>
              <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold text-center">
                Ca Sáng (06:00<br/>- 14:00)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Doanh Thu</div>
                <div className="text-xl font-black text-slate-800">4,250K</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lượt Xe Ra</div>
                <div className="text-xl font-black text-slate-800">142</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 font-medium">Tiền mặt</span>
                </div>
                <span className="font-bold text-slate-800">2,100,000 ₫</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium">VietQR</span>
                </div>
                <span className="font-bold text-slate-800">2,150,000 ₫</span>
              </div>
            </div>

            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-lg transition-colors">
              Chốt ca & In báo cáo
            </button>
          </div>

          {/* Capacity Card */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-base font-bold m-0 mb-1">Công suất bãi</h3>
            <div className="text-xs text-slate-400 mb-6">Cập nhật lúc 12:40</div>
            
            <div className="flex items-center justify-between">
              {/* CSS Circle Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle (75%) */}
                  <path
                    className="text-emerald-400"
                    strokeDasharray="75, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">75%</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 text-sm flex-1 ml-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Đang đỗ</span>
                  <span className="font-bold text-white">300</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400">Trống</span>
                  <span className="font-bold text-emerald-400">100</span>
                </div>
                <div className="h-px w-full bg-slate-700 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tổng chỗ</span>
                  <span className="font-bold text-white">400</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
