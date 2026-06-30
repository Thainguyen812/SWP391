import React, { useState, useEffect } from 'react';
import { 
  SearchOutlined, 
  ToolFilled, 
  LaptopOutlined, 
  CheckSquareFilled, 
  PhoneOutlined,
  WarningOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  IdcardOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Modal, Input, Button, notification, Form, Select, Tag } from 'antd';
import { supportService } from '../../services/supportService';

const { TextArea } = Input;
const { Option } = Select;

export const StaffSupport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    supportService.getTickets().then(data => setTickets(data));
  }, []);

  const handleOpenAction = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCreateTicket = async (values) => {
    try {
      const res = await supportService.createTicket({
        issueDescription: `[${values.deviceType}] ${values.issue}`,
        status: 'Chờ xử lý'
      });
      const newTicket = res || {
        ticketCode: '#TK-' + Math.floor(Math.random() * 10000),
        issueDescription: `[${values.deviceType}] ${values.issue}`,
        status: 'Chờ xử lý',
        createdAt: new Date().toISOString()
      };
      setTickets(prev => [newTicket, ...prev]);
      
      notification.success({
        message: 'Gửi yêu cầu thành công',
        description: `Kỹ thuật viên đã nhận được thông báo. Mã: ${newTicket.ticketCode}`,
        placement: 'topRight'
      });
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Lỗi', description: 'Không thể gửi yêu cầu' });
    }
  };

  const renderContent = () => {
    if (modalTitle === 'Báo lỗi thiết bị' || modalTitle === 'Hỗ trợ phần mềm') {
      return (
        <Form form={form} layout="vertical" onFinish={handleCreateTicket}>
          <Form.Item name="deviceType" label="Loại thiết bị" rules={[{ required: true }]}>
            <Select placeholder="Chọn thiết bị">
              <Option value="Camera">Camera</Option>
              <Option value="Barrier">Barrier</Option>
              <Option value="Phần mềm">Phần mềm</Option>
            </Select>
          </Form.Item>
          <Form.Item name="issue" label="Mô tả" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Nhập mô tả sự cố..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">Gửi yêu cầu hỗ trợ</Button>
        </Form>
      );
    }
    if (modalTitle === 'Liên hệ khẩn cấp') {
      return (
        <div className="flex flex-col gap-4 mt-4 text-center py-4">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <PhoneOutlined className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 m-0">0988 123 456</h2>
          <p className="text-slate-500 m-0">Trưởng ca Kỹ thuật: Nguyễn Văn Trọng (Trực 24/7)</p>
          <Button danger type="primary" className="w-full mt-4" size="large" onClick={() => setIsModalOpen(false)}>Đóng</Button>
        </div>
      );
    }
    return (
      <div className="mt-4">
        <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">{modalContent}</p>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto flex flex-col gap-8">
      
      {/* 1. Header Hero Section */}
      <div className="bg-[#1e293b] rounded-2xl p-10 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[100px] -left-[50px] w-64 h-64 rounded-full bg-slate-500 mix-blend-screen blur-3xl"></div>
          <div className="absolute -bottom-[50px] -right-[50px] w-80 h-80 rounded-full bg-slate-400 mix-blend-screen blur-3xl"></div>
        </div>

        <h1 className="text-white text-3xl font-bold mb-3 relative z-10 text-center">Chúng tôi có thể giúp gì cho bạn?</h1>
        <p className="text-slate-400 text-sm mb-8 relative z-10 text-center">Tra cứu quy trình vận hành, báo cáo sự cố hoặc liên hệ kỹ thuật viên ngay lập tức.</p>
        
        <div className="w-full max-w-2xl relative z-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchOutlined className="text-slate-400 text-lg" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm kiếm hướng dẫn, mã lỗi, hoặc quy trình..." 
            className="w-full pl-12 pr-4 py-4 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 bg-white border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                notification.info({ message: 'Đang tìm kiếm...', description: `Kết quả cho: ${e.target.value}` });
              }
            }}
          />
        </div>
      </div>

      {/* 2. Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div onClick={() => handleOpenAction('Báo lỗi thiết bị', '')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-start">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ToolFilled className="text-lg" />
          </div>
          <h3 className="text-base font-bold text-slate-800 m-0 mb-2">Báo lỗi thiết bị</h3>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">Camera, Barrier, Máy quét thẻ...</p>
        </div>

        {/* Card 2 */}
        <div onClick={() => handleOpenAction('Hỗ trợ phần mềm', '')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-start">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LaptopOutlined className="text-lg" />
          </div>
          <h3 className="text-base font-bold text-slate-800 m-0 mb-2">Hỗ trợ phần mềm</h3>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">Lỗi app, dữ liệu xe, in hóa đơn...</p>
        </div>

        {/* Card 3 */}
        <div onClick={() => handleOpenAction('Quy trình vận hành', 'Hệ thống lưu trữ các tài liệu SOP. Vui lòng liên hệ quản lý để được cấp quyền truy cập đầy đủ các tài liệu ISO mới nhất.')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-start">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckSquareFilled className="text-lg" />
          </div>
          <h3 className="text-base font-bold text-slate-800 m-0 mb-2">Quy trình vận hành</h3>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">Cẩm nang nhân viên, SOP...</p>
        </div>

        {/* Card 4 (Dark) */}
        <div onClick={() => handleOpenAction('Liên hệ khẩn cấp', '')} className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-lg hover:shadow-xl transition-shadow cursor-pointer group flex flex-col items-start">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PhoneOutlined className="text-lg" />
          </div>
          <h3 className="text-base font-bold text-white m-0 mb-2">Liên hệ khẩn cấp</h3>
          <p className="text-xs text-slate-400 m-0 leading-relaxed">Gọi trực tiếp cho Trưởng ca/Kỹ thuật.</p>
        </div>
      </div>

      {/* 3. Bottom Layout: Guides & Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Guides */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold text-slate-800 m-0">Hướng dẫn nhanh</h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-transparent border-0 p-0 cursor-pointer">Tất cả</button>
          </div>
          
          <div className="flex flex-col gap-3">
            <div onClick={() => handleOpenAction('Cách xử lý kẹt barrier', 'Bước 1: Chuyển barrier sang chế độ thủ công bằng nút bấm khẩn cấp dưới gầm tủ điều khiển. Bước 2: Nâng tay cần lên. Bước 3: Reset lại tủ điện (Tắt/Bật công tắc).')} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <WarningOutlined className="text-slate-400 text-lg group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Cách xử lý kẹt barrier</span>
              </div>
              <RightOutlined className="text-[10px] text-slate-300 group-hover:text-blue-500" />
            </div>

            <div onClick={() => handleOpenAction('Khởi động lại Camera LPR', 'Vào trang Cấu hình hệ thống, chọn thẻ Camera. Tìm đúng mã Làn xe và nhấn nút "Khởi động lại dịch vụ LPR". Đợi 30 giây để camera bắt nét lại.')} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <ReloadOutlined className="text-slate-400 text-lg group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Khởi động lại Camera LPR</span>
              </div>
              <RightOutlined className="text-[10px] text-slate-300 group-hover:text-blue-500" />
            </div>

            <div onClick={() => handleOpenAction('Xử lý lỗi thanh toán VietQR', 'Trường hợp khách đã quét mã bị trừ tiền nhưng Barrier chưa mở: Yêu cầu khách đưa ảnh chụp màn hình trừ tiền thành công. Dùng tính năng Mở Cổng Khẩn Cấp trên màn Thanh toán.')} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCardOutlined className="text-slate-400 text-lg group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Xử lý lỗi thanh toán VietQR</span>
              </div>
              <RightOutlined className="text-[10px] text-slate-300 group-hover:text-blue-500" />
            </div>

            <div onClick={() => handleOpenAction('Cấp thẻ tạm cho khách', 'Chỉ áp dụng khi bãi xe bị mất mạng hoàn toàn. Lấy thẻ vật lý ghi lại biển số và giờ vào. Báo cáo ngay cho Tổ trưởng.')} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group shadow-sm">
              <div className="flex items-center gap-3">
                <IdcardOutlined className="text-slate-400 text-lg group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Cấp thẻ tạm cho khách</span>
              </div>
              <RightOutlined className="text-[10px] text-slate-300 group-hover:text-blue-500" />
            </div>
          </div>
        </div>

        {/* Right Column: Recent Tickets Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold text-slate-800 m-0">Yêu cầu hỗ trợ gần đây</h2>
            <button className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border-0 cursor-pointer transition-colors">Lọc trạng thái</button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">TICKET ID</th>
                    <th className="p-4 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">VẤN ĐỀ</th>
                    <th className="p-4 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">THỜI GIAN</th>
                    <th className="p-4 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 text-right">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, index) => {
                    const timeStr = new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    let colorObj = { bg: 'bg-slate-50', text: 'text-slate-500' };
                    if (ticket.status === 'Chờ xử lý') colorObj = { bg: 'bg-red-50', text: 'text-red-500' };
                    else if (ticket.status === 'Đang xử lý') colorObj = { bg: 'bg-blue-50', text: 'text-blue-500' };
                    else if (ticket.status === 'Đã giải quyết') colorObj = { bg: 'bg-emerald-100', text: 'text-emerald-600' };

                    return (
                      <tr key={index} onClick={() => handleOpenAction(`Chi tiết Ticket ${ticket.ticketCode}`, ticket.issueDescription)} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="p-4 font-bold text-slate-800 text-xs">{ticket.ticketCode}</td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{ticket.issueDescription}</td>
                        <td className="p-4 text-xs text-slate-500">{timeStr}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-block ${colorObj.bg} ${colorObj.text} text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide`}>{ticket.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        {renderContent()}
      </Modal>
    </div>
  );
};
