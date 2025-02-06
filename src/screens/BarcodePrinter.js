import React, { useState, useEffect } from 'react';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import CameraScanner from '../components/CameraScanner';
import * as XLSX from 'xlsx';
import initialData from '../data/barcodeData.json';
import '../styles/BarcodePrinter.css';

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
const BarcodePrinter = () => {
  const userRole = localStorage.getItem('userRole');
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const scanMode = userRole === 'ADMIN' ? 'order' : 'barcode';

  const [tableData, setTableData] = useState([]);
  const [orderBarcodeMapping, setOrderBarcodeMapping] = useState({});

  const createOrderBarcodeMapping = (data) => {
    const mapping = {};
    data.forEach((row) => {
      mapping[row.orderId] = row.printCode;
    });
    return mapping;
  };

  const readExistingData = () => {
    try {
      const storedData = localStorage.getItem('barcodeData');
      return storedData ? JSON.parse(storedData) : initialData;
    } catch (error) {
      console.error('Error reading existing data:', error);
      return initialData;
    }
  };

  const appendAndSaveData = async (newData) => {
    try {
      const existingData = readExistingData();

      const mergedData = [...existingData];
      newData.forEach((newRow) => {
        const existingIndex = mergedData.findIndex(
          (row) => row.orderId === newRow.orderId
        );
        if (existingIndex >= 0) {
          mergedData[existingIndex] = {
            ...mergedData[existingIndex],
            ...newRow,
          };
        } else {
          mergedData.push(newRow);
        }
      });

      mergedData.sort((a, b) => a.orderId.localeCompare(b.orderId));

      localStorage.setItem('barcodeData', JSON.stringify(mergedData));

      setTableData(mergedData);
      setOrderBarcodeMapping(createOrderBarcodeMapping(mergedData));

      console.log('Data successfully appended and saved');
      return mergedData;
    } catch (error) {
      console.error('Error appending and saving data:', error);
      return null;
    }
  };

  useEffect(() => {
    const existingData = readExistingData();
    setTableData(existingData);
    setOrderBarcodeMapping(createOrderBarcodeMapping(existingData));
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

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row) => ({
        orderId: row.reference_id_2 || '',
        printCode: row.printcode || '',
        printed: Boolean(row.printed),
        recipttedAt: row.recipttedAt || '',
        scanned: Boolean(row.scanned),
        serries: row.serries || '',
      }));

      const updatedData = await appendAndSaveData(formattedData);
      if (updatedData) {
        console.log('File upload and data update successful');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const renderTableHeaders = () => {
    if (userRole === 'ADMIN') {
      return (
        <tr>
          <th>Order ID</th>
          <th>Print Code</th>
          <th>Printed</th>
          <th>Receipted At</th>
          <th>Scanned</th>
          <th>Series</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th>Order ID</th>
          <th>Print Code</th>
          <th>Scanned</th>
        </tr>
      );
    }
  };

  const renderTableRow = (row) => {
    if (userRole === 'ADMIN') {
      return (
        <tr key={row.orderId} className="data-table__row">
          <td className="data-table__cell">{row.orderId}</td>
          <td className="data-table__cell">{row.printCode}</td>
          <td className="data-table__cell">{row.printed ? 'Yes' : 'No'}</td>
          <td className="data-table__cell">{row.recipttedAt}</td>
          <td className="data-table__cell">{row.scanned ? 'Yes' : 'No'}</td>
          <td className="data-table__cell">{row.serries}</td>
        </tr>
      );
    } else {
      return (
        <tr key={row.orderId} className="data-table__row">
          <td className="data-table__cell">{row.orderId}</td>
          <td className="data-table__cell">{row.printCode}</td>
          <td className="data-table__cell">{row.scanned ? 'Yes' : 'No'}</td>
        </tr>
      );
    }
  };

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Scanner & Printer</h1>
      <div className="barcode-printer__container">
        {userRole === 'ADMIN' && (
          <div className="barcode-printer__file-section">
            <label className="file-upload">
              Import Excel File
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="file-upload__input"
              />
            </label>
          </div>
        )}
        <CameraScanner
          scanMode={scanMode}
          orderBarcodeMapping={orderBarcodeMapping}
          onScanResult={handleScanResult}
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
        <div className="barcode-printer__table-section">
          <table className="data-table">
            <thead className="data-table__header">
              {renderTableHeaders()}
            </thead>
            <tbody className="data-table__body">
              {tableData.map((row) => renderTableRow(row))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrinter;
