import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface WithdrawModalProps {
  currentValue: number;
  weeksCompleted: number;
  totalWeeks: number | null;
  strictMode: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

export function WithdrawModal({ 
  currentValue, 
  weeksCompleted, 
  totalWeeks, 
  strictMode,
  onClose, 
  onWithdraw 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState(200);
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onWithdraw(amount);
  };

  if (strictMode) {
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
          className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Strict Mode Active</h3>
          <p className="text-muted-foreground mb-6">
            You enabled Strict Mode when setting up your DCA. Withdrawals are blocked until your strategy completes.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            This is for your own good. Stay disciplined! 💪
          </p>
          <Button variant="sage" className="w-full" onClick={onClose}>
            Got it
          </Button>
        </motion.div>
      </motion.div>
    );
  }

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
        className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 border-2 border-destructive/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-xl font-bold">Withdraw Funds</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">
          You're about to break your DCA strategy. Are you sure?
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Holdings:</span>
            <span className="font-medium text-foreground">£{currentValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weeks Completed:</span>
            <span className="font-medium text-foreground">{weeksCompleted}/{totalWeeks || '∞'}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Withdraw Amount
          </label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(currentValue, parseInt(e.target.value) || 0)))}
              className="pr-16 text-lg"
              min={1}
              max={currentValue}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              GAS
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm text-destructive">
              <p className="font-medium mb-1">Warning:</p>
              <p>Market is down 8% this week. Selling now locks in losses. Your future self will regret this.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="sage" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 text-muted-foreground hover:text-destructive hover:border-destructive"
            onClick={handleWithdraw}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Withdraw Anyway'
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
