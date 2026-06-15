import { useState, useEffect } from 'react';
import { DownloadOutlined, UserAddOutlined } from '@ant-design/icons';
import { CustomerStats } from './Customer_Stats';
import { CustomerFilter } from './Customer_Filter';
import { CustomerTable } from './Customer_Table';
import { VipApprovalModal } from './Customer_VipModal';
import { customerService } from '../../services/customerService';
import { notification } from 'antd';
import { PageLayout } from '../common/PageLayout';

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

  const openVipApproval = (customer) => {
    setSelectedVip(customer);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      await customerService.approveVipSubscription(id, true);
      notification.success({ message: 'Phê duyệt thẻ VIP thành công!' });
      setIsModalOpen(false);
      fetchCustomers(filter); // Refresh data
    } catch {
      notification.error({ message: 'Có lỗi xảy ra khi phê duyệt.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    setProcessing(true);
    try {
      await customerService.approveVipSubscription(id, false);
      notification.success({ message: 'Đã từ chối thẻ VIP.' });
      setIsModalOpen(false);
      fetchCustomers(filter); // Refresh data
    } catch {
      notification.error({ message: 'Có lỗi xảy ra khi từ chối.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageLayout
      title="Quản lý Khách hàng"
      subtitle="Danh sách người dùng, trạng thái thẻ và lịch sử giao dịch."
      actions={
        <>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-gray-200 shadow-sm">
            <DownloadOutlined />
            Xuất báo cáo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] text-white rounded-lg text-sm font-medium transition-colors shadow-md">
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
        <CustomerTable 
          customers={customers} 
          loading={loadingTable} 
          onOpenVipApproval={openVipApproval}
        />
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
    </PageLayout>
  );
};
