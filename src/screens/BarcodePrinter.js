import React, { useState, useEffect } from 'react';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import CameraScanner from '../components/CameraScanner';
import * as XLSX from 'xlsx';

const initialData = [
  {
    orderId: '#EPR1803',
    printCode: '3744911',
    printed: true,
    recipttedAt: '1738776887',
    scanned: true,
    serries: '1738776887',
  },
  {
    orderId: '#YWG38123',
    printCode: '12312',
    printed: false,
    recipttedAt: '1738776888',
    scanned: false,
    serries: '1738776888',
  },
  {
    orderId: '#FWW6346',
    printCode: '444123123444123123',
    printed: true,
    recipttedAt: '1738776889',
    scanned: true,
    serries: '1738776889',
  },
];

/**
 * s
 * @returns {JSX.Element}
 * @constructor
 */
const BarcodePrinter = () => {
  const userRole = localStorage.getItem('userRole');
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState(
    userRole === 'ADMIN' ? 'order' : 'barcode'
  );
  const [tableData, setTableData] = useState([]);
  const [orderBarcodeMapping, setOrderBarcodeMapping] = useState({});

  useEffect(() => {
    const savedData = localStorage.getItem('barcodeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setTableData(parsedData);

      const initialMapping = {};
      parsedData.forEach((row) => {
        initialMapping[row.orderId] = row.printCode;
      });
      setOrderBarcodeMapping(initialMapping);
    } else {
      setTableData(initialData);

      const initialMapping = {};
      initialData.forEach((row) => {
        initialMapping[row.orderId] = row.printCode;
      });
      setOrderBarcodeMapping(initialMapping);
    }
  }, []);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row) => ({
        orderId: row.orderId || '',
        printCode: row.printCode || '',
        printed: Boolean(row.printed),
        recipttedAt: row.recipttedAt || '',
        scanned: Boolean(row.scanned),
        serries: row.serries || '',
      }));

      const mergedData = [...tableData];
      formattedData.forEach((newRow) => {
        const existingIndex = mergedData.findIndex(
          (row) => row.orderId === newRow.orderId
        );
        if (existingIndex >= 0) {
          mergedData[existingIndex] = newRow;
        } else {
          mergedData.push(newRow);
        }
      });

      setTableData(mergedData);
      localStorage.setItem('barcodeData', JSON.stringify(mergedData));

      const newMapping = {};
      mergedData.forEach((row) => {
        newMapping[row.orderId] = row.printCode;
      });
      setOrderBarcodeMapping(newMapping);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1 className="title">Barcode Scanner & Printer</h1>
      <div className="container">
        <div className="file-input-container">
          <label className="file-input-label">
            Import Excel File
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="file-input"
            />
          </label>
        </div>
        <CameraScanner
          scanMode={scanMode}
          orderBarcodeMapping={orderBarcodeMapping}
          onScanResult={handleScanResult}
        />
        {scanMode === 'order' && (
          <>
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
          </>
        )}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Print Code</th>
                <th>Printed</th>
                <th>Receipted At</th>
                <th>Scanned</th>
                <th>Series</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.orderId}>
                  <td>{row.orderId}</td>
                  <td>{row.printCode}</td>
                  <td>{row.printed ? 'Yes' : 'No'}</td>
                  <td>{row.recipttedAt}</td>
                  <td>{row.scanned ? 'Yes' : 'No'}</td>
                  <td>{row.serries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrinter;
