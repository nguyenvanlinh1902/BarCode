import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import '../styles/screens/globalStyles.css';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
const HomePage = () => {
  const history = useHistory();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (!userRole) {
      history.push('/login');
    }
  }, [userRole]);

  const handlePrint = () => {
    history.push('/barcode-printer');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    history.push('/login');
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
        title="Quét mã vạch"
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
