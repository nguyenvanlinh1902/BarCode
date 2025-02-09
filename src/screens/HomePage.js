import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import '../styles/screens/globalStyles.css';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
const HomePage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const features = {
    ADMIN: [
      {
        title: 'In mã vạch',
        description: 'Tạo và in mã vạch cho các đơn hàng',
        icon: '🖨️',
        path: '/print-barcode'
      },
      {
        title: 'Quét mã vạch',
        description: 'Quét và xác nhận mã vạch đơn hàng',
        icon: '📱',
        path: '/scan-barcode'
      },
      {
        title: 'Lịch sử',
        description: 'Xem lịch sử in và quét mã vạch',
        icon: '📋',
        path: '/history'
      }
    ],
    SHIPPER: [
      {
        title: 'Quét mã vạch',
        description: 'Quét mã vạch để xác nhận đơn hàng',
        icon: '📱',
        path: '/scan-barcode'
      },
      {
        title: 'Lịch sử',
        description: 'Xem lịch sử quét mã vạch',
        icon: '📋',
        path: '/history'
      }
    ]
  };

  const currentFeatures = features[userRole] || [];

  return (
    <div className="home-container">
      <h1>Chào mừng đến với Hệ thống quản lý mã vạch</h1>
      <div className="features-grid">
        {currentFeatures.map((feature, index) => (
          <div key={index} className="feature-card" onClick={() => navigate(feature.path)}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
