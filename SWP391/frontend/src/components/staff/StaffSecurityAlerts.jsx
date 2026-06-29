import React from 'react';
import { 
  FilterOutlined, 
  WarningFilled,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AudioOutlined,
  TeamOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { notification, Modal } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffSecurityAlerts = () => {
  const { securityAlerts, removeSecurityAlert, restoreSecurityAlerts } = useGlobalContext();

  const handleResolve = (type, id) => {
    Modal.confirm({
      title: 'Xác nhận xử lý',
      content: `Đánh dấu đã xử lý cảnh báo ${type}?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        notification.success({ message: `Đã ghi nhận xử lý cảnh báo: ${type}`, placement: 'topRight' });
        removeSecurityAlert(id);
      }
    });
  };

  const handleSecurityDispatch = (id) => {
    Modal.confirm({
      title: 'Điều phối An ninh',
      content: 'Gửi yêu cầu đội an ninh hỗ trợ tại hiện trường?',
      okText: 'Gửi yêu cầu',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-emerald-600' },
      onOk() {
        notification.success({ message: 'Đã điều động lực lượng an ninh', placement: 'topRight' });
        removeSecurityAlert(id);
      }
    });
  };

  if (securityAlerts.length === 0) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto w-full text-center py-20 text-slate-500">
        <CheckCircleOutlined className="text-6xl text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Tất cả cảnh báo đã được xử lý</h2>
        <button onClick={restoreSecurityAlerts} className="mt-4 text-blue-500 underline cursor-pointer">Khôi phục dữ liệu mẫu</button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-end mb-8">
        <button 
          onClick={() => {
            notification.info({message: 'Bộ lọc', description: 'Đang mở bộ lọc nâng cao...', placement: 'topRight'});
          }}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <FilterOutlined /> Bộ lọc
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Main Alert Banner (Highest Priority) */}
        {securityAlerts.filter(a => a.type === 'BIỂN SỐ ĐEN').map((alert, index) => (
        <div key={alert.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
          
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-red-50/50 pl-6">
            <div className="flex items-center gap-3">
              <WarningFilled className="text-red-500 text-xl" />
              <div>
                <h3 className="text-red-600 font-bold text-sm tracking-wider uppercase">{alert.type}</h3>
                <span className="text-xs text-slate-500">{alert.time} • Mức độ: Nghiêm trọng</span>
              </div>
            </div>
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse">
              Yêu cầu chú ý
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Images */}
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" alt="Car plate 1" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 04 - Cổng Bắc</div>
                </div>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80" alt="Car plate 2" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 04 - Cổng Bắc</div>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Nhận diện Biển số</div>
                    <div className="inline-block border-2 border-slate-300 bg-slate-100 rounded text-xl font-bold px-3 py-1 tracking-widest text-slate-800">
                      {alert.plate}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Vị trí</div>
                      <div className="font-semibold text-slate-800">Làn vào</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Trạng thái xe</div>
                      <div className="font-bold text-red-600">{alert.reason}</div>
                    </div>
                  </div>

                  <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-6 border border-red-100">
                    Xe nằm trong danh sách đen. Hệ thống barie đã tự động khóa.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleResolve(alert.type, alert.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-red-500/20 cursor-pointer">
                    <CheckCircleOutlined /> Xác nhận
                  </button>
                  <button onClick={() => handleSecurityDispatch(alert.id)} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <SafetyCertificateOutlined /> An ninh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        ))}

        {/* Secondary Alerts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Other Alerts */}
          {securityAlerts.filter(a => a.type !== 'BIỂN SỐ ĐEN').map((alert) => (
          <div key={alert.id} className={`bg-white border-l-4 ${alert.type.includes('TRỘM') ? 'border-l-orange-500' : 'border-l-blue-500'} border-y border-r border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-5`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className={`flex items-center gap-2 ${alert.type.includes('TRỘM') ? 'text-orange-600' : 'text-blue-600'} font-bold text-xs uppercase tracking-wider mb-1`}>
                  <div className={`w-2 h-2 rounded-full ${alert.type.includes('TRỘM') ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  {alert.type}
                </div>
                <div className="text-xs text-slate-500">{alert.time}</div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer"><MoreOutlined className="text-lg" /></button>
            </div>

            {alert.type.includes('TRỘM') ? (
              <>
                <div className="relative aspect-[3/1] bg-black rounded-lg overflow-hidden mb-3">
                  <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80" alt="Dark parking lot" className="w-full h-full object-cover opacity-70" />
                </div>
                <div className="text-sm text-slate-800 mb-5">
                  Phát hiện chấn động mạnh và âm thanh báo động từ xe <span className="font-bold">{alert.plate}</span>. Cần kiểm tra hiện trường ngay.
                </div>
              </>
            ) : (
              <div className="flex gap-4 mb-5">
                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80" alt="Vehicle" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Biển số nhận diện</div>
                  <div className="font-bold text-slate-800 text-base mb-1">{alert.plate}</div>
                  <div className="text-sm text-slate-600">{alert.reason}</div>
                </div>
              </div>
            )}

            <div className={`flex gap-2 mt-auto`}>
              <button onClick={() => handleResolve(alert.type, alert.id)} className={`flex-1 ${alert.type.includes('TRỘM') ? 'bg-[#0f172a] hover:bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2`}>
                {alert.type.includes('TRỘM') ? <CheckCircleOutlined /> : null}
                {alert.type.includes('TRỘM') ? 'Đã nhận' : 'Bỏ qua (Xác nhận)'}
              </button>
              <button onClick={() => handleSecurityDispatch(alert.id)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2">
                {alert.type.includes('TRỘM') ? <><TeamOutlined /> Đội tuần tra</> : <AudioOutlined />}
              </button>
            </div>
          </div>
          ))}

        </div>
      </div>
    </div>
  );
};
