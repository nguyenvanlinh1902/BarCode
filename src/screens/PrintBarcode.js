import React, { useState, useEffect } from 'react';
import { useOrderData } from '../hooks/useOrderData';
import { FileUpload } from '../components/FileUpload';
import { usePrintRequests } from '../hooks/usePrintRequests';
import { firebaseService } from '../services/FirebaseService';
import '../styles/screens/BarcodePrinter.css';
import { DataTable } from '../components/DataTable';

/**
 * PrintBarcode component
 * @returns {JSX.Element}
 */
const PrintBarcode = () => {
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const userRole = localStorage.getItem('userRole');
  const [unassignedItems, setUnassignedItems] = useState([]);

  const {
    tableData,
    orderBarcodeMapping,
    handlePrintAndUpdateStatus,
    handleFileUpload,
  } = useOrderData();

  usePrintRequests(userRole, handlePrintAndUpdateStatus);

  useEffect(() => {
    fetchUnassignedItems();
  }, [tableData]);

  const fetchUnassignedItems = async () => {
    try {
      const items = await firebaseService.getUnassignedItems();
      setUnassignedItems(items);
    } catch (error) {
      console.error('Error fetching unassigned items:', error);
    }
  };

  const handleScannedCode = async (scannedCode) => {
    setManualInput(scannedCode);
    const barcodeValue = orderBarcodeMapping[scannedCode];
    setOcrResult(barcodeValue);
    await firebaseService.add('printRequests', {
      orderId: scannedCode,
      printed: false,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Printer</h1>
      <div className="barcode-printer__container">
        <FileUpload onFileUpload={handleFileUpload} />
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

export default PrintBarcode;
