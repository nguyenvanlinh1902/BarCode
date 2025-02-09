import React, { useState } from 'react';
import { useOrderData } from '../hooks/useOrderData';
import { FileUpload } from '../components/FileUpload';
import CameraScanner from '../components/CameraScanner';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import { DataTable } from '../components/DataTable';
import { usePrintRequests } from '../hooks/usePrintRequests';
import { firebaseService } from '../services/FirebaseService';
import '../styles/screens/BarcodePrinter.css';

/**
 * BarcodePrinter component
 * @returns {JSX.Element}
 */
const BarcodePrinter = () => {
  const userRole = localStorage.getItem('userRole');
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const scanMode = userRole === 'ADMIN' ? 'order' : 'barcode';

  const {
    tableData,
    orderBarcodeMapping,
    handlePrintAndUpdateStatus,
    handleShipperScan,
    handleFileUpload,
  } = useOrderData();

  usePrintRequests(userRole, handlePrintAndUpdateStatus);

  const handleScannedCode = async (scannedCode) => {
    if (scanMode === 'order') {
      setManualInput(scannedCode);
      const barcodeValue = orderBarcodeMapping[scannedCode];
      setOcrResult(barcodeValue);
      await firebaseService.add('printRequests', {
        orderId: scannedCode,
        printed: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      setOcrResult(scannedCode);
      await handleShipperScan(scannedCode);
    }
  };

  const handleManualInputChange = async (input) => {
    setManualInput(input);
    if (scanMode === 'order') {
      const barcodeValue = orderBarcodeMapping[input] || '';
      setOcrResult(barcodeValue);

      if (barcodeValue) {
        await firebaseService.add('printRequests', {
          orderId: input,
          printed: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      setOcrResult(input);
    }
  };

  const handleReset = () => {
    setOcrResult('');
    setManualInput('');
  };

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Scanner & Printer</h1>
      <div className="barcode-printer__container">
        {userRole === 'ADMIN' && <FileUpload onFileUpload={handleFileUpload} />}

        <CameraScanner
          scanMode={scanMode}
          orderBarcodeMapping={orderBarcodeMapping}
          onScanResult={handleScannedCode}
          className="barcode-printer__scanner"
        />

        {scanMode === 'order' && (
          <div className="barcode-printer__input-section">
            <ManualInput
              scanMode={scanMode}
              value={manualInput}
              onChange={handleManualInputChange}
              className="barcode-printer__manual-input"
            />

            <Controls
              ocrResult={ocrResult}
              manualInput={manualInput}
              onReset={handleReset}
              className="barcode-printer__controls"
            />

            {((scanMode === 'order' && ocrResult) ||
              (scanMode !== 'order' && manualInput)) && (
              <BarcodePreview
                value={ocrResult || manualInput}
                className="barcode-printer__preview"
              />
            )}
          </div>
        )}

        <DataTable
          tableData={tableData}
          userRole={userRole}
          handleScannedCode={handleScannedCode}
          className="barcode-printer__table-section"
        />
      </div>
    </div>
  );
};

export default BarcodePrinter;
