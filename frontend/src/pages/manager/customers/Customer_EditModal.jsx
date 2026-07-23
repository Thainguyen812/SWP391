import { Modal, Form, Input, notification } from 'antd';
import { useEffect, useState } from 'react';
import { customerService } from '../../../services/customerService';

export const CustomerEditModal = ({ isOpen, onClose, customer, onRefresh }) => {
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      form.setFieldsValue({
        name: customer.name,
        phone: customer.phone !== 'N/A' ? customer.phone : '',
        plate: customer.plate,
      });
    } else {
      form.resetFields();
    }
  }, [customer, isOpen, form]);

  const handleSubmit = async (values) => {
    if (!customer?.id) return;
    try {
      setProcessing(true);
      await customerService.updateCustomer(customer.id, values);
      notification.success({
        message: 'Cập nhật thành công',
        description: `Đã cập nhật thông tin khách hàng ${values.name}`,
        placement: 'topRight',
      });
      onRefresh();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật khách hàng';
      notification.error({
        message: 'Lỗi',
        description: errorMsg,
        placement: 'topRight',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin khách hàng"
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={processing}
      okButtonProps={{ className: "bg-[#1677ff]" }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <Form.Item 
          name="name" 
          label="Họ và tên" 
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="Nhập họ và tên khách hàng" />
        </Form.Item>
        
        <Form.Item 
          name="phone" 
          label="Số điện thoại"
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        
        <Form.Item 
          name="plate" 
          label="Biển số xe" 
          rules={[{ required: true, message: 'Vui lòng nhập biển số xe!' }]}
        >
          <Input placeholder="Ví dụ: 51F-123.45" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
