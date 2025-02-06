import React from 'react';
import '../styles/screens/globalStyles.css';

/**
 *
 * @param title
 * @param onClick
 * @param className
 * @returns {JSX.Element}
 * @constructor
 */
const CustomButton = ({ title, onClick, className = '' }) => {
  return (
    <button className={`button ${className}`} onClick={onClick}>
      {title}
    </button>
  );
};

export default CustomButton;
