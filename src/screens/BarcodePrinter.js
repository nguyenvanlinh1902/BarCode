import React, { useEffect, useState } from 'react';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import CameraScanner from '../components/CameraScanner';
import * as XLSX from 'xlsx';
import '../styles/screens/BarcodePrinter.css';
import { firebaseService } from '../services/FirebaseService';

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

  const appendAndSaveData = async (newData) => {
    try {
      newData.forEach((newRow) => {
        const existingIndex = tableData?.findIndex(
          (row) => row.orderId === newRow.orderId
        );
        if (existingIndex >= 0) {
          tableData[existingIndex] = {
            ...tableData[existingIndex],
            ...newRow,
          };
        } else {
          tableData.push(newRow);
        }
      });

      tableData.sort((a, b) => a.orderId.localeCompare(b.orderId));

      localStorage.setItem('barcodeData', JSON.stringify(tableData));

      setTableData(tableData);
      setOrderBarcodeMapping(createOrderBarcodeMapping(tableData));

      console.log('Data successfully appended and saved');
      return tableData;
    } catch (error) {
      console.error('Error appending and saving data:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const data = await firebaseService.getAll('orders');
      setTableData(data);
      setOrderBarcodeMapping(createOrderBarcodeMapping(data));
      console.log('Data from Firebase!/n Data:', data);
    } catch (err) {
      console.error('Error fetching barcode data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScannedCode = (scannedCode) => {
    if (scanMode === 'order') {
      setManualInput(scannedCode);
      const barcodeValue = orderBarcodeMapping[scannedCode];
      if (barcodeValue) {
        setOcrResult(barcodeValue);
        handlePrintAndUpdateStatus(scannedCode).then();
      }
    } else {
      setOcrResult(scannedCode);
      handleShipperScan(scannedCode).then();
    }
  };

  const handlePrintAndUpdateStatus = async (orderId) => {
    try {
      const updatedData = tableData.map((item) => {
        if (item.orderId === orderId) {
          return { ...item, printed: true };
        }
        return item;
      });

      await appendAndSaveData(updatedData);

      const printWindow = window.open('', '_blank');
      const barcodeToPrint = orderBarcodeMapping[orderId];

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Print Barcode</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.0/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <div class="label">
            <canvas id="barcodeCanvas"></canvas>
          </div>
          <script>
            window.onload = function() {
              JsBarcode("#barcodeCanvas", "${barcodeToPrint}", {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: true,
                fontSize: 12,
                margin: 5
              });
              setTimeout(() => window.print(), 500);
            }
          </script>
          <style>
            @page {
              size: 2in 1.2in;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 2in;
              height: 1.2in;
            }
            
            .label {
              width: 2in;
              height: 1.2in;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0.08in;
              box-sizing: border-box;
            }
            
            canvas {
              max-width: 1.84in;
              height: auto;
            }
            
            @media print {
              html, body {
                width: 2in;
                height: 1.2in;
              }
              
              .label {
                page-break-after: always;
              }
            }
          </style>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error updating printed status:', error);
    }
  };

  const handleShipperScan = async (scannedBarcode) => {
    try {
      const updatedData = tableData.map((item) => {
        if (item.printCode === scannedBarcode) {
          return { ...item, scanned: true };
        }
        return item;
      });

      await appendAndSaveData(updatedData);
    } catch (error) {
      console.error('Error updating scanned status:', error);
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
        <div className="barcode-printer__table-section">
          <table className="data-table">
            <thead className="data-table__header">{renderTableHeaders()}</thead>
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
