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
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      intervalRef.current = setInterval(() => {
        if (scanned || waitingForContinue || isProcessing) {
          return;
        }

        if (videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          captureFrame();
        }
      }, 500);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || scanned || waitingForContinue || isProcessing) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'contrast(1.6) brightness(1.3) grayscale(1)';
    ctx.drawImage(canvas, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }

        Tesseract.recognize(blob, 'eng', {
          tessedit_char_whitelist: '#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          tessedit_pageseg_mode: '7',
          tessedit_ocr_engine_mode: '2',
        })
          .then(({ data: { text } }) => {
            const cleanedText = text.replace(/[^#A-Z0-9]/g, '');
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
            setIsProcessing(false);
          })
          .catch((err) => {
            console.error('OCR Error:', err);
            setError('Lỗi khi xử lý ảnh. Vui lòng thử lại.');
            setIsProcessing(false);
          });
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
      {error && <div className="scanner__error">{error}</div>}

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

          {isProcessing && (
            <div className="scanner__processing">Đang xử lý...</div>
          )}
        </>
      )}
      
      <canvas ref={canvasRef} className="scanner__canvas" />

      {!isScanning && !waitingForContinue && (
        <button onClick={handleStartScanning} className="scanner__start-button">
          Start Scanning
        </button>
      )}

      <div ref={popupRef} className="scanner__popup">
        <div className="scanner__popup-content">
          <div className="scanner__popup-title">Quét thành công!</div>
          <div className="scanner__popup-message">
            Nhấn "Tiếp tục quét" để quét mã tiếp theo
          </div>
          <button
            onClick={handleContinueScanning}
            className="scanner__continue-button"
          >
            Tiếp tục quét
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
