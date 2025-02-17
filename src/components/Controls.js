import React from 'react';
import { Button } from 'react-bootstrap';

/**
 *
 * @param ocrResult
 * @param manualInput
 * @param onReset
 * @returns {JSX.Element}
 * @constructor
 */
export const Controls = ({ ocrResult, manualInput, onReset }) => {
  const handlePrint = () => {
    const barcodeToPrint = ocrResult || manualInput;
    if (!barcodeToPrint) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <canvas id="barcodeCanvas"></canvas>
          <script>
            JsBarcode("#barcodeCanvas", "${barcodeToPrint}", {
              format: "CODE128",
              width: 2,
              height: 100,
              displayValue: true
            });
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={'flex-column pt-2 '}>
      <Button
        variant={'success'}
        className={'mr-2'}
        onClick={handlePrint}
        disabled={!ocrResult && !manualInput}
      >
        Print Barcode
      </Button>
      <Button
        variant={'danger'}
        onClick={onReset}
        disabled={!ocrResult && !manualInput}
      >
        Reset
      </Button>
    </div>
  );
};
