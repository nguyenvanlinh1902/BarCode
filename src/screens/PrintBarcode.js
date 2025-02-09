import React, { useState, useEffect } from 'react';
import { useOrderData } from '../hooks/useOrderData';
import { FileUpload } from '../components/FileUpload';
import { ManualInput } from '../components/ManualInput';
import { Controls } from '../components/Controls';
import { BarcodePreview } from '../components/BarcodePreview';
import { DataTable } from '../components/DataTable';
import { usePrintRequests } from '../hooks/usePrintRequests';
import { firebaseService } from '../services/FirebaseService';
import '../styles/screens/BarcodePrinter.css';
import { ExportBatch } from '../models/ExportBatch';

/**
 * PrintBarcode component
 * @returns {JSX.Element}
 */
const PrintBarcode = () => {
  const [ocrResult, setOcrResult] = useState('');
  const [manualInput, setManualInput] = useState('');
  const userRole = localStorage.getItem('userRole');
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    batchNumber: '',
    note: ''
  });

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

  const handleManualInputChange = async (input) => {
    setManualInput(input);
    const barcodeValue = orderBarcodeMapping[input] || '';
    setOcrResult(barcodeValue);

    if (barcodeValue) {
      await firebaseService.add('printRequests', {
        orderId: input,
        printed: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleReset = () => {
    setOcrResult('');
    setManualInput('');
  };

  const handleCreateNewBatch = async () => {
    try {
      const selectedItems = unassignedItems.filter(item => item.selected);
      if (selectedItems.length === 0) {
        alert('Vui lòng chọn ít nhất một item để tạo lô xuất');
        return;
      }

      const batchData = new ExportBatch({
        batchNumber: newBatchData.batchNumber,
        note: newBatchData.note,
        items: selectedItems,
        totalItems: selectedItems.length,
        scannedItems: 0,
        status: 'pending'
      });

      const batchId = await firebaseService.createExportBatch(batchData);
      await firebaseService.updateItemsBatchAssignment(selectedItems.map(item => item.id), batchId);
      
      setShowNewBatchModal(false);
      setNewBatchData({ batchNumber: '', note: '' });
      fetchUnassignedItems();
    } catch (error) {
      console.error('Error creating new batch:', error);
      alert('Có lỗi xảy ra khi tạo lô xuất mới');
    }
  };

  const renderUnassignedItemsTable = () => (
    <div className="unassigned-items-section">
      <div className="section-header">
        <h2>Danh sách chưa xuất</h2>
        <button 
          className="create-batch-btn"
          onClick={() => setShowNewBatchModal(true)}
        >
          Tạo lô xuất mới
        </button>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox"
                onChange={(e) => {
                  setUnassignedItems(items => 
                    items.map(item => ({...item, selected: e.target.checked}))
                  );
                }}
              />
            </th>
            <th>Order ID</th>
            <th>Mã vạch</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {unassignedItems.map(item => (
            <tr key={item.id}>
              <td>
                <input 
                  type="checkbox"
                  checked={item.selected || false}
                  onChange={(e) => {
                    setUnassignedItems(items =>
                      items.map(i => 
                        i.id === item.id ? {...i, selected: e.target.checked} : i
                      )
                    );
                  }}
                />
              </td>
              <td>{item.orderId}</td>
              <td>{item.barcode}</td>
              <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderNewBatchModal = () => (
    showNewBatchModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Tạo lô xuất mới</h2>
          
          <div className="form-group">
            <label>Mã lô:</label>
            <input 
              type="text"
              value={newBatchData.batchNumber}
              onChange={(e) => setNewBatchData({
                ...newBatchData,
                batchNumber: e.target.value
              })}
              placeholder="Nhập mã lô..."
            />
          </div>

          <div className="form-group">
            <label>Ghi chú:</label>
            <textarea
              value={newBatchData.note}
              onChange={(e) => setNewBatchData({
                ...newBatchData,
                note: e.target.value
              })}
              placeholder="Nhập ghi chú..."
            />
          </div>

          <div className="selected-items-info">
            Số lượng items đã chọn: {unassignedItems.filter(item => item.selected).length}
          </div>

          <div className="modal-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowNewBatchModal(false)}
            >
              Hủy
            </button>
            <button 
              className="create-btn"
              onClick={handleCreateNewBatch}
            >
              Tạo lô
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="barcode-printer">
      <h1 className="barcode-printer__title">Barcode Printer</h1>
      <div className="barcode-printer__container">
        <FileUpload onFileUpload={handleFileUpload} />
        <div className="barcode-printer__input-section">
          <ManualInput
            scanMode="order"
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

          {ocrResult && (
            <BarcodePreview
              value={ocrResult}
              className="barcode-printer__preview"
            />
          )}
        </div>

        <DataTable
          tableData={tableData}
          userRole={userRole}
          handleScannedCode={handleScannedCode}
          className="barcode-printer__table-section"
        />

        {renderUnassignedItemsTable()}
        {renderNewBatchModal()}
      </div>
    </div>
  );
};

export default PrintBarcode;
