import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Modal, Button } from 'antd';
import { PageLayout } from '../../../components/common/PageLayout';
import { personnelService } from '../../../services/personnelService';

export const HandoverMain = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      try {
        const result = await personnelService.getHandoverHistory();
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
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            setSelectedShift(record);
            setIsModalOpen(true);
          }}
        >
          Xem chi tiết
        </Button>
      )
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
      
      <Modal
        title="Chi tiết Bàn giao ca"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedShift && (
          <div className="flex flex-col gap-3">
            <p><strong>Nhân viên:</strong> {selectedShift.assignedStaff}</p>
            <p><strong>Ca trực:</strong> {selectedShift.shiftName}</p>
            <p><strong>Trạng thái:</strong> {selectedShift.status === 'ACTIVE' ? 'Đang trực' : (selectedShift.status === 'COMPLETED' ? 'Hoàn thành' : selectedShift.status)}</p>
            <p><strong>Số lượng xe xử lý:</strong> {selectedShift.vehiclesHandled || 0} xe</p>
            <hr className="my-2 border-gray-200" />
            <p><strong>Doanh thu hệ thống:</strong> {(selectedShift.systemRevenue || 0).toLocaleString()} VNĐ</p>
            <p><strong>Tiền mặt hệ thống:</strong> {(selectedShift.systemCash || 0).toLocaleString()} VNĐ</p>
            <p><strong>Chuyển khoản (VNPay):</strong> {(selectedShift.systemTransfer || 0).toLocaleString()} VNĐ</p>
            <p className="text-blue-600 font-semibold"><strong>Tiền mặt nhân viên khai báo:</strong> {(selectedShift.declaredCash || 0).toLocaleString()} VNĐ</p>
            <p className={`${(selectedShift.declaredCash || 0) - (selectedShift.systemCash || 0) < 0 ? 'text-red-500' : 'text-green-500'} font-bold`}>
              <strong>Chênh lệch tiền mặt:</strong> {((selectedShift.declaredCash || 0) - (selectedShift.systemCash || 0)).toLocaleString()} VNĐ
            </p>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};