import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, notification, Image } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/apiClient';

export const ViolationManagerPanel = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/v1/violations');
      setViolations(res.data || []);
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể lấy danh sách vi phạm'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleProcess = async (id) => {
    try {
      await apiClient.put(`/v1/violations/${id}/status?status=PROCESSED`);
      notification.success({ message: 'Xử lý thành công' });
      fetchViolations();
    } catch (error) {
      notification.error({ message: 'Lỗi', description: 'Không thể cập nhật trạng thái' });
    }
  };

  const columns = [
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (text) => <Tag color="blue" className="text-lg font-bold">{text}</Tag>,
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'violationType',
      key: 'violationType',
      render: (text) => <span className="font-semibold text-red-600">{text}</span>
    },
    {
      title: 'Thời gian',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (text) => new Date(text).toLocaleString('vi-VN')
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'photoUrls',
      key: 'photoUrls',
      render: (urls) => {
        let parsed = urls;
        try { if (typeof urls === 'string') parsed = JSON.parse(urls); } catch(e){}
        return parsed && parsed.length > 0 ? (
          <Image width={80} src={parsed[0]} alt="Vi phạm" className="rounded" />
        ) : 'Không có';
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'PENDING' 
          ? <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag> 
          : <Tag icon={<CheckCircleOutlined />} color="success">Đã xử lý</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        record.status === 'PENDING' && (
          <Button type="primary" onClick={() => handleProcess(record.id)}>
            Xử lý
          </Button>
        )
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CarOutlined className="text-red-500" />
          Quản lý xe vi phạm
        </h2>
        <Button onClick={fetchViolations} loading={loading}>Làm mới</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={violations} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
