import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ACCOUNT, SHIPPER_ACCOUNT } from '../constants/accounts';
import '../styles/globalStyles.css';
import CustomButton from '../components/CustomButton';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (
      username === ADMIN_ACCOUNT.username &&
      password === ADMIN_ACCOUNT.password
    ) {
      localStorage.setItem('userRole', 'ADMIN');
      navigate('/barcode-printer');
    } else if (
      username === SHIPPER_ACCOUNT.username &&
      password === SHIPPER_ACCOUNT.password
    ) {
      localStorage.setItem('userRole', 'SHIPPER');
      navigate('/barcode-printer');
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h2 className="title">Đăng Nhập</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          className="input"
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <CustomButton title="Đăng Nhập" onClick={handleLogin} />
      </div>
    </div>
  );
};

export default LoginScreen;
