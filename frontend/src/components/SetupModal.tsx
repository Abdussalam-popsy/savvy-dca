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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto relative"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Strategy Activated! 🎉
              </h3>
              <p className="text-slate-400 text-lg">
                First DCA: Monday 9 AM
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Strategy Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
                  {strategy.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Set Up: {strategy.name}</h3>
                  <p className="text-slate-400">by {strategy.creator}</p>
                </div>
              </div>

              {/* Weekly Amount Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">Weekly Amount</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{weeklyAmount}</span>
                    <span className="text-slate-400">GAS</span>
                  </div>
                </div>
                <div className="relative pt-2 pb-4">
                  <Slider
                    value={[weeklyAmount]}
                    onValueChange={(v) => setWeeklyAmount(v[0])}
                    min={10}
                    max={1000}
                    step={10}
                    className="cursor-pointer"
                  />
                  <div 
                    className={`w-4 h-4 rounded-full bg-emerald-500 absolute top-1 pointer-events-none transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                    style={{ 
                      left: `${((weeklyAmount - 10) / (1000 - 10)) * 100}%`,
                      transform: 'translateX(-50%)'
                    }} 
                  />
                </div>
              </div>

              {/* Duration Options */}
              <div className="space-y-4">
                <label className="text-white font-medium">Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  {[12, 26, 52, null].map((d) => (
                    <button
                      key={d ?? 'forever'}
                      onClick={() => setDuration(d)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        duration === d
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent hover:border-white/5'
                      }`}
                    >
                      {d ? `${d} weeks` : 'Forever'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Mode Toggle */}
              <div className="flex items-center justify-between p-1">
                <div>
                  <p className="text-white font-medium mb-1">Strict Mode</p>
                  <p className="text-xs text-slate-400">
                    Blocks withdrawals during DCA
                  </p>
                </div>
                <Switch 
                  checked={strictMode} 
                  onCheckedChange={setStrictMode}
                  className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-700"
                />
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm">
                <p className="text-sm text-white font-medium mb-4">
                  Every Monday, Savvy will buy:
                </p>
                <ul className="space-y-3">
                  {Object.entries(strategy.allocation).map(([coin, percent]) => (
                    <li key={coin} className="text-sm text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        {Math.round(weeklyAmount * percent / 100)} GAS
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="font-medium text-white">{coin}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200"
                onClick={handleSetup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  'Start DCA ✨'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
