import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AddMoneyModalProps {
  currentBalance: number;
  weeklySpend: number;
  onClose: () => void;
  onAdd: (amount: number) => void;
}

export function AddMoneyModal({ currentBalance, weeklySpend, onClose, onAdd }: AddMoneyModalProps) {
  const [amount, setAmount] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentRunway = weeklySpend > 0 ? currentBalance / weeklySpend : 0;
  const newRunway = weeklySpend > 0 ? (currentBalance + amount) / weeklySpend : 0;

  const handleAdd = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAdd(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6"
      >
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground">Funds Added!</h3>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Add Funds to DCA Budget</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Balance:</span>
                <span className="font-medium text-foreground">{currentBalance} GAS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Spend:</span>
                <span className="font-medium text-foreground">{weeklySpend} GAS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Runway:</span>
                <span className={`font-medium ${currentRunway < 2 ? 'text-destructive' : 'text-foreground'}`}>
                  {currentRunway.toFixed(1)} weeks {currentRunway < 2 && '⚠️'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Add Amount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  className="pr-16 text-lg"
                  min={10}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  GAS
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 250, 500, 1000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      amount === preset 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-green-800">New Runway:</span>
                <span className="font-bold text-green-800">{newRunway.toFixed(1)} weeks ✓</span>
              </div>
            </div>

            <Button 
              variant="coral" 
              className="w-full" 
              size="lg"
              onClick={handleAdd}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Funds ✨'
              )}
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
