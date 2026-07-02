import React, { useState } from 'react';
import { 
  FilterOutlined, 
  WarningFilled,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AudioOutlined,
  TeamOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { notification, Modal, Input } from 'antd';
import { useGlobalContext } from '../../context/GlobalContext';

export const StaffSecurityAlerts = () => {
  const { securityAlerts, removeSecurityAlert, restoreSecurityAlerts, addVehicleFine } = useGlobalContext();
  
  const [resolvingAlerts, setResolvingAlerts] = useState({});
  const [isFineModalVisible, setIsFineModalVisible] = useState(false);
  const [currentFineAlertId, setCurrentFineAlertId] = useState(null);
  const [fineAmount, setFineAmount] = useState(200000);
  const [fineNote, setFineNote] = useState('');

  const handleResolve = (type, id) => {
    Modal.confirm({
      title: 'Xác nhận xử lý',
      content: `Đánh dấu đã xử lý cảnh báo ${type}?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        notification.success({ message: `Đã ghi nhận xử lý cảnh báo: ${type}`, placement: 'topRight' });
        removeSecurityAlert(id);
        setResolvingAlerts(prev => { const n = {...prev}; delete n[id]; return n; });
      }
    });
  };

  const handleCustomAction = (id, title, content, successMsg, btnClass = 'bg-blue-600') => {
    Modal.confirm({
      title: title,
      content: content,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { className: btnClass },
      onOk() {
        notification.success({ message: successMsg, placement: 'topRight' });
        setResolvingAlerts(prev => ({ ...prev, [id]: true }));
      }
    });
  };

  if (securityAlerts.length === 0) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto w-full text-center py-20 text-slate-500">
        <CheckCircleOutlined className="text-6xl text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Tất cả cảnh báo đã được xử lý</h2>
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
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src={alert.image || `https://placehold.co/600x400/111827/ef4444/png?text=CAMERA+TRUOC%5Cn${alert.plate || 'NO+PLATE'}`} alt="Car plate front" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 04 - Cổng Bắc</div>
                </div>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                  <img src={alert.image ? alert.image : `https://placehold.co/600x400/111827/ef4444/png?text=CAMERA+SAU%5Cn${alert.plate || 'NO+PLATE'}`} alt="Car plate back" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 border-2 border-green-500/50 m-8 rounded"></div>
                  <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/60 px-2 py-1 rounded">Cam 05 - Cổng Bắc</div>
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
                  <button onClick={() => handleCustomAction(alert.id, 'Điều phối An ninh', 'Gửi yêu cầu đội an ninh hỗ trợ tại hiện trường?', 'Đã điều động lực lượng an ninh', 'bg-emerald-600')} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
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
                  <img src={alert.image || `https://placehold.co/800x266/111827/f97316/png?text=CAMERA+BAI+DO%5Cn${alert.plate || 'NO+PLATE'}`} alt="Dark parking lot" className="w-full h-full object-cover opacity-70" />
                </div>
                <div className="text-sm text-slate-800 mb-5">
                  Phát hiện chấn động mạnh và âm thanh báo động từ xe <span className="font-bold">{alert.plate}</span>. Cần kiểm tra hiện trường ngay.
                </div>
              </>
            ) : (
              <div className="flex gap-4 mb-5">
                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={alert.image || `https://placehold.co/200x200/f8fafc/3b82f6/png?text=${alert.plate || 'NO+PLATE'}`} alt="Vehicle" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Biển số nhận diện</div>
                  <div className="font-bold text-slate-800 text-base mb-1">{alert.plate}</div>
                  <div className="text-sm text-slate-600">{alert.reason}</div>
                </div>
              </div>
            )}

            <div className={`flex mt-auto`}>
              {resolvingAlerts[alert.id] ? (
                <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col mt-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hướng xử lý tiếp theo</div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                    setCurrentFineAlertId(alert.id);
                    setFineAmount(200000);
                    setFineNote('');
                    setIsFineModalVisible(true);
                  }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                      Lập biên bản
                    </button>
                    <button onClick={() => {
                      notification.success({ message: 'Đã gỡ phong tỏa phương tiện', placement: 'topRight' });
                      removeSecurityAlert(alert.id);
                      setResolvingAlerts(prev => { const n = {...prev}; delete n[alert.id]; return n; });
                    }} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2 text-sm">
                      Gỡ phong tỏa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 w-full mt-2">
              {alert.type.includes('TRỘM') ? (
                <>
                  <button onClick={() => handleResolve(alert.type, alert.id)} className="flex-1 bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <CheckCircleOutlined /> Đã nhận
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Điều phối An ninh', 'Gửi yêu cầu đội tuần tra đến ngay hiện trường?', 'Đã điều động lực lượng an ninh', 'bg-orange-600')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2">
                    <TeamOutlined /> Đội tuần tra
                  </button>
                </>
              ) : alert.reason === 'Đỗ sai quy định' || alert.reason === 'Đỗ sai quy định / Lấn vạch' ? (
                <>
                  <button onClick={() => handleCustomAction(alert.id, 'Phát loa nhắc nhở', 'Phát cảnh báo đỗ sai quy định qua loa tại bãi?', 'Đã phát loa nhắc nhở', 'bg-blue-600')} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <AudioOutlined /> Nhắc nhở
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Khóa bánh xe', 'Yêu cầu an ninh khóa bánh xe này?', 'Đã yêu cầu khóa bánh', 'bg-red-600')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2 text-sm">
                    Khóa bánh
                  </button>
                </>
              ) : alert.reason === 'Trốn vé' || alert.reason === 'Trốn vé / Vượt rào' ? (
                <>
                  <button onClick={() => handleCustomAction(alert.id, 'Khóa cổng tự động', 'Hệ thống sẽ khóa cổng và chặn xe này không cho xuất bãi?', 'Đã khóa cổng, chặn xe xuất bãi', 'bg-red-600')} className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Chặn xuất bãi
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Phạt tiền / Khóa thẻ', 'Tiến hành khóa thẻ và lập biên bản phạt tiền?', 'Đã yêu cầu xử phạt', 'bg-blue-600')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2 text-sm">
                    Khóa thẻ
                  </button>
                </>
              ) : alert.reason === 'Gây rối trật tự' || alert.reason === 'Gây rối trật tự an ninh' ? (
                <>
                  <button onClick={() => handleCustomAction(alert.id, 'Báo Công an', 'Gọi ngay cho lực lượng Công an Phường gần nhất?', 'Đã báo cáo Công an', 'bg-red-600')} className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Báo Công an
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Đội tuần tra', 'Điều phối đội tuần tra đến hiện trường?', 'Đã điều động lực lượng an ninh', 'bg-orange-600')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2 text-sm">
                    Đội tuần tra
                  </button>
                </>
              ) : alert.reason === 'Tai nạn' || alert.reason === 'Gây tai nạn / Hư hỏng tài sản' ? (
                <>
                  <button onClick={() => handleCustomAction(alert.id, 'Gọi Cứu thương', 'Gọi cấp cứu 115 đến hiện trường?', 'Đã gọi cứu thương', 'bg-red-600')} className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Gọi Cứu thương
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Bảo vệ hiện trường', 'Cử đội an ninh đến phong tỏa và bảo vệ hiện trường?', 'Đã cử đội bảo vệ hiện trường', 'bg-blue-600')} className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2 text-sm">
                    Bảo vệ HT
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleResolve(alert.type, alert.id)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Bỏ qua (Xác nhận)
                  </button>
                  <button onClick={() => handleCustomAction(alert.id, 'Điều phối An ninh', 'Gửi yêu cầu đội an ninh hỗ trợ tại hiện trường?', 'Đã điều động lực lượng an ninh', 'bg-emerald-600')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer gap-2">
                    <AudioOutlined />
                  </button>
                </>
              )}
                </div>
              )}
            </div>
          </div>
          ))}

        </div>
      </div>
      
      {/* Fine Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 uppercase tracking-wider font-bold">
            <SafetyCertificateOutlined className="text-blue-600" /> Lập Biên bản & Xử phạt
          </div>
        }
        open={isFineModalVisible}
        onCancel={() => setIsFineModalVisible(false)}
        onOk={() => {
          notification.success({ message: `Đã ghi nhận phạt ${fineAmount.toLocaleString()}đ vào hệ thống và gỡ phong tỏa`, placement: 'topRight' });
          if (currentFineAlertId) {
            const alert = securityAlerts.find(a => a.id === currentFineAlertId);
            if (alert) {
              addVehicleFine({ plate: alert.plate, amount: parseInt(fineAmount) || 0, reason: fineNote });
            }
            removeSecurityAlert(currentFineAlertId);
            setResolvingAlerts(prev => { const n = {...prev}; delete n[currentFineAlertId]; return n; });
          }
          setIsFineModalVisible(false);
        }}
        okText="Ghi nhận & Hoàn tất"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-blue-600' }}
      >
        <div className="py-4">
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Số tiền phạt (VNĐ)</label>
            <Input 
              type="number" 
              value={fineAmount} 
              onChange={e => setFineAmount(Number(e.target.value))}
              size="large"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú biên bản</label>
            <Input.TextArea 
              rows={3}
              placeholder="Nhập chi tiết xử phạt..."
              value={fineNote}
              onChange={e => setFineNote(e.target.value)}
            />
          </div>
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
            Hệ thống sẽ tự động gỡ khóa an ninh cho phương tiện sau khi hoàn tất thu phạt.
          </div>
        </div>
      </Modal>
    </div>
  );
};
