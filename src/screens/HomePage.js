import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import '../styles/globalStyles.css';

const HomePage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (!userRole) {
      navigate('/login');
    }
  }, [userRole, navigate]);

  const handlePrint = () => {
    navigate('/barcode-printer');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const renderAdminContent = () => (
    <div>
      <h3 className="welcome-text">Chào mừng Admin</h3>
      <CustomButton
        title="In mã vạch"
        onClick={handlePrint}
        className="action-button"
      />
      <CustomButton
        title="Quản lý người dùng"
        onClick={() => alert('Chức năng đang phát triển')}
        className="action-button"
      />
    </div>
  );

  const renderShipperContent = () => (
    <div>
      <h3 className="welcome-text">Chào mừng Đơn vị vận chuyển</h3>
      <CustomButton
        title="In mã vạch"
        onClick={handlePrint}
        className="action-button"
      />
    </div>
  );

  return (
    <div className="container">
      <div className="content">
        {userRole === 'ADMIN' ? renderAdminContent() : renderShipperContent()}

        <CustomButton
          title="Đăng xuất"
          onClick={handleLogout}
          className="logout-button"
        />
      </div>
    </div>
  );
};

export default HomePage;
