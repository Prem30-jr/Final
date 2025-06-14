
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CreditCard, Plus, Minus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const CreditDisplay: React.FC = () => {
  const { credits, isLoading, refreshCredits } = useCredits();
  const location = useLocation();

 
  useEffect(() => {
    refreshCredits();
  }, [location.pathname, refreshCredits]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/90 backdrop-blur-sm border-primary/10 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="text-3xl font-bold text-primary">
              {credits.balance.toFixed(2)}
            </div>
            
            {credits.history.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {credits.history.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        {entry.type === 'credit' ? (
                          <Badge variant="default" className="mr-2 bg-green-500">
                            <Plus className="h-3 w-3 mr-1" />
                            {entry.amount.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mr-2 text-red-500 border-red-200">
                            <Minus className="h-3 w-3 mr-1" />
                            {entry.amount.toFixed(2)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreditDisplay;
