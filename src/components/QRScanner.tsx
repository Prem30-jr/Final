import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { QRData, Transaction } from '../types';
import { saveTransaction, getTransactionById } from '../utils/storage';
import { syncTransactionToBlockchain } from '../utils/blockchain';
import { verifySignature } from '../utils/crypto';
import { getNetworkState } from '../utils/network';
import { useCredits } from '@/hooks/useCredits';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from './ui/use-toast';
import { Loader2, Check, AlertCircle, Camera, QrCode, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const SENDER_PASSWORD = "2239"; // Password required for sender to complete transaction

const QRScanner: React.FC = () => {
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'verifying' | 'storing' | 'syncing' | 'complete' | 'error' | 'password_required'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const { credits, updateCredits } = useCredits();
  const { user: clerkUser } = useClerkUser();

  useEffect(() => {
    startScanning();
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const codeReader = new BrowserQRCodeReader();
      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            try {
              const data = JSON.parse(result.getText()) as QRData;
              setScannedData(data);
              if (controlsRef.current) {
                controlsRef.current.stop();
              }
              processTransaction(data);
            } catch (error) {
              console.error('Error parsing QR code:', error);
              setProcessingStatus('error');
              setErrorMessage('Invalid QR code format');
            }
          }
          if (error) {
            console.warn('QR scan error:', error);
          }
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setProcessingStatus('error');
      setErrorMessage('Failed to start camera');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!scannedData) return;

    if (password === SENDER_PASSWORD) {
      setShowPasswordDialog(false);
      setPassword('');
      
      try {
        // Store locally
        setProcessingStatus('storing');
        await new Promise(resolve => setTimeout(resolve, 300)); 
        const transaction = {
          ...scannedData.transaction,
          senderVerified: true,
          verificationTimestamp: Date.now()
        };
        
        saveTransaction(transaction);
        
        // Update credits
        updateCredits(transaction);
        
        // Sync to blockchain if online
        const isOnline = await getNetworkState();
        if (isOnline) {
          setProcessingStatus('syncing');
          await syncTransactionToBlockchain(transaction);
        }
        
        setProcessingStatus('complete');
        
        toast({
          title: "Transaction Verified",
          description: `You have verified this transaction. Waiting for recipient verification.`,
        });
      } catch (error) {
        console.error('Error completing transaction:', error);
        setProcessingStatus('error');
        setErrorMessage('Failed to complete the transaction.');
        
        toast({
          title: "Error",
          description: "Failed to complete the transaction. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive"
      });
      setPassword('');
    }
  };

  const processTransaction = async (data: QRData) => {
    if (!data) return;
    
    try {
      // First verify the signature
      setProcessingStatus('verifying');
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const isValid = verifySignature(
        data.transaction, 
        data.transaction.signature || '', 
        data.publicKey
      );
      
      if (!isValid) {
        console.error("Invalid signature detected");
        setProcessingStatus('error');
        setErrorMessage('Invalid signature. Transaction may be tampered with.');
        return;
      }

      // Check if transaction is already verified by sender
      const existingTransaction = await getTransactionById(data.transaction.id);
      if (existingTransaction?.senderVerified) {
        setProcessingStatus('error');
        setErrorMessage('This transaction has already been verified by the sender.');
        return;
      }
      
      // Then require password for sender
      setProcessingStatus('password_required');
      setShowPasswordDialog(true);
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      setProcessingStatus('error');
      setErrorMessage('An error occurred while processing the transaction.');
      
      toast({
        title: "Error",
        description: "Failed to process the transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setProcessingStatus('idle');
    setErrorMessage(null);
    setPassword('');
    setShowPasswordDialog(false);
    startScanning();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
        <CardContent className="pt-6">
          {processingStatus === 'idle' ? (
            <div className="relative w-full aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
                Scan a QR code to send a transaction
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {processingStatus === 'password_required' && (
                <>
                  <Lock className="h-12 w-12 text-primary" />
                  <p className="text-lg">Password Required</p>
                  <p className="text-sm text-muted-foreground">Please enter your password to complete the transaction.</p>
                </>
              )}
              
              {processingStatus === 'verifying' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg">Verifying transaction...</p>
                </>
              )}
              
              {processingStatus === 'storing' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg">Storing transaction...</p>
                </>
              )}
              
              {processingStatus === 'syncing' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg">Syncing to blockchain...</p>
                </>
              )}
              
              {processingStatus === 'complete' && (
                <>
                  <Check className="h-12 w-12 text-green-500" />
                  <p className="text-lg text-green-500">Transaction complete!</p>
                  <Button onClick={resetScanner} className="mt-4">
                    Scan Another
                  </Button>
                </>
              )}
              
              {processingStatus === 'error' && (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <p className="text-lg text-red-500">{errorMessage || 'An error occurred'}</p>
                  <Button onClick={resetScanner} variant="destructive" className="mt-4">
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Sender Password</DialogTitle>
            <DialogDescription>
              Please enter your password to complete this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-password">Password</Label>
              <Input
                id="transaction-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false);
                resetScanner();
              }}>
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>
                Verify Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRScanner;
