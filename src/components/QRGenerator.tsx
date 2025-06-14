import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Transaction, QRData } from '../types';
import { generateId, signTransaction } from '../utils/crypto';
import { saveTransaction } from '../utils/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter } from './ui/card';
import { toast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { ShieldCheck } from 'lucide-react';

const QRGenerator: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
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
    
    const sender = "wallet_" + Math.random().toString(36).substring(2, 6);
    const publicKey = "pk_demo";
    
    const transaction: Transaction = {
      id: generateId(),
      amount: amountValue,
      recipient,
      sender,
      timestamp: Date.now(),
      description: description || "Transfer",
      status: 'pending'
    };
    
    const fakePrivateKey = "sk_demo";
    
    const signature = signTransaction(transaction, fakePrivateKey);
    transaction.signature = signature;
    
    const newQrData: QRData = {
      transaction,
      publicKey
    };
    
    console.log("Generated QR data:", newQrData);
    const qrString = JSON.stringify(newQrData);
    console.log("QR data string length:", qrString.length);
    console.log("QR data as string:", qrString);
    
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
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {!qrData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-border/50">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    className="border-border/60 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Recipient address or name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="border-border/60 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this transaction for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none border-border/60 focus:border-primary"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-6"
        >
          <Card className="bg-white shadow-lg p-6 w-full">
            <CardContent className="flex flex-col items-center pt-4">
              <div className="flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                <Badge variant="outline" className="text-xs font-mono">
                  Digitally Signed: {qrData.transaction.signature?.substring(4, 14)}...
                </Badge>
              </div>
              
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={JSON.stringify(qrData)} 
                  size={200}
                  level="H"
                  includeMargin
                  className="mx-auto"
                />
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleReset} className="w-full">
                Generate Another
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-xs text-muted-foreground text-center max-w-xs">
            This QR code contains a digitally signed transaction. When scanned, the sender will need to enter a password to complete the transaction.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QRGenerator;
