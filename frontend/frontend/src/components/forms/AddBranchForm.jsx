import { useState } from 'react';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { dashboardService } from '../../services/dashboardService';
import './AddBranchForm.css';

export const AddBranchForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await dashboardService.createBranch(formData);
      if (response.success) {
        alert("🎉 " + response.message + "\n\n(Dữ liệu trả về: ID " + response.data.id + ")");
        setFormData({ name: '', address: '', capacity: '' });
        onClose();
      }
    } catch (error) {
      alert("❌ Có lỗi xảy ra: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={!isSubmitting ? onClose : undefined}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Thêm cơ sở đỗ xe mới</h2>
          <button 
            onClick={onClose} 
            className="modal-close-btn" 
            title="Đóng"
            disabled={isSubmitting}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="branchName" className="form-label">
                Tên cơ sở <span className="text-red-500">*</span>
              </label>
              <input
                id="branchName"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="VD: Bãi xe ngầm Vincom"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="branchAddress" className="form-label">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                id="branchAddress"
                name="address"
                type="text"
                required
                className="form-input"
                placeholder="VD: 72 Lê Thánh Tôn, Quận 1, TP.HCM"
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group mb-0">
              <label htmlFor="branchCapacity" className="form-label">
                Sức chứa (số lượng xe) <span className="text-red-500">*</span>
              </label>
              <input
                id="branchCapacity"
                name="capacity"
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="VD: 500"
                value={formData.capacity}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className={`btn-submit flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting && <LoadingOutlined />}
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranchForm;
