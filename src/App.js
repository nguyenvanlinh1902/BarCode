import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import HomePage from './screens/HomePage';
import BarcodePrinter from './screens/BarcodePrinter';
import NotFound from './screens/Page404';

/**
 * Main App component with routing configuration
 * @returns {JSX.Element}
 */
function App() {
  const baseUrl = process.env.PUBLIC_URL || '';

  return (
    <BrowserRouter>
      <Routes>
        <Route path={`${baseUrl}/login`} element={<LoginScreen />} />
        <Route path={`${baseUrl}/home`} element={<HomePage />} />
        <Route
          path={`${baseUrl}/barcode-printer`}
          element={<BarcodePrinter />}
        />
        <Route
          path={`${baseUrl}/`}
          element={<Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
