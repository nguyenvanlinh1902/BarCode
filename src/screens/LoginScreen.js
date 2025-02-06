import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ACCOUNT, SHIPPER_ACCOUNT } from '../constants/accounts';
import '../styles/LoginScreen.css';
import PrimaryButton from '../components/PrimaryButton';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
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
      navigate('/home');
    } else if (
      username === SHIPPER_ACCOUNT.username &&
      password === SHIPPER_ACCOUNT.password
    ) {
      localStorage.setItem('userRole', 'SHIPPER');
      navigate('/home');
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Đăng Nhập</h2>

        {error && <div className="login-error">{error}</div>}

        <div className="login-form-group">
          <input
            className="login-input"
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="login-form-group">
          <input
            className="login-input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <PrimaryButton
          className="login-button"
          label="Đăng Nhập"
          onClick={handleLogin}
        />
      </div>
    </div>
  );
};

export default LoginScreen;
