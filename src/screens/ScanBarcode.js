import React, { useState } from 'react';
import { useOrderData } from '../hooks/useOrderData';
import CameraScanner from '../components/CameraScanner';
import '../styles/screens/BarcodePrinter.css';
import { firebaseService } from '../services/FirebaseService';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
const ScanBarcode = () => {
  const [debugInfo, setDebugInfo] = useState('Waiting for scan...');
  const userRole = localStorage.getItem('userRole');
  const scanMode = userRole === 'ADMIN' ? 'order' : 'barcode';
  const { orderBarcodeMapping, handleShipperScan } = useOrderData();

  const handleScannedCode = async (scannedCode) => {
    setDebugInfo(`Received code: ${scannedCode}`);
    
    try {
      if (scanMode === 'order') {
        await firebaseService.add('printRequests', {
          orderId: scannedCode,
          printed: false,
          createdAt: new Date().toISOString(),
        });
        setDebugInfo(`Saved order: ${scannedCode}`);
      } else {
        await handleShipperScan(scannedCode);
        setDebugInfo(`Processed barcode: ${scannedCode}`);
      }
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Scanner</h1>

      <div className="debug-info" style={{
        padding: '10px',
        background: '#f0f0f0',
        margin: '10px',
        borderRadius: '4px'
      }}>
        <p>Mode: {scanMode}</p>
        <p>Status: {debugInfo}</p>
      </div>

      <div className="barcode-printer__container">
        <CameraScanner
          scanMode={scanMode}
          orderBarcodeMapping={orderBarcodeMapping}
          onScanResult={handleScannedCode}
          className="barcode-printer__scanner"
        />
      </div>
    </div>
  );
};

export default ScanBarcode;
