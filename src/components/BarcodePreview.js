import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

/**
 *
 * @param value
 * @returns {JSX.Element}
 * @constructor
 */
export const BarcodePreview = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
        });
      } catch (e) {
        console.error('Barcode preview error:', e);
      }
    }
  }, [value]);

  return <canvas ref={canvasRef} />;
};
