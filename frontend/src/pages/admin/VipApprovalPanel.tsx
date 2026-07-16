import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  FileText, 
  ShieldCheck, 
  Image as ImageIcon, 
  Eye, 
  Clock, 
  Database,
  Search,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface VipSubscription {
  id: string;
  vehicle_plate: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  document_photos?: {
    registrationPaper: string;
    identityCard: string;
    frontPhoto: string;
  };
  approved_by?: string | null;
}

interface VipApprovalPanelProps {
  isDarkMode: boolean;
  triggerToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export function VipApprovalPanel({ isDarkMode, triggerToast }: VipApprovalPanelProps) {
  const [subscriptions, setSubscriptions] = useState<VipSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('PENDING');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const normalizedRole = (userRole || '').replace(/^ROLE_/, '').toUpperCase();
  const canApproveVip = normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN';

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserRole(u.role);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync state with localstorage
  const loadSubscriptions = async () => {
    try {
      const response = await apiClient.get('/vip/all');
      const backendAll = Array.isArray(response) ? response : response?.data;

      if (!Array.isArray(backendAll)) {
        throw new Error('VIP API did not return an array');
      }

      const mappedAll = backendAll.map((bp: any) => {
        let docPhotos = {
          registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
          identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
          frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
        };
        if (bp.documentPhotos) {
          if (typeof bp.documentPhotos === 'string') {
            try {
              docPhotos = JSON.parse(bp.documentPhotos);
            } catch (e) {}
          } else {
            docPhotos = bp.documentPhotos;
          }
        }
        return {
          id: bp.id,
          vehicle_plate: bp.licensePlate || bp.vehicle_plate || `XE-${bp.vehicleId}`,
          type: bp.subscriptionType === 'YEARLY' ? 'Thẻ Năm VIP' : bp.subscriptionType === 'QUARTERLY' ? 'Thẻ 3 Tháng VIP' : bp.subscriptionType === 'HALF_YEARLY' ? 'Thẻ 6 Tháng VIP' : bp.subscriptionType === 'DAILY' ? 'Vé Ngày' : 'Thẻ Tháng VIP',
          startDate: bp.startDate ? new Date(bp.startDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          endDate: bp.endDate ? new Date(bp.endDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          status: bp.status === 'PENDING_APPROVAL' ? 'PENDING' : bp.status,
          document_photos: docPhotos,
          approved_by: bp.approvedBy ? 'Bùi Phương (Manager)' : null
        };
      });

      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(mappedAll));
      setSubscriptions(mappedAll);
    } catch (e) {
      console.warn("Failed to fetch VIP list from backend API:", e);
      triggerToast('Không tải được danh sách hồ sơ VIP từ backend. Kiểm tra quyền đăng nhập hoặc API /vip/all.', 'error');
    }
  };

  useEffect(() => {
    loadSubscriptions();
    // Listen for storage change across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'urbanpark_vip_subscriptions') {
        loadSubscriptions();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAction = async (id: string, nextStatus: 'ACTIVE' | 'REJECTED') => {
    
    let targetSub = subscriptions.find(s => s.id === id);
    if (!targetSub) return;

    if (id.length === 36) {
      const endpoint = nextStatus === 'ACTIVE' ? `/vip/${id}/approve` : `/vip/${id}/reject`;
      const body = nextStatus === 'REJECTED' ? { reason: 'Không đủ điều kiện phê duyệt' } : undefined;
      try {
        await apiClient.post(endpoint, body);
        await loadSubscriptions();
      } catch (err) {
        console.warn("Backend action call failed:", err);
        triggerToast('Backend chưa cập nhật được trạng thái hồ sơ VIP. Vui lòng thử lại.', 'error');
        return;
      }
    }

    const updated = subscriptions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status: nextStatus,
          approved_by: 'Bùi Phương (Manager)'
        };
      }
      return sub;
    });

    setSubscriptions(updated);
    
    // Record Audit Log (Step 4 of Flow 5)
    try {
      const savedLogs = JSON.parse(localStorage.getItem('urbanpark_audit_logs') || '[]');
      const newLog = {
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toLocaleString('vi-VN'),
        actor: 'Bùi Phương (Manager)',
        action: nextStatus === 'ACTIVE' ? 'PHÊ DUYỆT VIP' : 'TỪ CHỐI VIP',
        target: `Xe ${targetSub.vehicle_plate} (Hồ sơ: ${id})`,
        details: nextStatus === 'ACTIVE' 
          ? `Kích hoạt gói ${targetSub.type} cho xe ${targetSub.vehicle_plate}.`
          : `Từ chối cấp VIP và thực hiện hoàn tiền cho gói ${targetSub.type} của xe ${targetSub.vehicle_plate}.`
      };
      savedLogs.push(newLog);
      localStorage.setItem('urbanpark_audit_logs', JSON.stringify(savedLogs));
    } catch (err) {
      console.error("Error writing audit log:", err);
    }
    
    // Also dispatch a storage event manually so other components in same window know
    window.dispatchEvent(new Event('storage'));

    if (nextStatus === 'ACTIVE') {
      triggerToast(`Đã chính thức KÍCH HOẠT & PHÊ DUYỆT hồ sơ tuyển chọn VIP mang mã ${id}! Ghi nhận Audit Log.`, 'success');
    } else {
      triggerToast(`Đã ĐÓNG BÁO TỪ CHỐI hồ sơ ${id} và hoàn tiền. Tài xế sẽ nhận cảnh báo để cập nhật!`, 'info');
    }
  };

  // Filter & Search
  const filteredSubs = subscriptions.filter(sub => {
    const plate = sub.vehicle_plate.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = plate.includes(query) || sub.type.toLowerCase().includes(query) || sub.id.toLowerCase().includes(query);
    
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'PENDING') {
      return matchesSearch && (sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL');
    }
    return matchesSearch && sub.status === activeFilter;
  });

  return (
    <div id="manager-vip-approval-panel" className="space-y-6">
      
      {/* Photo Preview Modal Overlay */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-2">
            <img 
              referrerPolicy="no-referrer"
              src={selectedPhoto} 
              alt="Expanded Proof" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Intro Header */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} space-y-2`}>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-lg font-black tracking-tight uppercase">Manager Verification Console</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          Theo quy định an ninh UrbanPark Task 9, quy trình yêu cầu Trưởng Bốt xác minh đủ 3 chứng từ đăng ký hàng tháng: 
          <strong> Cà vẹt chính chủ</strong>, <strong>Căn cước công dân</strong>, và <strong>Ảnh thực tế biển đầu xe</strong>. 
          Vui lòng so sánh kỹ biển số và thông tin trước khi nhấn phê duyệt. Các quyết định cập nhật trực tiếp đồng bộ về PWA của tài xế.
        </p>
      </div>

      {/* Filter and search actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl gap-1">
          {[
            { id: 'PENDING', label: 'Chờ duyệt • ' + subscriptions.filter(s => s.status === 'PENDING' || s.status === 'PENDING_APPROVAL').length },
            { id: 'ACTIVE', label: 'Đã kích hoạt' },
            { id: 'REJECTED', label: 'Đã từ chối' },
            { id: 'ALL', label: 'Tất cả hồ sơ' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeFilter === f.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="Tìm biển số, mã hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Main List */}
      {filteredSubs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Không tìm thấy mã hồ sơ VIP nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubs.map(sub => {
            const hasPhotos = !!sub.document_photos;
            const photos = sub.document_photos || {
              registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=60',
              identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=60',
              frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=60'
            };

            return (
              <div 
                key={sub.id} 
                className={`p-6 rounded-3xl border transition-all ${
                  sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL'
                    ? 'border-amber-500/30 bg-amber-500/5' 
                    : sub.status === 'ACTIVE' 
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/30' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500/30'
                }`}
              >
                {/* Meta details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-200/50 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-extrabold bg-blue-600/10 text-blue-600 dark:text-blue-400 py-1 px-2.5 rounded-lg border border-blue-500/10">
                      {sub.id}
                    </span>
                    <span className="text-sm font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                      Biển số: {sub.vehicle_plate}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Loại: {sub.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-mono">Hạn: {sub.startDate} - {sub.endDate}</span>
                    {sub.approved_by && (
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Phê duyệt bởi: {sub.approved_by}
                      </span>
                    )}
                  </div>
                </div>

                {(sub as any).explanation && (
                  <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                    <span className="font-black uppercase text-[10px] tracking-wider text-amber-700 dark:text-amber-400 block mb-1">⚠️ GIẢI TRÌNH KHÁC BIỆT BIỂN SỐ CỦA TÀI XẾ:</span>
                    "{ (sub as any).explanation }"
                  </div>
                )}

                {/* Document photos review list */}
                <div className="py-5 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Tài liệu ảnh minh chứng đăng ký (Nhấn để phóng to)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'registrationPaper', label: '1. Cà vẹt / Đăng ký xe', url: photos.registrationPaper },
                      { key: 'identityCard', label: '2. CMND / CCCD chủ xe', url: photos.identityCard },
                      { key: 'frontPhoto', label: '3. Ảnh thực tế đầu xe', url: photos.frontPhoto }
                    ].map(img => (
                      <div 
                        key={img.key}
                        onClick={() => setSelectedPhoto(img.url)}
                        className="group relative h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden cursor-zoom-in border border-slate-200/50 dark:border-slate-800"
                      >
                        <img 
                          referrerPolicy="no-referrer"
                          src={img.url} 
                          alt={img.label} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-2 px-3 flex items-center justify-between text-white text-[11px] font-medium backdrop-blur-xs">
                          <span>{img.label}</span>
                          <Eye className="w-3.5 h-3.5 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {!hasPhotos && (
                    <p className="text-[11px] text-amber-500 font-bold font-mono">
                      ⚠️ Lưu ý: Tài khoản đăng ký thử tự động, sử dụng ảnh minh chứng tài liệu CDN mẫu.
                    </p>
                  )}
                </div>

                {/* Decision controls */}
                {(sub.status === 'PENDING' || sub.status === 'PENDING_APPROVAL') ? (
                  canApproveVip ? (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleAction(sub.id, 'REJECTED')}
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-98 cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Không duyệt (Reject)
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, 'ACTIVE')}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Phê duyệt kích hoạt (Approve)
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium italic">
                      Chỉ Quản lý (Manager) mới có quyền phê duyệt hồ sơ VIP.
                    </div>
                  )
                ) : (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">TRẠNG THÁI CUỐI:</span>
                      <strong className={`font-black ${sub.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {sub.status === 'ACTIVE' ? 'ĐÃ PHÊ DUYỆT (ACTIVE)' : 'BỊ TỪ CHỐI (REJECTED)'}
                      </strong>
                    </div>
                    
                    {/* Reset decision capability */}
                    {canApproveVip ? (
                      <button 
                        onClick={() => handleAction(sub.id, sub.status === 'ACTIVE' ? 'REJECTED' : 'ACTIVE')}
                        className="text-[10px] text-blue-500 hover:underline cursor-pointer font-bold"
                      >
                        Sửa đổi quyết định
                      </button>
                    ) : null}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
