import React, { useState, useMemo } from 'react';

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
  const [sortConfig, setSortConfig] = useState({
    key: 'orderId',
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedData = useMemo(() => {
    if (!tableData) return [];

    return [...tableData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [tableData, sortConfig]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return (
      <span className="sort-icon">
        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
      </span>
    );
  };

  const renderSortableHeader = (key, label) => (
    <th
      onClick={() => handleSort(key)}
      className="data-table__header-cell"
      style={{ cursor: 'pointer' }}
    >
      {label}
      <SortIcon column={key} />
    </th>
  );

  const renderTableHeaders = () => {
    if (userRole === 'ADMIN') {
      return (
        <tr>
          {renderSortableHeader('orderId', 'Order ID')}
          {renderSortableHeader('printCode', 'Print Code')}
          {renderSortableHeader('printed', 'Printed')}
          {renderSortableHeader('recipttedAt', 'Receipted At')}
          {renderSortableHeader('scanned', 'Scanned')}
          {renderSortableHeader('serries', 'Series')}
          <th>Actions</th>
        </tr>
      );
    }
    return (
      <tr>
        {renderSortableHeader('orderId', 'Order ID')}
        {renderSortableHeader('printCode', 'Print Code')}
        {renderSortableHeader('scanned', 'Scanned')}
      </tr>
    );
  };

  const renderTableRow = (row) => {
    const getStatusClass = (status) => {
      return status
        ? 'status-badge status-badge--success'
        : 'status-badge status-badge--pending';
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
          second: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    };

    const getPrintDatesTooltip = (dates) => {
      if (!dates || dates.length === 0) return 'Chưa in';
      return dates.map(date => formatDate(date)).join('\n');
    };

    if (userRole === 'ADMIN') {
      return (
        <tr key={row.orderId} className="data-table__row">
          <td className="data-table__cell">{row.orderId}</td>
          <td className="data-table__cell">{row.printCode}</td>
          <td className="data-table__cell" title={`Số lần in: ${row.printCount || 0}\nLịch sử in:\n${getPrintDatesTooltip(row.printDates)}`}>
            <span className={getStatusClass(row.printed)}>
              {row.printed ? 'Yes' : 'No'}
            </span>
          </td>
          <td className="data-table__cell" title={`Thời gian nhận: ${formatDate(row.recipttedAt)}`}>
            {formatDate(row.recipttedAt)}
          </td>
          <td className="data-table__cell" title={`Trạng thái quét: ${row.scanned ? 'Đã quét' : 'Chưa quét'}`}>
            <span className={getStatusClass(row.scanned)}>
              {row.scanned ? 'Yes' : 'No'}
            </span>
          </td>
          <td className="data-table__cell" title={`Series: ${row.serries || 'Không có'}`}>
            {row.serries}
          </td>
          <td className="data-table__cell data-table__cell--actions">
            <button
              className="action-button"
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
            {row.scanned ? 'Yes' : 'No'}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className={`${className} data-table-container`}>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead className="data-table__header">{renderTableHeaders()}</thead>
          <tbody className="data-table__body">
            {sortedData.length > 0 ? (
              sortedData.map((row) => renderTableRow(row))
            ) : (
              <tr>
                <td
                  colSpan={userRole === 'ADMIN' ? 7 : 3}
                  className="data-table__cell data-table__cell--no-data"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
