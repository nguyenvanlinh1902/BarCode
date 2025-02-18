import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import HomePage from './pages/HomePage';
import NotFound from './pages/Page404';
import Sidebar from './components/Sidebar';
import PrintBarcode from './pages/PrintBarcode';
import ScanBarcode from './pages/ScanBarcode';
import History from './pages/History';
import './App.css';

/**
 * Main App component with routing configuration
 * @returns {JSX.Element}
 */
function App() {
  const baseUrl = process.env.PUBLIC_URL || '';
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [isNavOpen, setIsNavOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsNavOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateUserRole = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <BrowserRouter>
      <div className="app">
        {userRole && (
          <Sidebar
            isOpen={isNavOpen}
            onToggle={toggleNav}
            onlogOut={updateUserRole}
          />
        )}
        <div
          className={`main-content ${userRole ? `with-sidebar ${isNavOpen ? 'nav-open' : 'nav-closed'}` : ''}`}
        >
          <div className="screen-container">
            <Routes>
              <Route
                path={`${baseUrl}/login`}
                element={<LoginScreen onLogin={updateUserRole} />}
              />
              {/*<Route path={`${baseUrl}/home`} element={<HomePage />} />*/}
              <Route
                path={`${baseUrl}/print-barcode`}
                element={<PrintBarcode />}
              />
              <Route
                path={`${baseUrl}/scan-barcode`}
                element={<ScanBarcode />}
              />
              {/*<Route path={`${baseUrl}/history`} element={<History />} />*/}
              <Route
                path={`${baseUrl}/`}
                element={<Navigate to="/login" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
