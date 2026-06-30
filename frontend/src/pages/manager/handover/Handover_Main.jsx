import React, { useState, useEffect } from 'react';
import { Table, Tag, Card } from 'antd';
import { PageLayout } from '../../../components/common/PageLayout';
import { personnelService } from '../../../services/personnelService';

export const HandoverMain = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const result = await personnelService.getShiftsToday();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch handover history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const columns = [
    {
      title: 'Nhân viên trực',
      dataIndex: 'assignedStaff',
      key: 'assignedStaff',
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'Ca trực',
      dataIndex: 'shiftName',
      key: 'shiftName',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'time',
      key: 'time',
      render: (text) => text ? new Date(text).toLocaleString('vi-VN') : 'Không xác định'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'ACTIVE' || status === 'Đang trực') color = 'green';
        else if (status === 'COMPLETED' || status === 'Hoàn thành') color = 'blue';
        return <Tag color={color}>{status === 'ACTIVE' ? 'Đang trực' : (status === 'COMPLETED' ? 'Hoàn thành' : status)}</Tag>;
      }
    }
  ];

  return (
    <PageLayout title="Quản lý bàn giao ca" subtitle="Xem toàn bộ lịch sử ca trực và trạng thái bàn giao của nhân viên">
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