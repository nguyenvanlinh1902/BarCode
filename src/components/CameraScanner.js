import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

/**
 *
 * @param scanMode
 * @param orderBarcodeMapping
 * @param onScanResult
 * @returns {JSX.Element}
 * @constructor
 */
const CameraScanner = ({ scanMode, orderBarcodeMapping, onScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const barcodeArray = Object.values(orderBarcodeMapping);
  const orderArray = Object.keys(orderBarcodeMapping);
  console.log('scanMode', scanMode);
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      intervalRef.current = setInterval(() => {
        if (scanned) {
          clearInterval(intervalRef.current);
          stopScanning();
          return;
        }

        if (
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
        ) {
          captureFrame();
        }
      }, 1000);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      Tesseract.recognize(blob, 'eng')
        .then(({ data: { text } }) => {
          if (scanMode === 'order') {
        
            const foundOrder = orderArray.find(order => text.includes(order));
            setDetectedText(foundOrder);
            if (foundOrder) {
              onScanResult(foundOrder);
              setScanned(true);
              setScanSuccess(true);
              stopScanning();
            }
          } else {
            const foundBarcode = barcodeArray.find((barcode) =>
              text.includes(barcode)
            );
            if (foundBarcode) {
              onScanResult(foundBarcode);
              setScanned(true);
              setScanSuccess(true);
              stopScanning();
            }
          }
        })
        .catch((err) => console.error('OCR Error:', err));
    }, 'image/jpeg');
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsScanning(false);

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScanned(false);
    startCamera();
  };

  useEffect(() => {
    handleStartScanning();
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div>
      {isScanning && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxWidth: '400px' }}
          />
          <div style={{
            marginTop: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f5f5f5',
            maxWidth: '400px'
          }}>
            <strong>Dữ liệu đang quét được:</strong>
            <div style={{ 
              wordBreak: 'break-all',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {detectedText || 'Đang quét...'}
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {scanSuccess && <div style={{ color: 'green' }}>Quét thành công!</div>}

      {!isScanning ? (
        <button onClick={handleStartScanning}>Bắt đầu quét</button>
      ) : (
        <button onClick={stopScanning}>Dừng quét</button>
      )}
    </div>
  );
};

export default CameraScanner;
