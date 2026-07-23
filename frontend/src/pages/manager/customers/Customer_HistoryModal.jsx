import { Modal, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { customerService } from '../../../services/customerService';
import dayjs from 'dayjs';

export const CustomerHistoryModal = ({ isOpen, onClose, customer }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer?.id && isOpen) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const data = await customerService.getCustomerHistory(customer.id);
          setHistory(data || []);
        } catch (error) {
          console.error("Lỗi khi tải lịch sử:", error);
          setHistory([]);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [customer, isOpen]);

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    {
      title: 'Biển số xe',
      dataIndex: 'plate',
      key: 'plate',
      render: (text) => <span className="font-mono text-sm">{text}</span>
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-'
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-'
    },
    {
      title: 'Phí gửi xe',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(fee)}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'ACTIVE') return <Tag color="blue">Đang gửi</Tag>;
        if (status === 'COMPLETED') return <Tag color="green">Đã hoàn thành</Tag>;
        return <Tag color="default">{status}</Tag>;
      }
    }
  ];

  return (
    <Modal
      title={`Lịch sử gửi xe: ${customer?.name || ''}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="mt-4">
        <Table 
          columns={columns} 
          dataSource={history} 
          rowKey="sessionId" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
          locale={{ emptyText: 'Chưa có lịch sử gửi xe' }}
        />
      </div>
    </Modal>
  );
};
