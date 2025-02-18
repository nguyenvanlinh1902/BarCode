import React, { useState, useEffect } from 'react';
import '../styles/DataTable.css';
/**
 *
 * @param tableData
 * @param userRole
 * @param className
 * @param handleScannedCode
 * @returns {JSX.Element}
 * @constructor
 */
export const DataTable = ({
  tableData,
  userRole,
  className,
  handleScannedCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!tableData) {
      setFilteredData([]);
      return;
    }

    const filtered = tableData.filter(
      (row) =>
        row.orderId
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        row.printCode
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [tableData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusClass = (status) => {
    return status
      ? 'data-table__status data-table__status--success'
      : 'data-table__status data-table__status--pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPrintDatesTooltip = (dates) => {
    if (!dates || dates.length === 0) return 'Chưa in';
    return dates.map((date) => formatDate(date)).join('\n');
  };

  const renderTableHeaders = () => {
    if (userRole === 'ADMIN') {
      return (
        <tr className="data-table__header-row">
          <th className="data-table__header-cell">Order ID</th>
          <th className="data-table__header-cell">Print Code</th>
          <th className="data-table__header-cell">Trạng thái In</th>
          <th className="data-table__header-cell">Trạng thái quét</th>
          <th className="data-table__header-cell">Actions</th>
        </tr>
      );
    }
    return (
      <tr className="data-table__header-row">
        <th className="data-table__header-cell">Order ID</th>
        <th className="data-table__header-cell">Print Code</th>
        <th className="data-table__header-cell">Scanned</th>
      </tr>
    );
  };

  const renderTableRow = (row) => {
    if (userRole === 'ADMIN') {
      return (
        <tr key={row.orderId} className="data-table__row">
          <td className="data-table__cell">{row.orderId}</td>
          <td className="data-table__cell">{row.printCode}</td>
          <td
            className="data-table__cell"
            title={`Số lần in: ${row.printCount || 0}\nLịch sử in:\n${getPrintDatesTooltip(row.printDates)}`}
          >
            <span className={getStatusClass(row.printCount > 0)}>
              {row.printCount > 0 ? 'Đã in' : 'Chưa in'}
            </span>
          </td>
          <td
            className="data-table__cell"
            title={`Trạng thái quét: ${row.scanned ? 'Đã quét' : 'Chưa quét'}`}
          >
            <span className={getStatusClass(row.scanned)}>
              {row.scanned ? 'Đã Nhận' : 'Chưa Nhận'}
            </span>
          </td>
          <td className="data-table__cell data-table__cell--actions">
            <button
              variant="outline"
              className="data-table__button"
              onClick={() => handleScannedCode(row.orderId)}
            >
              Print
            </button>
          </td>
        </tr>
      );
    }
    return (
      <tr key={row.orderId} className="data-table__row">
        <td className="data-table__cell">{row.orderId}</td>
        <td className="data-table__cell">{row.printCode}</td>
        <td className="data-table__cell">
          <span className={getStatusClass(row.scanned)}>
            {row.scanned ? 'Đã Nhận' : 'Chưa nhận'}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className={`data-table ${className}`}>
      <div className="data-table__container">
        <div className="data-table__search">
          <input
            type="text"
            placeholder="Tìm kiếm theo Order ID hoặc Print Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="data-table__search-input"
          />
        </div>

        <div className="data-table__wrapper">
          <table className="data-table__table">
            <thead>{renderTableHeaders()}</thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => renderTableRow(row))
              ) : (
                <tr>
                  <td
                    colSpan={userRole === 'ADMIN' ? 5 : 3}
                    className="data-table__cell data-table__cell--empty"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="data-table__pagination">
          <div className="data-table__pagination-info">
            Hiển thị {Math.min(startIndex + 1, filteredData.length)} -{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} trong
            tổng số {filteredData.length} kết quả
          </div>
          <div className="data-table__pagination-controls">
            <button
              variant="outline"
              className="data-table__pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="data-table__pagination-current">
              Trang {currentPage} / {totalPages || 1}
            </span>
            <button
              variant="outline"
              className="data-table__pagination-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
