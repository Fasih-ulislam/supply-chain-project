'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { verificationService } from '@/services/verificationService';
import { useToast } from '@/context/ToastContext';

interface QRScannerProps {
  onScanSuccess?: (data: any) => void;
  onScanError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const { showToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      // In a real implementation, you would use a QR code scanning library
      // like jsQR or qr-scanner to decode the QR code from the image
      // For now, we'll simulate the scanning process

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('qrImage', file);

      // Read the file as data URL for preview (optional)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;

        // Simulate QR code scanning delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Here you would normally use a QR scanning library to extract the QR code data
        // For demonstration, let's assume we extracted a QR code string
        const mockQRData = 'SUPPLY_CHAIN_QR_' + Date.now();

        // Verify with backend
        try {
          const response = await verificationService.verifyQR(mockQRData);

          setResult({
            valid: response.valid,
            data: response.order,
            qrCode: mockQRData,
          });

          showToast('QR Code verified successfully!', 'success');

          if (onScanSuccess) {
            onScanSuccess(response.order);
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'QR verification failed';
          setError(errorMessage);

          if (onScanError) {
            onScanError(errorMessage);
          }
        } finally {
          setScanning(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Failed to read QR code image');
      setScanning(false);
    }
  };

  const handleManualInput = async (qrCode: string) => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await verificationService.verifyQR(qrCode);

      setResult({
        valid: response.valid,
        data: response.order,
        qrCode,
      });

      showToast('QR Code verified successfully!', 'success');

      if (onScanSuccess) {
        onScanSuccess(response.order);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'QR verification failed';
      setError(errorMessage);

      if (onScanError) {
        onScanError(errorMessage);
      }
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan QR Code</h3>
          <p className="text-gray-600">Upload a QR code image or enter the code manually</p>
        </div>

        {!result && !error && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-upload"
            />

            <label htmlFor="qr-upload" className="cursor-pointer">
              <span className={`inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {scanning ? 'Scanning...' : 'Upload QR Code Image'}
              </span>
            </label>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter QR code manually"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualInput((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                onClick={(e) => {
                  const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                  handleManualInput(input.value);
                }}
                disabled={scanning}
              >
                Verify
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Verification Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </Alert>
        )}

        {result && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">QR Code Verified!</p>
              {result.data && (
                <div className="mt-3 space-y-2 text-sm">
                  <p><strong>Order ID:</strong> {result.data.orderId || 'N/A'}</p>
                  <p><strong>Leg ID:</strong> {result.data.legId || 'N/A'}</p>
                  <p><strong>Status:</strong> {result.data.status || 'N/A'}</p>
                  {result.data.location && (
                    <p><strong>Location:</strong> {result.data.location}</p>
                  )}
                </div>
              )}
            </div>
          </Alert>
        )}

        {(result || error) && (
          <Button onClick={reset} variant="outline" className="w-full">
            <X className="w-4 h-4 mr-2" />
            Scan Another QR Code
          </Button>
        )}
      </div>
    </Card>
  );
}
