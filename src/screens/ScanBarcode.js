import React from 'react';
import { useOrderData } from '../hooks/useOrderData';
import CameraScanner from '../components/CameraScanner';
import '../styles/screens/BarcodePrinter.css';
import { firebaseService } from '../services/FirebaseService';

const ScanBarcode = () => {
  const userRole = localStorage.getItem('userRole');
  const scanMode = userRole === 'ADMIN' ? 'order' : 'barcode';
  const { orderBarcodeMapping, handleShipperScan } = useOrderData();

  const handleScannedCode = async (scannedCode) => {
    if (scanMode === 'order') {
      const barcodeValue = orderBarcodeMapping[scannedCode];
      await firebaseService.add('printRequests', {
        orderId: scannedCode,
        printCode: barcodeValue,
        printed: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      await handleShipperScan(scannedCode);
    }
  };

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Scanner</h1>

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
