import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import './CameraScanner.css';

const CameraScanner = ({
  scanMode,
  orderBarcodeMapping = {},
  onScanResult,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const popupRef = useRef(null);

  const orderArray = Object.keys(orderBarcodeMapping);
  const barcodeArray = Object.values(orderBarcodeMapping);
  const extractOrderId = (text) => {
    const orderIdMatch = text.match(/#EPR\d+/);
    return orderIdMatch ? orderIdMatch[0] : null;
  };
  const showPopup = () => {
    if (popupRef.current) {
      popupRef.current.classList.add('scanner__popup--visible');
    }
  };

  const hidePopup = () => {
    if (popupRef.current) {
      popupRef.current.classList.remove('scanner__popup--visible');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      intervalRef.current = setInterval(() => {
        if (scanned || waitingForContinue) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        if (
          videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA
        ) {
          captureFrame();
        }
      }, 1000);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const captureFrame = () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      scanned ||
      waitingForContinue
    )
      return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'contrast(1.4) brightness(1.2)';

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        Tesseract.recognize(blob, 'eng', {
          tessedit_char_whitelist: '#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        })
          .then(({ data: { text } }) => {
            const cleanedText = text.replace(/\s+/g, '');
            setDetectedText(cleanedText);

            if (scanMode === 'order') {
              const orderId = extractOrderId(cleanedText);
              if (orderId && orderArray.includes(orderId)) {
                handleScanSuccess(orderId);
              }
            } else if (scanMode === 'barcode' && barcodeArray.length > 0) {
              const foundBarcode = barcodeArray.find((barcode) =>
                cleanedText.includes(barcode)
              );
              if (foundBarcode) {
                handleScanSuccess(foundBarcode);
              }
            }
          })
          .catch((err) => console.error('OCR Error:', err));
      },
      'image/jpeg',
      0.95
    );
  };

  const handleScanSuccess = (result) => {
    onScanResult(result);
    stopScanning();
    setScanned(true);
    setWaitingForContinue(true);
    showPopup();
  };

  const handleContinueScanning = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    hidePopup();
    setScanned(false);
    setDetectedText('');
    setWaitingForContinue(false);
    startCamera();
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    setIsScanning(false);
    setScanned(false);
    setWaitingForContinue(false);
    hidePopup();

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScanned(false);
    setWaitingForContinue(false);
    startCamera();
  };

  useEffect(() => {
    if (orderArray.length > 0) {
      handleStartScanning();
    }
    return () => {
      stopScanning();
    };
  }, [orderArray.length]);

  return (
    <div className="scanner">
      {isScanning && (
        <button onClick={stopScanning} className="scanner__stop-button">
          ✕
        </button>
      )}

      {isScanning && (
        <>
          <div className="scanner__video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="scanner__video"
            />
            <div className="scanner__frame"></div>
          </div>

          <div className="scanner__text-container">
            <p className="scanner__text-title">Detected Text:</p>
            <div className="scanner__text-content">
              {detectedText || 'Scanning...'}
            </div>
            {scanMode === 'order' && (
              <div className="scanner__text-content">
                <p className="scanner__text-title">Extracted Order ID:</p>
                {extractOrderId(detectedText) || 'No Order ID found'}
                {orderArray.includes(extractOrderId(detectedText))
                  ? 'Order ID found'
                  : 'Order ID not found'}
                {JSON.stringify(orderArray)}
              </div>
            )}
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="scanner__canvas" />

      {!isScanning && (
        <button onClick={handleStartScanning} className="scanner__start-button">
          Start Scanning
        </button>
      )}

      <div ref={popupRef} className="scanner__popup">
        <div className="scanner__popup-content">
          <div className="scanner__popup-title">Scan Successful!</div>
          <div className="scanner__popup-message">
            Click Continue Scanning to scan next item or wait 30 seconds to
            finish
          </div>
          <button
            onClick={handleContinueScanning}
            className="scanner__continue-button"
          >
            Continue Scanning
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
