import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Sidebar.css';

const Sidebar = ({ isOpen, onToggle, onlogOut }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const adminMenuItems = [
    { path: '/home', label: 'Trang chủ', icon: '��' },
    { path: '/print-barcode', label: 'In mã vạch', icon: '🖨️' },
    { path: '/scan-barcode', label: 'Quét mã vạch', icon: '📱' },
    { path: '/history', label: 'Lịch sử', icon: '📋' },
  ];

  const shipperMenuItems = [
    { path: '/home', label: 'Trang chủ', icon: '��' },
    { path: '/scan-barcode', label: 'Quét mã vạch', icon: '📱' },
    { path: '/history', label: 'Lịch sử', icon: '📋' },
  ];

  const menuItems = userRole === 'ADMIN' ? adminMenuItems : shipperMenuItems;

  const handleLogout = () => {
    onlogOut();
    navigate('/login');
  };


  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && <h3>Barcode System</h3>}
        <button className="toggle-btn" onClick={onToggle}>
          {isOpen ? '←' : '→'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className="menu-item"
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              {isOpen && <span className="menu-text">{item.label}</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="menu-item logout" onClick={handleLogout}>
          <span className="menu-icon">🚪</span>
          {isOpen && <span className="menu-text">Đăng xuất</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 