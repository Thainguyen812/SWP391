import { useState, useEffect } from 'react';
import { DownloadOutlined, UserAddOutlined } from '@ant-design/icons';
import { CustomerStats } from './Customer_Stats';
import { CustomerFilter } from './Customer_Filter';
import { CustomerTable } from './Customer_Table';
import { VipApprovalModal } from './Customer_VipModal';
import { CustomerEditModal } from './Customer_EditModal';
import { CustomerHistoryModal } from './Customer_HistoryModal';
import { VipApprovalPanel } from '../../admin/VipApprovalPanel';
import { customerService } from '../../../services/customerService';
import { exportToCSV } from '../../../utils/exportUtils';
import { notification, Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { PageLayout } from '../../../components/common/PageLayout';

export const CustomerPage = () => {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Modal state
  const [selectedVip, setSelectedVip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Edit/History Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Add Customer Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const handleAddSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        expiry: values.expiry ? values.expiry.format('YYYY-MM-DD') : null,
      };
      await customerService.addCustomer(payload);
      notification.success({
        message: 'Thêm khách hàng thành công',
        description: `Khách hàng ${values.name} đã được thêm vào hệ thống.`,
        placement: 'topRight',
      });
      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchCustomers(filter);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Vui lòng kiểm tra lại thông tin.';
      notification.error({
        message: 'Lỗi thêm khách hàng',
        description: errorMsg,
        placement: 'topRight',
      });
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await customerService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi lấy thống kê khách hàng:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCustomers = async (currentFilter) => {
    try {
      setLoadingTable(true);
      const data = await customerService.getCustomers(currentFilter);
      setCustomers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách hàng:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCustomers(filter);
  }, [filter]);

  const handleSearch = (keyword) => {
    // Implement local search for mock or trigger API
    // In this simple mock, we just filter the loaded data
    if (!keyword.trim()) {
      fetchCustomers(filter);
    } else {
      const lower = keyword.toLowerCase();
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.phone.toLowerCase().includes(lower) || 
        c.plate.toLowerCase().includes(lower)
      );
      setCustomers(filtered);
    }
  };

  const handleApprove = async () => {
    if (!selectedVip) return;
    try {
      setProcessing(true);
      await customerService.approveVipSubscription(selectedVip.subscriptionId, true);
      notification.success({ message: "Phê duyệt thành công", placement: "topRight" });
      setIsModalOpen(false);
      fetchCustomers(filter);
    } catch (error) {
      notification.error({ message: "Lỗi phê duyệt", placement: "topRight" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason) => {
    if (!selectedVip) return;
    try {
      setProcessing(true);
      await customerService.approveVipSubscription(selectedVip.subscriptionId, false, reason);
      notification.success({ message: "Từ chối thành công", placement: "topRight" });
      setIsModalOpen(false);
      fetchCustomers(filter);
    } catch (error) {
      notification.error({ message: "Lỗi từ chối", placement: "topRight" });
    } finally {
      setProcessing(false);
    }
  };

  const openVipApproval = (customer) => {
    setSelectedVip(customer);
    setIsModalOpen(true);
  };

  const openEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const openCustomerHistory = (customer) => {
    setSelectedCustomer(customer);
    setIsHistoryModalOpen(true);
  };

  return (
    <PageLayout
      title="Quản lý Khách hàng"
      subtitle="Danh sách người dùng, trạng thái thẻ và lịch sử giao dịch."
      actions={
        <>
          <button 
            className="gap-2 px-4 py-[9px] bg-[#1677ff] hover:bg-[#0058be] transition-colors rounded flex items-center focus:outline-none"
            onClick={() => {
              exportToCSV(customers, `Danh_sach_khach_hang_${dayjs().format('YYYY-MM-DD')}.csv`, {
                id: 'Mã KH',
                name: 'Tên Khách Hàng',
                phone: 'Số điện thoại',
                plate: 'Biển số xe',
                type: 'Loại thẻ',
                statusLabel: 'Trạng thái',
                expireDate: 'Ngày hết hạn'
              });
              notification.success({ 
                message: "Xuất báo cáo thành công", 
                description: "Tệp báo cáo khách hàng đã được tải xuống.", 
                placement: "topRight" 
              });
            }}
          >
            <DownloadOutlined className="text-white" />
            <span className="font-bold text-white text-xs">Xuất báo cáo</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            <UserAddOutlined />
            Thêm khách hàng
          </button>
        </>
      }
    >
      {/* Stats Cards */}
      <CustomerStats stats={stats} loading={loadingStats} />

      {/* Main Content Area */}
      <div className="flex flex-col w-full">
        <CustomerFilter 
          filter={filter} 
          setFilter={setFilter} 
          onSearch={handleSearch} 
        />
        {filter === 'pending' ? (
          <div className="mt-4">
            <VipApprovalPanel isDarkMode={false} triggerToast={(msg, type) => notification[type]({message: msg, placement: 'topRight'})} />
          </div>
        ) : (
          <CustomerTable 
            customers={customers} 
            loading={loadingTable} 
            onOpenVipApproval={openVipApproval}
            onOpenEdit={openEditCustomer}
            onOpenHistory={openCustomerHistory}
            onRefresh={() => fetchCustomers(filter)}
          />
        )}
      </div>

      {/* VIP Approval Modal */}
      <VipApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedVip}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />

      {/* Add Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="Thêm khách hàng"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#1677ff]" }}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit} className="mt-4">
          <div className="mb-4">
            <Form.Item name="email" label="Email đăng nhập" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
              <Input placeholder="Nhập địa chỉ email của khách hàng" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
              <Input placeholder="Nhập họ và tên khách hàng" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="plate" label="Biển số xe" rules={[{ required: true, message: 'Vui lòng nhập biển số xe!' }]}>
              <Input placeholder="Ví dụ: 51F-123.45" />
            </Form.Item>
            <Form.Item name="type" label="Loại thẻ" rules={[{ required: true, message: 'Vui lòng chọn loại thẻ!' }]}>
              <Select placeholder="Chọn loại thẻ">
                <Select.Option value="VIP">VIP</Select.Option>
                <Select.Option value="Tháng">Tháng</Select.Option>
                <Select.Option value="Guest">Guest</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="status" label="Trạng thái thẻ" initialValue="ACTIVE" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
              <Select placeholder="Chọn trạng thái">
                <Select.Option value="ACTIVE">ACTIVE (Đang hoạt động)</Select.Option>
                <Select.Option value="PENDING">PENDING (Chờ duyệt)</Select.Option>
                <Select.Option value="EXPIRED">EXPIRED (Hết hạn)</Select.Option>
                <Select.Option value="IN_PARK">IN_PARK (Đang trong bãi)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="expiry" label="Ngày hết hạn">
              <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Customer Modal */}
      <CustomerEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        customer={selectedCustomer}
        onRefresh={() => fetchCustomers(filter)}
      />

      {/* History Customer Modal */}
      <CustomerHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customer={selectedCustomer}
      />
    </PageLayout>
  );
};
