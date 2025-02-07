import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { firebaseService } from '../services/FirebaseService';

/**
 *
 * @returns {{handlePrintAndUpdateStatus: ((function(*): Promise<void>)|*), handleFileUpload: ((function(*): Promise<void>)|*), handleShipperScan: ((function(*): Promise<void>)|*), tableData: *[], orderBarcodeMapping: {}}}
 */
export const useOrderData = () => {
  const [tableData, setTableData] = useState([]);
  const [orderBarcodeMapping, setOrderBarcodeMapping] = useState({});

  const createOrderBarcodeMapping = useCallback((data) => {
    return data.reduce((acc, row) => {
      acc[row.orderId] = row.printCode;
      return acc;
    }, {});
  }, []);

  const handlePrintAndUpdateStatus = async (orderId) => {
    try {
      const updatedData = tableData.map((item) => {
        if (item.orderId === orderId) {
          firebaseService.update('orders', item.id, { ...item, printed: true });
          return { ...item, printed: true };
        }
        return item;
      });

      setTableData(updatedData);

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
              width: 1.97in;
              height: 1.18in;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0.05in;
              box-sizing: border-box;
            }
            
            canvas {
              max-width: 1.87in;
              height: auto;
            }
            
            @media print {
              html, body {
                width: 1.97in;
                height: 1.18in;
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
          firebaseService.update('orders', item.id, { ...item, scanned: true });
          return { ...item, scanned: true };
        }
        return item;
      });

      setTableData(updatedData);
    } catch (error) {
      console.error('Error updating scanned status:', error);
    }
  };

  const handleFileUpload = async (event) => {
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

      const updatedData = await firebaseService.addBulkOrders(formattedData);
      setTableData(updatedData);
      setOrderBarcodeMapping(createOrderBarcodeMapping(updatedData));
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await firebaseService.getAll('orders');
        setTableData(data);
        setOrderBarcodeMapping(createOrderBarcodeMapping(data));
      } catch (err) {
        console.error('Error fetching barcode data:', err);
      }
    };
    fetchData();
  }, [createOrderBarcodeMapping]);

  return {
    tableData,
    orderBarcodeMapping,
    handlePrintAndUpdateStatus,
    handleShipperScan,
    handleFileUpload,
  };
};
