import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { notification } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import './Login.css'; // Sử dụng chung CSS với Login cho đồng bộ

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      notification.warning({
        message: 'Lỗi nhập liệu',
        description: 'Mật khẩu xác nhận không khớp!',
        placement: 'topRight'
      });
      return;
    }

    setLoading(true);

    const result = await authService.register(
      formData.username, 
      formData.password,
      formData.fullName,
      formData.email,
      formData.phone
    );
    
    setLoading(false);
    
    if (result.success) {
      notification.success({
        message: 'Đăng ký thành công',
        description: 'Vui lòng đăng nhập bằng tài khoản vừa tạo.',
        placement: 'topRight'
      });
      navigate('/login');
    } else {
      notification.error({
        message: 'Đăng ký thất bại',
        description: result.message,
        placement: 'topRight'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-panel" style={{ maxWidth: '500px' }}>
        <div className="login-header" style={{ marginBottom: '24px' }}>
          <div className="logo-icon">✨</div>
          <h2>Tạo Tài Khoản</h2>
          <p>Tham gia vào Hệ thống Quản lý Bãi xe</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <UserOutlined className="input-icon" />
            <input 
              type="text" name="username" placeholder="Tên đăng nhập" 
              value={formData.username} onChange={handleChange} required
            />
          </div>

          <div className="input-group">
            <IdcardOutlined className="input-icon" />
            <input 
              type="text" name="fullName" placeholder="Họ và tên" 
              value={formData.fullName} onChange={handleChange} required
            />
          </div>

          <div className="input-group">
            <MailOutlined className="input-icon" />
            <input 
              type="email" name="email" placeholder="Email" 
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <PhoneOutlined className="input-icon" />
            <input 
              type="tel" name="phone" placeholder="Số điện thoại" 
              value={formData.phone} onChange={handleChange} required
            />
          </div>
          
          <div className="input-group">
            <LockOutlined className="input-icon" />
            <input 
              type="password" name="password" placeholder="Mật khẩu" 
              value={formData.password} onChange={handleChange} required
            />
          </div>

          <div className="input-group">
            <LockOutlined className="input-icon" />
            <input 
              type="password" name="confirmPassword" placeholder="Xác nhận lại mật khẩu" 
              value={formData.confirmPassword} onChange={handleChange} required
            />
          </div>

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px', fontSize: '14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#92FE9D', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập tại đây</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
