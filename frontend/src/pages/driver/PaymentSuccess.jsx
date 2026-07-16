import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { apiClient } from '../../api/apiClient';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [amount, setAmount] = useState(0);
  const [txnRef, setTxnRef] = useState('');
  const [isTopUp, setIsTopUp] = useState(false);

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

    if (vnp_ResponseCode === '00') {
      setStatus('success');
      const parsedAmount = vnp_Amount ? parseInt(vnp_Amount) / 100 : 0;
      setAmount(parsedAmount);
      setTxnRef(vnp_TxnRef || '');

      // Relay payment details to backend IPN to ensure DB updates immediately
      const queryStr = searchParams.toString();
      apiClient.get(`/payment/vnpay-ipn?${queryStr}`)
        .then(res => console.log("Backend payment status synced successfully:", res.data))
        .catch(err => console.error("Failed to sync payment status with backend:", err));

      // Check if this was a top-up
      const pendingVnpayTxStr = localStorage.getItem('pending_vnpay_tx');
      const user = authService.getUser();
      const phoneKey = user?.phone || (user?.username && !user?.username.includes('@') ? user?.username : 'default');

      if (pendingVnpayTxStr) {
        try {
          const pendingTx = JSON.parse(pendingVnpayTxStr);
          if (pendingTx.type === 'topup' && pendingTx.amount === parsedAmount) {
            setIsTopUp(true);
            
            // Credit balance
            const balanceKey = `urbanpark_user_balance_${phoneKey}`;
            const currentBalance = parseFloat(localStorage.getItem(balanceKey) || '100000');
            const newBalance = currentBalance + parsedAmount;
            localStorage.setItem(balanceKey, newBalance.toString());

            // Add transaction to local history
            const txsKey = `urbanpark_user_transactions_${phoneKey}`;
            const savedTxsStr = localStorage.getItem(txsKey);
            const currentTxs = savedTxsStr ? JSON.parse(savedTxsStr) : [];
            
            const newTx = {
              id: vnp_TxnRef || `txn-${Date.now()}`,
              date: new Date().toLocaleString('vi-VN'),
              type: 'Nạp ví VNPAY',
              plate: '-',
              fee: `+${parsedAmount.toLocaleString('vi-VN')}₫`,
              isEntry: true,
              status: 'Thành công'
            };
            
            localStorage.setItem(txsKey, JSON.stringify([newTx, ...currentTxs]));
          }
        } catch (e) {
          console.error(e);
        }
        localStorage.removeItem('pending_vnpay_tx');
      }
    } else {
      setStatus('failed');
      localStorage.removeItem('pending_vnpay_tx');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-bold text-slate-800">Đang xử lý giao dịch...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <div className="text-emerald-500 text-6xl">
              <CheckCircleOutlined />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800">Thanh toán thành công!</h2>
              <p className="text-sm text-slate-500 font-semibold">
                Giao dịch của bạn đã được ghi nhận trên hệ thống.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-200/50">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Số tiền:</span>
                <strong className="text-slate-800 font-black text-sm">{amount.toLocaleString('vi-VN')}₫</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Mã giao dịch VNPay:</span>
                <strong className="text-slate-800 font-bold">{txnRef}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Loại giao dịch:</span>
                <strong className="text-blue-600 font-bold">{isTopUp ? 'Nạp ví điện tử' : 'Đăng ký Vé Tháng VIP'}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/driver')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeftOutlined /> Quay lại Trang chủ
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-5">
            <div className="text-red-500 text-6xl">
              <CloseCircleOutlined />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800">Thanh toán thất bại!</h2>
              <p className="text-sm text-slate-500 font-semibold">
                Giao dịch bị từ chối hoặc người dùng đã hủy thanh toán.
              </p>
            </div>

            <button
              onClick={() => navigate('/driver')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeftOutlined /> Quay lại Trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
