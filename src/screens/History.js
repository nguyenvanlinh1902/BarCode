import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/FirebaseService';
import '../styles/screens/History.css';

const History = () => {
  const [exportBatches, setExportBatches] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    batchNumber: '',
  });

  useEffect(() => {
    fetchExportBatches();
  }, [filters]);

  const fetchExportBatches = async () => {
    try {
      const batches = await firebaseService.getExportBatches(filters);
      setExportBatches(batches);
    } catch (error) {
      console.error('Error fetching export batches:', error);
    }
  };

  const renderBatchDetails = (batch) => {
    const completionRate = (batch.scannedItems / batch.totalItems) * 100;

    return (
      <div className="batch-card" key={batch.id}>
        <div className="batch-header">
          <h3>Lô #{batch.batchNumber}</h3>
          <span className={`status-badge status-${batch.status}`}>
            {batch.status === 'pending' ? 'Đang xử lý' : 
             batch.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
          </span>
        </div>
        
        <div className="batch-info">
          <p>Ngày xuất: {new Date(batch.exportDate).toLocaleDateString('vi-VN')}</p>
          <p>Tổng số items: {batch.totalItems}</p>
          <p>Đã quét: {batch.scannedItems}</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{width: `${completionRate}%`}}
            ></div>
          </div>
        </div>
        
        <div className="batch-items">
          <h4>Chi tiết items:</h4>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Mã vạch</th>
                <th>Trạng thái</th>
                <th>Thời gian quét</th>
              </tr>
            </thead>
            <tbody>
              {batch.items.map(item => (
                <tr key={item.orderId}>
                  <td>{item.orderId}</td>
                  <td>{item.barcode}</td>
                  <td>{item.scanned ? 'Đã quét' : 'Chưa quét'}</td>
                  <td>{item.scannedAt ? new Date(item.scannedAt).toLocaleString('vi-VN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="history-screen">
      <h1>Lịch sử xuất hàng</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Mã lô:</label>
          <input 
            type="text" 
            value={filters.batchNumber}
            onChange={(e) => setFilters({...filters, batchNumber: e.target.value})}
            placeholder="Nhập mã lô..."
          />
        </div>
      </div>

      <div className="export-batches">
        {exportBatches.map(renderBatchDetails)}
      </div>
    </div>
  );
};

export default History; 