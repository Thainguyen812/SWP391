import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Car, Calendar, CreditCard, Settings, LogOut, HelpCircle, Bell, Search, 
  MapPin, Activity, CheckCircle, Lock, Unlock, Plus, ChevronRight, ArrowRight, 
  ShieldAlert, Volume2, VolumeX, X, RefreshCw, Clock, QrCode, DollarSign, 
  Download, Wrench, PhoneCall, Mail, MessageSquare, Paperclip, AlertTriangle, 
  KeyRound, Coins, Sliders
} from 'lucide-react';

export function DriverSupport() {
  const ctx: any = useOutletContext();
  const navigate = useNavigate();
  const {
    user, accessToken, onLogout, isDarkMode,
    activeTab, setActiveTab, isOffline, setIsOffline,
    paymentMethod, setPaymentMethod, balance, setBalance,
    selectedVehId, setSelectedVehId, qrDirection, setQrDirection,
    isTogglingLock, setIsTogglingLock, vehicles, setVehicles,
    transactions, setTransactions, currentParked, setCurrentParked,
    addVehicleModalOpen, setAddVehicleModalOpen, newPlate, setNewPlate,
    newName, setNewName, newType, setNewType, regStep, setRegStep,
    selectedVehicleForVIP, setSelectedVehicleForVIP, selectedPackPrice, setSelectedPackPrice,
    selectedPackLabel, setSelectedPackLabel, vnpayBank, setVnpayBank,
    vnpayCardNo, setVnpayCardNo, vnpayCardHolder, setVnpayCardHolder,
    vnpayOtp, setVnpayOtp, vnpayModalOpen, setVnpayModalOpen,
    vnpayStep, setVnpayStep, isSirenMuted, setIsSirenMuted,
    isAlertOverlayShown, setIsAlertOverlayShown, profileName, setProfileName,
    profilePhone, setProfilePhone, profileEmail, setProfileEmail,
    profileAddress, setProfileAddress, is2faEnabled, setIs2faEnabled,
    emailNotifyGate, setEmailNotifyGate, smsNotifyGate, setSmsNotifyGate,
    emailNotifyReceipt, setEmailNotifyReceipt, smsNotifyReceipt, setSmsNotifyReceipt,
    billingTimeFilter, setBillingTimeFilter, billingTypeFilter, setBillingTypeFilter,
    searchSupportQuery, setSearchSupportQuery, expandedFaq, setExpandedFaq,
    ticketTopic, setTicketTopic, ticketMessage, setTicketMessage,
    ticketAttachedFiles, setTicketAttachedFiles, triggerToast, isTxDateInFilter, handleLogout
  } = ctx;

  return (
    <>
                <motion.div 
                  key="support"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  {/* Header */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">Trung tâm Hỗ trợ</h2>
                    <p className="text-slate-400 text-xs font-semibold">
                      Tìm kiếm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ quản lý hệ thống bãi đỗ xe thông minh của chúng tôi.
                    </p>
                  </div>

                  {/* High Search Bar block */}
                  <div className="bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-xs">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchSupportQuery}
                        onChange={(e) => setSearchSupportQuery(e.target.value)}
                        placeholder="Bạn cần giúp đỡ điều gì? (Ví dụ: nạp tiền vào ví, đổi vé tháng...)"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-xl font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Grid of categories cards */}
                  <div className="space-y-3">
                    <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Chủ đề Hỗ trợ phổ biến
                    </strong>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: <KeyRound className="w-5 h-5 text-indigo-600" />, title: 'Tài khoản & Bảo mật', bColor: 'bg-indigo-50 border-indigo-100', desc: 'Quản lý thông tin cá nhân, mật khẩu, và bảo mật hai lớp.' },
                        { icon: <Coins className="w-5 h-5 text-emerald-600" />, title: 'Thanh toán & Ví', bColor: 'bg-emerald-50 border-emerald-100', desc: 'Nạp tiền, lịch sử giao dịch, và hóa đơn điện tử.' },
                        { icon: <Calendar className="w-5 h-5 text-blue-600" />, title: 'Đăng ký vé tháng', bColor: 'bg-blue-50 border-blue-105', desc: 'Thủ tục đăng ký, gia hạn, và thay đổi thông tin biển số xe.' },
                        { icon: <MapPin className="w-5 h-5 text-amber-600" />, title: 'Hướng dẫn vào/ra bãi xe', bColor: 'bg-amber-50 border-amber-100', desc: 'Quy trình sử dụng thẻ, nhận diện biển số (LPR), và barrier.' },
                        { icon: <Wrench className="w-5 h-5 text-rose-600" />, title: 'Sự cố kỹ thuật', bColor: 'bg-rose-50 border-rose-100', desc: 'Báo cáo lỗi hệ thống, mất kết nối, hoặc barrier không mở.' },
                      ].map((cat, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setSearchSupportQuery(cat.title);
                            triggerToast(`Đã lọc câu hỏi theo chủ đề "${cat.title}"`, 'info');
                          }}
                          className="bg-white p-5 rounded-[20px] border border-slate-200/60 hover:border-blue-400 cursor-pointer hover:shadow-xs transition-colors group flex gap-3 text-left items-start"
                        >
                          <div className={`p-2.5 rounded-xl ${cat.bColor} border group-hover:scale-105 transition-transform`}>
                            {cat.icon}
                          </div>
                          <div className="space-y-1">
                            <strong className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors block leading-none">{cat.title}</strong>
                            <p className="text-[11px] text-slate-450 font-semibold leading-normal">{cat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Accordion Section */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-250/60 space-y-4">
                    <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                      Câu hỏi thường gặp (FAQs)
                    </strong>

                    <div className="font-sans divide-y divide-slate-100 text-xs">
                      {[
                        { q: 'Làm thế nào để nạp tiền vào ví điện tử UrbanPark?', a: 'Quý khách vào mục "Cài đặt tài khoản", tìm ô "Ví UrbanPark" và nhấn nút "Nạp tiền ngay". Hệ thống sẽ kết nối với Cổng VNPAY Sandbox để quý khách thực hiện thanh toán giả lập nhanh chóng.' },
                        { q: 'Cách thay đổi biển số xe đăng ký vé tháng đang sử dụng?', a: 'Để thay đổi biển số xe hưởng đặc quyền vé tháng cố định, quý khách gửi một phiếu yêu cầu hỗ trợ (Support Ticket) bên dưới kèm theo ảnh đăng ký xe (và đăng kiểm) để đội ngũ hỗ trợ cập nhật trên hệ thống trong vòng 10 phút.' },
                        { q: 'Tôi cần làm gì khi bị mất thẻ từ vật lý gửi xe gửi ngoài bãi?', a: 'Xin vui lòng báo ngay cho ban quản lý qua Hotline 1900 6868 hoặc trực tiếp tại bốt gác bảo vệ. Chúng tôi sẽ khoá từ thẻ cũ lập tức để phòng gian và cấp mới thẻ nhựa dự phòng cho tài xế.' },
                        { q: 'Hệ thống LPR không nhận diện được biển số, tôi phải làm sao?', a: 'Trường hợp biển số bị bụi mờ ngăn camera OCR nhận dạng tự động, rào chắn tạm thời chưa mở. Quý khách vui lòng dừng xe trước vạch sơn kẻ và giơ QR Code bốt gác trực thuộc trên màn hình trang chủ tài xế để máy quét tầm gần mở cưỡng bức barrier.' },
                        { q: 'Làm sao để xuất hóa đơn điện tử VAT cho danh bạ doanh nghiệp?', a: 'At tab "Lịch sử thanh toán", đối với mọi hóa đơn trạng thái "Thành công", quý khách nhấn nút "Tải HĐ". Biểu mẫu xuất hóa đơn PDF tiêu chuẩn Tổng cục Thuế sẽ tải xuống thiết bị chứa đầy đủ thông số thanh thu.' }
                      ]
                      .filter(item => {
                        if (!searchSupportQuery) return true;
                        return item.q.toLowerCase().includes(searchSupportQuery.toLowerCase()) || 
                               item.a.toLowerCase().includes(searchSupportQuery.toLowerCase());
                      })
                      .map((faq, index) => {
                        const isOpen = expandedFaq === index;
                        return (
                          <div key={index} className="py-3">
                            <button 
                              type="button"
                              onClick={() => setExpandedFaq(isOpen ? null : index)}
                              className="w-full flex items-center justify-between gap-3 text-left font-extrabold text-slate-800 hover:text-blue-600 transition-colors py-1 cursor-pointer select-none"
                            >
                              <span>{faq.q}</span>
                              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-[11.5px] leading-relaxed text-slate-500 font-medium pl-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ticket creation and telephone sidebar widgets */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Support Form */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-4">
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-sans">
                        Gửi yêu cầu hỗ trợ (Support Ticket)
                      </strong>

                      <form 
                        onSubmit={e => {
                          e.preventDefault();
                          if (isOffline) {
                            triggerToast('Lỗi: Không thể gửi yêu cầu hỗ trợ khi Ngoại tuyến!', 'error');
                            return;
                          }
                          if (!ticketTopic || !ticketMessage) {
                            triggerToast('Vui lòng điền đầy đủ chủ đề và nội dung!', 'error');
                            return;
                          }
                          triggerToast('Mã số hỗ trợ Ticket #UP-4491 đã được gửi đi thành công!', 'success');
                          setTicketTopic('');
                          setTicketMessage('');
                          setTicketAttachedFiles([]);
                        }}
                        className="space-y-4 font-sans text-xs text-left"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Chủ đề hỗ trợ</label>
                          <select 
                            value={ticketTopic}
                            onChange={(e) => setTicketTopic(e.target.value)}
                            className="w-full p-3 border rounded-xl font-bold bg-slate-50 border-slate-200 focus:bg-white text-slate-850 outline-none transition-colors"
                          >
                            <option value="">-- Chọn chủ đề hỗ trợ --</option>
                            <option value="Sự cố ứng dụng">Sự cố ứng dụng di động</option>
                            <option value="Lỗi thanh toán">Lỗi giao dịch trừ tiền sai / Nạp ví</option>
                            <option value="Biển số xe">Hỗ trợ cập nhật biển số xe / Lịch gia hạn</option>
                            <option value="Barrier không mở">Barrier bốt bảo vệ không tự mở rào</option>
                            <option value="Khác">Phản ánh dịch vụ khác</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nội dung chi tiết</label>
                          <textarea 
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            rows={4}
                            placeholder="Mô tả cụ thể sự cố hoặc câu hỏi dành cho chúng tôi..."
                            className="w-full p-3 border rounded-xl font-medium bg-slate-50 border-slate-200 focus:bg-white text-slate-850 outline-none transition-colors resize-none"
                          />
                        </div>

                        {/* File upload drag area */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đính kèm ảnh hiện trường (Tùy chọn)</label>
                          
                          <div 
                            onClick={() => {
                              // Simulate selecting a file
                              const simulatedFiles = [
                                { name: 'bill_screenshot.png', size: '242 KB' },
                                { name: 'car_plate_blurry.png', size: '1.2 MB' }
                              ];
                              setTicketAttachedFiles(prev => [...prev, simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)]]);
                              triggerToast('Đính kèm file minh chứng thành công.', 'info');
                            }}
                            className="p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-center font-sans space-y-1"
                          >
                            <div className="flex justify-center"><Paperclip className="w-5 h-5 text-slate-400" /></div>
                            <span className="text-slate-500 font-extrabold text-[11px] block text-center">Kéo thả hình chụp hoặc nhấn vào đây để đính kèm</span>
                            <span className="text-slate-400 text-[10px] block text-center">Hỗ trợ JPG, PNG tải lên kích thước tối đa 5MB</span>
                          </div>

                          {/* List of uploaded files */}
                          {ticketAttachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {ticketAttachedFiles.map((file, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 text-blue-700 text-[10.5px] font-extrabold rounded-lg border border-blue-100 uppercase">
                                  <span>{file.name}</span>
                                  <span className="text-[9px] text-blue-400 font-semibold">({file.size})</span>
                                  <button 
                                    type="button" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTicketAttachedFiles(prev => prev.filter((_, idx) => idx !== i));
                                    }}
                                    className="text-blue-400 hover:text-red-500 font-bold ml-1"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        >
                          Gửi yêu cầu hỗ trợ ngay
                        </button>
                      </form>
                    </div>

                    {/* Right contacts details */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 space-y-5 text-left font-sans text-xs">
                      <strong className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans leading-none">
                        Thông tin liên hệ
                      </strong>

                      <div className="space-y-4">
                        {/* Hotline panel */}
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <strong className="text-slate-400 font-extrabold text-[10.5px] uppercase block tracking-wider leading-none">Hotline Tổng Đài 24/7</strong>
                            <strong className="text-sm font-black text-slate-950 block font-mono">1900 6868</strong>
                            <span className="text-[10px] text-slate-400 font-semibold block">Hỗ trợ khẩn cấp tại trạm barrier bốt gác</span>
                          </div>
                        </div>

                        {/* Email panel */}
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-105 text-blue-600">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <strong className="text-slate-400 font-extrabold text-[10.5px] uppercase block tracking-wider leading-none">Phòng ban Khách Hàng</strong>
                            <strong className="text-emerald-700 font-extrabold block">support@urbanpark.vn</strong>
                            <span className="text-[10px] text-slate-400 font-semibold block font-sans">Giải đáp trong vòng tối đa 2 giờ làm việc</span>
                          </div>
                        </div>

                        {/* Live chat */}
                        <div className="pt-2 border-t border-slate-100 space-y-3.5">
                          <button 
                            type="button"
                            onClick={() => triggerToast('Trò chuyện trực tuyến đang kết nối tư vấn viên...', 'success')}
                            className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Trò chuyện trực tuyến</span>
                          </button>

                          {/* Operating system status indicator */}
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-2.5 text-[11px] text-emerald-800 font-extrabold select-none">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>UrbanPark System Status: OK</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>


    </>
  );
}
