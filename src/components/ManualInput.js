import React from 'react';
import Form from 'react-bootstrap/Form';

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
    <Form.Control
      size="lg"
      value={value}
      type="text"
      onChange={(e) => onChange(e.target.value)}
      placeholder={scanMode === 'order' ? 'Enter Order ID' : 'Enter Barcode'}
    />
  );
};
