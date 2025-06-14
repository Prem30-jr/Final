import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Transaction, QRData } from '../types';
import { generateId, signTransaction } from '../utils/crypto';
import { saveTransaction, getTransactionById, updateTransactionStatus } from '../utils/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter } from './ui/card';
import { toast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';

const QRGenerator: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'sender_verified' | 'recipient_verified' | 'completed'>('pending');
  const { user: clerkUser } = useClerkUser();
  
  // Poll for transaction updates
  useEffect(() => {
    if (!qrData) return;
    
    const pollInterval = setInterval(async () => {
      const transaction = await getTransactionById(qrData.transaction.id);
      if (transaction) {
        if (transaction.senderVerified && transaction.recipientVerified) {
          setVerificationStatus('completed');
          clearInterval(pollInterval);
        } else if (transaction.senderVerified) {
          setVerificationStatus('sender_verified');
        } else if (transaction.recipientVerified) {
          setVerificationStatus('recipient_verified');
        }
      }
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [qrData]);
  
  const handleGenerate = () => {
    if (!amount || !recipient) {
      toast({
        title: "Missing information",
        description: "Please enter an amount and recipient.",
        variant: "destructive"
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    const sender = clerkUser?.id || "wallet_" + Math.random().toString(36).substring(2, 6);
    const publicKey = "pk_demo";
    
    const transaction: Transaction = {
      id: generateId(),
      amount: amountValue,
      recipient,
      sender,
      timestamp: Date.now(),
      description: description || "Transfer",
      status: 'pending',
      senderVerified: false,
      recipientVerified: false
    };
    
    const fakePrivateKey = "sk_demo";
    const signature = signTransaction(transaction, fakePrivateKey);
    transaction.signature = signature;
    
    const newQrData: QRData = {
      transaction,
      publicKey
    };
    
    saveTransaction(transaction);
    
    setTimeout(() => {
      setQrData(newQrData);
      setIsGenerating(false);
      
      toast({
        title: "QR Code Generated",
        description: "Transaction has been digitally signed and is ready to share.",
      });
    }, 500);
  };
  
  const handleReset = () => {
    setQrData(null);
    setAmount('');
    setRecipient('');
    setDescription('');
    setVerificationStatus('pending');
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'completed':
        return (
          <div className="flex items-center justify-center space-x-2 text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            <span>Transaction Verified</span>
          </div>
        );
      case 'sender_verified':
        return (
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Waiting for Recipient</span>
          </div>
        );
      case 'recipient_verified':
        return (
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Waiting for Sender</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>Pending Verification</span>
          </div>
        );
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!qrData ? (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Generate Secure QR
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <QRCodeSVG
                    value={JSON.stringify(qrData)}
                    size={256}
                    level="H"
                    includeMargin
                    className="rounded-lg"
                  />
                  {verificationStatus === 'completed' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
                      <CheckCircle2 className="h-32 w-32 text-green-500" />
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-lg font-medium">
                    {qrData.transaction.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    To: {qrData.transaction.recipient}
                  </div>
                  {qrData.transaction.description && (
                    <div className="mt-2 text-sm">
                      {qrData.transaction.description}
                    </div>
                  )}
                  <div className="mt-4">
                    {renderVerificationStatus()}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="w-full"
                disabled={verificationStatus === 'completed'}
              >
                {verificationStatus === 'completed' ? 'Transaction Complete' : 'Generate Another'}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-xs text-muted-foreground text-center max-w-xs">
            This QR code contains a digitally signed transaction. Both sender and recipient must verify the transaction for it to be completed.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QRGenerator;
