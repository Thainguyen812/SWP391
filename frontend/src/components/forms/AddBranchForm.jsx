import { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import './AddBranchForm.css';

export const AddBranchForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu cơ sở mới:", formData);
    // TODO: Gọi API lưu dữ liệu ở đây
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Thêm cơ sở đỗ xe mới</h2>
          <button onClick={onClose} className="modal-close-btn" title="Đóng">
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
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit">
              Xác nhận thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranchForm;
