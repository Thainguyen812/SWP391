import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, notification, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageLayout } from '../../common/PageLayout';
import { supportService } from '../../../services/supportService';

export const SupportMain = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const result = await supportService.getTickets();
      if (Array.isArray(result)) {
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id) => {
    try {
      await supportService.resolveTicket(id);
      notification.success({ message: 'Đã đánh dấu xử lý thành công', placement: 'topRight' });
      fetchTickets();
    } catch (error) {
      notification.error({ message: 'Lỗi khi cập nhật trạng thái', placement: 'topRight' });
    }
  };

  const columns = [
    {
      title: 'Mã Hỗ Trợ',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (text) => <span className="font-semibold text-[#1677ff]">{text}</span>
    },
    {
      title: 'Mô tả vấn đề',
      dataIndex: 'issueDescription',
      key: 'issueDescription',
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleString('vi-VN') : ''
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const isResolved = status === 'RESOLVED' || status === 'Đã xử lý';
        return (
          <Tag color={isResolved ? 'success' : 'warning'} icon={isResolved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {isResolved ? 'Đã xử lý' : 'Chờ xử lý'}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian xử lý',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      render: (text) => text ? new Date(text).toLocaleString('vi-VN') : '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isResolved = record.status === 'RESOLVED' || record.status === 'Đã xử lý';
        return (
          <Button 
            type={isResolved ? 'default' : 'primary'}
            disabled={isResolved}
            onClick={() => handleResolve(record.id)}
          >
            {isResolved ? 'Đã hoàn thành' : 'Đánh dấu xử lý'}
          </Button>
        );
      }
    }
  ];

  return (
    <PageLayout title="Quản lý Hỗ trợ" subtitle="Xem và xử lý các yêu cầu hỗ trợ từ hệ thống">
      <Card className="shadow-sm border border-gray-100 rounded-xl">
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </PageLayout>
  );
};