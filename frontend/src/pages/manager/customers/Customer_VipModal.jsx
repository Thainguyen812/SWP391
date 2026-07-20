import { useState } from 'react';
import { Modal } from 'antd';
import { CheckOutlined, CloseOutlined, ZoomInOutlined } from '@ant-design/icons';

const PHOTO_LABELS = [
  '1. CÀ VẸT / ĐĂNG KÝ XE',
  '2. CMND / CCCD CHỦ XE',
  '3. ẢNH THỰC TẾ ĐẦU XE'
];

export const VipApprovalModal = ({ isOpen, onClose, customer, onApprove, onReject, processing }) => {
  const [previewImg, setPreviewImg] = useState(null);

  if (!customer) return null;

  const userStr = localStorage.getItem('user');
  let userRole = '';
  if (userStr) {
    try {
      userRole = JSON.parse(userStr).role;
    } catch (e) {}
  }

  const canApprove = userRole === 'MANAGER' || userRole === 'ADMIN';
  const photos = customer.photos_urls || [];

  return (
    <>
    <Modal
      title={<span className="text-lg font-bold text-gray-800 dark:text-gray-100">Duyệt Đăng ký VIP</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={820}
      className="dark:bg-slate-800"
      styles={{
        content: { backgroundColor: 'var(--tw-bg-opacity, #fff)' },
        header: { backgroundColor: 'transparent', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }
      }}
    >
      <div className="flex flex-col gap-6 py-4">
        {/* Thông tin khách hàng */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Họ và tên</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Biển số xe</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 px-2 py-1 bg-gray-200 dark:bg-slate-600 rounded inline-block">
              {customer.plate}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loại thẻ yêu cầu</p>
            <span className="bg-[#041627] text-white text-xs px-2 py-0.5 rounded font-medium">VIP</span>
          </div>
          {customer.expireDate && customer.expireDate !== 'N/A' && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày hết hạn</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{customer.expireDate}</p>
            </div>
          )}
        </div>

        {/* TÀI LIỆU XÁC THỰC VIP */}
        <div>
          <div className="mb-3 border-b border-gray-200 dark:border-slate-600 pb-2">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-sm">
              Tài liệu xác thực VIP
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tài xế cần cung cấp cà vẹt, CCCD và ảnh đầu xe. Vui lòng kiểm tra kỹ trước khi duyệt.
            </p>
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {photos.map((url, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300 text-center uppercase tracking-wide">
                    {PHOTO_LABELS[idx] || `Ảnh ${idx + 1}`}
                  </p>
                  <div
                    className="relative w-full h-44 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-600 group cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => setPreviewImg(url)}
                  >
                    <img
                      src={url}
                      alt={PHOTO_LABELS[idx] || `Evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomInOutlined className="text-white text-2xl drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
              <p className="text-gray-400 dark:text-gray-500 font-medium">Không có hình ảnh minh chứng.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tài xế chưa tải lên tài liệu xác thực.</p>
            </div>
          )}

          {/* OCR Result Hint */}
          {photos.length > 0 && customer.plate && (
            <div className="mt-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckOutlined className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                Biển số đăng ký: <strong>{customer.plate}</strong>. Vui lòng đối chiếu với ảnh cà vẹt.
              </span>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        {canApprove ? (
          <div className="flex justify-end gap-3 mt-4 border-t border-gray-200 dark:border-slate-600 pt-4">
            <button
              type="button"
              onClick={() => onReject(customer.subscriptionId || customer.id)}
              disabled={processing}
              className="flex items-center gap-2 px-5 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <CloseOutlined /> Từ chối
            </button>
            <button
              type="button"
              onClick={() => onApprove(customer.subscriptionId || customer.id)}
              disabled={processing}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm shadow-green-200 dark:shadow-none"
            >
              <CheckOutlined /> Phê duyệt VIP
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-4 border-t border-gray-200 dark:border-slate-600 pt-4 text-sm text-gray-500 font-medium italic">
            Chỉ Quản lý (Manager) hoặc Admin mới có quyền phê duyệt hồ sơ VIP.
          </div>
        )}
      </div>
    </Modal>

    {/* Image Preview Lightbox */}
    <Modal
      open={!!previewImg}
      onCancel={() => setPreviewImg(null)}
      footer={null}
      width={900}
      centered
      styles={{ body: { padding: 0 }, content: { backgroundColor: 'transparent', boxShadow: 'none' } }}
    >
      {previewImg && (
        <img
          src={previewImg}
          alt="Preview"
          className="w-full rounded-lg"
          style={{ maxHeight: '80vh', objectFit: 'contain' }}
        />
      )}
    </Modal>
    </>
  );
};
