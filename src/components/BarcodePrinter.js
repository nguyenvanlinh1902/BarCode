import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import JsBarcode from 'jsbarcode';
import styles from './BarcodePrinter.module.css';

const BarcodePrinter = () => {
  const [ocrResult, setOcrResult] = useState('');
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const intervalRef = useRef(null);

  const barcodeArray = ['#YWG38123', '#FWW6346', '#EPR1875'];

  useEffect(() => {
    if (previewCanvasRef.current && (manualInput || ocrResult)) {
      try {
        JsBarcode(previewCanvasRef.current, manualInput || ocrResult, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (e) {
        console.error('Error generating preview barcode:', e);
      }
    }
  }, [manualInput, ocrResult]);

  const handlePrint = () => {
    if (!ocrResult && !manualInput) return;

    const barcode = manualInput || ocrResult;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print Barcode</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.0/JsBarcode.all.min.js"></script>
</head>
<body>
    <canvas id="barcodeCanvas"></canvas>

    <script>
        window.onload = function() {
            JsBarcode("#barcodeCanvas", "${barcode}", {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 14,
                margin: 10
            });
            setTimeout(() => window.print(), 500);
        }
    </script>

    <style>
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
            canvas {
                max-width: 100%;
                height: auto;
            }
        }
        body {
            margin: 20px;
            font-family: monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        canvas {
            max-width: 100%;
        }
    </style>
</body>
</html>
        `);
    printWindow.document.close();
  };

  const handleManualInput = (e) => {
    setManualInput(e.target.value);
  };

  const handleReset = () => {
    setOcrResult('');
    setScanned(false);
    setIsScanning(false);
    setManualInput('');
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startCamera = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    try {
      videoElement.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      intervalRef.current = setInterval(() => {
        if (scanned) {
          clearInterval(intervalRef.current);
          stopScanning();
          return;
        }
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          captureFrame(canvasElement, videoElement);
        }
      }, 1000);
    } catch (err) {
      console.error('Error accessing the camera:', err);
    }
  };

  const captureFrame = (canvas, video) => {
    if (!isScanning || scanned) return;

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob || !isScanning) return;

        Tesseract.recognize(blob, 'eng', {
          logger: (m) => console.log(m),
        })
          .then(({ data: { text } }) => {
            if (!isScanning) return;

            const foundBarcode = barcodeArray.find((barcode) =>
              text.includes(barcode)
            );

            if (foundBarcode) {
              setOcrResult(foundBarcode);
              setScanned(true);
              stopScanning();
            } else {
              console.log('No matching barcode found, continuing scan...');
            }
          })
          .catch((error) => {
            if (error.message !== "parameter 1 is not of type 'Blob'") {
              console.error('OCR error:', error);
            }
          });
      }, 'image/jpeg');
    } catch (error) {
      console.error('Frame capture error:', error);
    }
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsScanning(false);
    setScanned(true);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isScanning) {
      startCamera();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (videoRef.current && videoRef.current.srcObject) {
        stopScanning();
      }
    };
  }, [isScanning, startCamera]);

  return (
    <div className={styles.container}>
      <div className={styles.headerInfo}>
        <h1 className={styles.title}>Barcode Scanner & Printer</h1>
      </div>

      {isScanning && (
        <div className={styles.cameraContainer}>
          <video ref={videoRef} autoPlay playsInline className={styles.video} />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className={styles.manualInputContainer}>
        <input
          type="text"
          value={manualInput}
          onChange={handleManualInput}
          placeholder="Enter barcode text"
          className={styles.input}
        />
      </div>

      <div className={styles.controls}>
        {!isScanning && !scanned && (
          <button onClick={() => setIsScanning(true)} className={styles.button}>
            Start Scanning
          </button>
        )}
        {isScanning && (
          <button onClick={stopScanning} className={styles.button}>
            Stop Scanning
          </button>
        )}
        <button
          onClick={handlePrint}
          className={styles.button}
          disabled={!ocrResult && !manualInput}
        >
          Print Barcode
        </button>
        <button
          onClick={handleReset}
          className={`${styles.button} ${styles.resetButton}`}
          disabled={!ocrResult && !isScanning && !manualInput}
        >
          Reset
        </button>
      </div>

      {(ocrResult || manualInput) && (
        <div className={styles.resultContainer}>
          <h3>Barcode Preview:</h3>
          <pre className={styles.barcodeText}>{manualInput || ocrResult}</pre>
          <canvas ref={previewCanvasRef} />
        </div>
      )}
    </div>
  );
};

export default BarcodePrinter;
