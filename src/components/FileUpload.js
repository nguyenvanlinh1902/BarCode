import React from 'react';

/**
 *
 * @param onFileUpload
 * @returns {JSX.Element}
 * @constructor
 */
export const FileUpload = ({ onFileUpload }) => {
  return (
    <div className="barcode-printer__file-section">
      <label className="file-upload">
        Import Excel File
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="file-upload__input"
        />
      </label>
    </div>
  );
};
