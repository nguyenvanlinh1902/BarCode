import React from 'react';
import '../styles/PrimaryButton.css';

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