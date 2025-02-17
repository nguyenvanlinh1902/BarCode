import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Button } from 'react-bootstrap';

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useState(true);

  const barcodeArray = Object.values(orderBarcodeMapping);
  const orderArray = Object.keys(orderBarcodeMapping);

  async function checkCameraPermission() {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' });
      switch (permissions.state) {
        case 'granted':
          console.log('Camera access granted');
          return true;
        case 'prompt':
          console.log('Camera access prompt');
          return false;
        case 'denied':
          console.log('Camera access denied');
          return false;
        default:
          console.log('Unknown camera access state');
          return false;
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }
  useEffect(() => {
    checkCameraPermission().then((permission) => {
      setCameraPermission(permission);
    });
  }, []);

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
            const foundOrder = orderArray.find((order) => text.includes(order));
            if (foundOrder) {
              onScanResult(foundOrder);
              setScanned(true);
              stopScanning();
            }
          } else {
            const foundBarcode = barcodeArray.find((barcode) =>
              text.includes(barcode)
            );
            if (foundBarcode) {
              onScanResult(foundBarcode);
              setScanned(true);
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
  const handleStartScanning = async () => {
    if (!cameraPermission) return;
    setIsScanning(true);
    setScanned(false);
    await startCamera();
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div>
      {!cameraPermission ? (
        <div>
          Camera access denied or not granted. Please enable camera access in
          your browser settings.
        </div>
      ) : null}
      {isScanning && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '400px' }}
        />
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!isScanning ? (
        <Button variant="primary" onClick={handleStartScanning}>
          Start Scanning
        </Button>
      ) : (
        <Button variant={'dark'} onClick={stopScanning}>
          Stop Scanning
        </Button>
      )}
    </div>
  );
};

export default CameraScanner;
