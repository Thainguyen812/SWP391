import { Modal } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

export const VipApprovalModal = ({ isOpen, onClose, customer, onApprove, onReject, processing }) => {
  if (!customer) return null;

  const userStr = localStorage.getItem('user');
  let userRole = '';
  if (userStr) {
    try {
      userRole = JSON.parse(userStr).role;
    } catch (e) {}
  }

  return (
    <Modal
      title={<span className="text-lg font-bold text-gray-800 dark:text-gray-100">Duyệt Đăng ký VIP</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
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
        </div>

        {/* Hình ảnh minh chứng */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-slate-600 pb-2">
            Hình ảnh minh chứng
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {customer.photos_urls?.map((url, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {idx === 0 ? "Ảnh chụp xe" : "Giấy tờ tùy thân / Cà vẹt xe"}
                </p>
                <div className="w-full h-48 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                  <img 
                    src={url} 
                    alt={`Evidence ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
            {(!customer.photos_urls || customer.photos_urls.length === 0) && (
              <div className="col-span-2 py-8 text-center text-gray-500">
                Không có hình ảnh minh chứng.
              </div>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        {userRole === 'MANAGER' ? (
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
            Chỉ Quản lý (Manager) mới có quyền phê duyệt hồ sơ VIP.
          </div>
        )}
      </div>
    </Modal>
  );
};
