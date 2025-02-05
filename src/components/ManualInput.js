import React from 'react';

/**
 *
 * @param scanMode
 * @param value
 * @param onChange
 * @returns {JSX.Element}
 * @constructor
 */
export const ManualInput = ({ scanMode, value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={scanMode === 'order' ? 'Enter Order ID' : 'Enter Barcode'}
    />
  );
};
