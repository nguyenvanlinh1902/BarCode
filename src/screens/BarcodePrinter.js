import React, { useState } from 'react';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import CameraScanner from '../components/CameraScanner';

/**
 * s
 * @returns {JSX.Element}
 * @constructor
 */
const BarcodePrinter = () => {
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState('order');

  const orderBarcodeMapping = {
    '#YWG38123': '12312',
    '#FWW6346': '444123123444123123',
    '#EPR1875': '1231232112312321',
  };

  const handleScanResult = (result) => {
    if (scanMode === 'order') {
      setManualInput(result);
      setOcrResult(orderBarcodeMapping[result] || '');
    } else if (scanMode === 'barcode') {
      setOcrResult(result);
    }
  };

  const handleManualInputChange = (input) => {
    setManualInput(input);
    if (scanMode === 'order') {
      setOcrResult(orderBarcodeMapping[input] || '');
    } else {
      setOcrResult(input);
    }
  };

  const handleReset = () => {
    setOcrResult('');
    setManualInput('');
  };

  return (
    <div>
      <h1>Barcode Scanner & Printer</h1>
      <CameraScanner
        scanMode={scanMode}
        orderBarcodeMapping={orderBarcodeMapping}
        onScanResult={handleScanResult}
      />
      <div>
        <label>
          <input
            type="radio"
            value="order"
            checked={scanMode === 'order'}
            onChange={() => setScanMode('order')}
          />
          Scan Order ID
        </label>
        <label>
          <input
            type="radio"
            value="barcode"
            checked={scanMode === 'barcode'}
            onChange={() => setScanMode('barcode')}
          />
          Scan Barcode
        </label>
      </div>

      <ManualInput
        scanMode={scanMode}
        value={manualInput}
        onChange={handleManualInputChange}
      />

      <Controls
        ocrResult={ocrResult}
        manualInput={manualInput}
        onReset={handleReset}
      />

      {((scanMode === 'order' && ocrResult) ||
        (scanMode !== 'order' && manualInput)) && (
        <BarcodePreview value={ocrResult || manualInput} />
      )}
    </div>
  );
};

export default BarcodePrinter;
