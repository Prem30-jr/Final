
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Shield, Wallet } from 'lucide-react';
import NetworkStatus from '@/components/NetworkStatus';

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <QrCode className="h-8 w-8 text-primary" />,
      title: 'Secure QR Transactions',
      description: 'Generate and scan QR codes with cryptographically signed transaction data for secure offline transfers.',
      action: () => navigate('/generate')
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Offline-First Security',
      description: 'Transactions are locally encrypted and securely stored, ready to be synced when you\'re back online.',
      action: () => navigate('/scan')
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: 'Blockchain Verification',
      description: 'When online, all pending transactions are verified and synchronized with the blockchain.',
      action: () => navigate('/transactions')
    }
  ];
  
  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 md:py-24"
        >
          <div className="mx-auto mb-4 relative">
            <div className="absolute -left-4 -top-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative bg-gradient-to-br from-primary/80 to-primary rounded-2xl w-20 h-20 mx-auto flex items-center justify-center mb-8"
            >
              <QrCode className="h-10 w-10 text-white" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            QR Secure Sync
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Secure offline transactions with blockchain verification, ensuring your 
            transactions are safe and tamper-proof even without an internet connection.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/generate')} 
              className="px-8"
            >
              Generate QR Code
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/scan')}
              className="px-8"
            >
              Scan QR Code
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center"
          >
            <NetworkStatus />
          </motion.div>
        </motion.div>
        
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover-lift bg-card/70 backdrop-blur-xs border-border/60">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{feature.description}</p>
                  <Button 
                    variant="ghost" 
                    className="self-start" 
                    onClick={feature.action}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* How it works section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="py-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-16">How It Works</h2>
          
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  number: '01',
                  title: 'Generate and Share',
                  description: 'Create a secure transaction and share via QR code'
                },
                {
                  number: '02',
                  title: 'Secure Storage',
                  description: 'Your transaction is encrypted and stored locally'
                },
                {
                  number: '03',
                  title: 'Blockchain Sync',
                  description: 'When online, transactions are verified on the blockchain'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.2, duration: 0.5 }}
                  className="flex flex-col items-center relative"
                >
                  <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center text-xl font-bold mb-6 relative z-10">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
