import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { notification } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import './Login.css';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await authService.login(username, password);
    
    setLoading(false);
    
    if (result.success) {
      notification.success({
        message: 'Đăng nhập thành công',
        description: 'Chào mừng bạn đến với Hệ thống Quản lý Bãi xe!',
        placement: 'topRight'
      });
      
      const user = result.user;
      if (user && user.role === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/overview');
      }
    } else {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: result.message,
        placement: 'topRight'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-panel">
        <div className="login-header">
          <div className="logo-icon">🚗</div>
          <h2>Smart Parking</h2>
          <p>Hệ thống Quản lý Điều hành Bãi xe</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <UserOutlined className="input-icon" />
            <input 
              type="text" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <LockOutlined className="input-icon" />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px', fontSize: '14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#00C9FF', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay</Link>
          </p>
          <p>Phiên bản 4.0 - Được bảo mật bằng JWT</p>
        </div>
      </div>
    </div>
  );
};
