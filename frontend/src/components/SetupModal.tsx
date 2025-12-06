import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import type { Strategy } from '@/lib/strategies';

interface SetupModalProps {
  strategy: Strategy;
  onClose: () => void;
  onSetup: (config: {
    strategyId: string;
    weeklyAmount: number;
    duration: number | null;
    strictMode: boolean;
  }) => void;
}

export function SetupModal({ strategy, onClose, onSetup }: SetupModalProps) {
  const [weeklyAmount, setWeeklyAmount] = useState(100);
  const [duration, setDuration] = useState<number | null>(null); // null = forever
  const [strictMode, setStrictMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSetup({
      strategyId: strategy.id,
      weeklyAmount,
      duration,
      strictMode
    });
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
        className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Strategy Activated! 🎉
              </h3>
              <p className="text-muted-foreground">
                First DCA: Monday 9 AM
              </p>
            </motion.div>
          ) : (
            <motion.div key="form">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {strategy.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Set Up: {strategy.name}</h3>
                  <p className="text-sm text-muted-foreground">by {strategy.creator}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Weekly Amount
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weeklyAmount]}
                      onValueChange={(v) => setWeeklyAmount(v[0])}
                      min={10}
                      max={1000}
                      step={10}
                      className="flex-1"
                    />
                    <div className="w-24 text-right">
                      <span className="text-xl font-bold text-foreground">{weeklyAmount}</span>
                      <span className="text-muted-foreground ml-1">GAS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[12, 26, 52, null].map((d) => (
                      <button
                        key={d ?? 'forever'}
                        onClick={() => setDuration(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          duration === d
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {d ? `${d} weeks` : 'Forever'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Strict Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Blocks withdrawals during DCA
                    </p>
                  </div>
                  <Switch checked={strictMode} onCheckedChange={setStrictMode} />
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Every Monday, Savvy will buy:
                  </p>
                  <ul className="space-y-1">
                    {Object.entries(strategy.allocation).map(([coin, percent]) => (
                      <li key={coin} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                        {Math.round(weeklyAmount * percent / 100)} GAS → {coin}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  variant="coral" 
                  className="w-full" 
                  size="lg"
                  onClick={handleSetup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Start DCA ✨'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
