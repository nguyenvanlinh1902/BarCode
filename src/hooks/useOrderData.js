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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const barcodeToPrint = orderBarcodeMapping[orderId];
      const printContent = `
        <div class="label">
          <canvas id="barcodeCanvas"></canvas>
        </div>
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
      `;

      const blob = new Blob([printContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      iframe.onload = () => {
        const iframeDoc = iframe.contentDocument;

        const script = iframeDoc.createElement('script');
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.0/JsBarcode.all.min.js';

        script.onload = () => {
          iframe.contentWindow.JsBarcode('#barcodeCanvas', barcodeToPrint, {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 12,
            margin: 5,
          });

          setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
              iframe.remove();
            }, 1000);
          }, 500);
        };

        iframeDoc.head.appendChild(script);
      };

      iframe.src = blobUrl;
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
        orderId: (row.reference_id_2 || '').replace(/\s+/g, ''),
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersSnapshot, printRequestsSnapshot] = await Promise.all([
        firebaseService.getOrders(),
        firebaseService.getPrintRequests(),
      ]);

      const printRequestsMap = printRequestsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const orderId = (data.orderId || '').replace(/\s+/g, '');
        if (!acc[orderId]) {
          acc[orderId] = [];
        }
        acc[orderId].push({
          ...data,
          id: doc.id,
        });
        return acc;
      }, {});

      const mergedData = ordersSnapshot.docs.map((doc) => {
        const orderData = doc.data();
        const orderId = (orderData.orderId || '').replace(/\s+/g, '');
        const orderPrintRequests = printRequestsMap[orderId] || [];

        return {
          ...orderData,
          id: doc.id,
          orderId: orderId,
          printCount: orderPrintRequests.length,
          lastPrintDate:
            orderPrintRequests.length > 0
              ? new Date(
                  Math.max(
                    ...orderPrintRequests.map((r) => new Date(r.createdAt))
                  )
                )
              : null,
          printDates: orderPrintRequests
            .map((r) => new Date(r.createdAt))
            .sort((a, b) => b - a),
        };
      });
      console.log(mergedData);
      setTableData(mergedData);
      setOrderBarcodeMapping(createOrderBarcodeMapping(mergedData));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [createOrderBarcodeMapping]);

  return {
    tableData,
    orderBarcodeMapping,
    handlePrintAndUpdateStatus,
    handleShipperScan,
    handleFileUpload,
    loading,
    error,
  };
};
