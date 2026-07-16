import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Card, Typography, Spin } from 'antd';

const { Title, Text } = Typography;

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    if (!vnp_ResponseCode) {
      setLoading(false);
      setStatus('error');
      setMessage('Không tìm thấy thông tin giao dịch hợp lệ.');
      return;
    }

    if (vnp_ResponseCode === '00') {
      setStatus('success');
      // Thông báo VNPay thành công
      setMessage(`Thanh toán thành công! Mã GD: ${vnp_TxnRef}`);
      
    } else {
      setStatus('error');
      setMessage('Giao dịch thất bại hoặc đã bị huỷ. Mã lỗi VNPay: ' + vnp_ResponseCode);
    }
    setLoading(false);
  }, [searchParams]);

  const handleReturn = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg rounded-2xl text-center p-6 border-0">
        {loading ? (
          <div className="py-12 space-y-4">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#3b82f6' }} spin />} />
            <div className="text-slate-500 font-medium">Đang xử lý kết quả thanh toán...</div>
          </div>
        ) : status === 'success' ? (
          <div className="py-8 space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-200">
              <CheckCircleOutlined style={{ fontSize: 48 }} />
            </div>
            <div className="space-y-2">
              <Title level={3} className="!text-slate-800 !m-0 !font-black tracking-tight">Thanh toán thành công!</Title>
              <Text className="text-slate-500 text-base">{message}</Text>
            </div>
            <div className="pt-6">
              <Button type="primary" size="large" block className="bg-blue-600 font-bold rounded-xl h-12 shadow-md shadow-blue-500/20" onClick={() => navigate('/')}>
                Quay về Trang chủ
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-6">
            <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-rose-200">
              <CloseCircleOutlined style={{ fontSize: 48 }} />
            </div>
            <div className="space-y-2">
              <Title level={3} className="!text-slate-800 !m-0 !font-black tracking-tight">Thanh toán thất bại</Title>
              <Text className="text-slate-500 text-base">{message}</Text>
            </div>
            <div className="pt-6">
              <Button size="large" block className="border-rose-200 text-rose-600 font-bold rounded-xl h-12 hover:border-rose-300 hover:text-rose-700" onClick={handleReturn}>
                Quay lại
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentResult;
