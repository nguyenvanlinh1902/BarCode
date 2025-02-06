import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import HomePage from './screens/HomePage';
import BarcodePrinter from './screens/BarcodePrinter';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/barcode-printer" element={<BarcodePrinter />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
