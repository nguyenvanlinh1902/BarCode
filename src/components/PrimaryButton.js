import React from 'react';
import '../styles/screens/PrimaryButton.css';

/**
 *
 * @param label
 * @param onClick
 * @param className
 * @param disabled
 * @returns {JSX.Element}
 * @constructor
 */
const PrimaryButton = ({ label, onClick, className, disabled }) => {
  return (
    <button
      className={`primary-button ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
