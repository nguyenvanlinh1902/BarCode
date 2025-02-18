import React from 'react';
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
  const userRole = localStorage.getItem('userRole');

  const { tableData, handlePrintAndUpdateStatus, handleFileUpload } =
    useOrderData();

  usePrintRequests(userRole, handlePrintAndUpdateStatus);

  const handleScannedCode = async (scannedCode) => {
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
