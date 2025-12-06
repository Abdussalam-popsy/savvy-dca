import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface MilestoneModalProps {
  milestone: 25 | 50 | 75 | 100;
  weeksCompleted: number;
  totalInvested: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
  onClose: () => void;
}

const milestoneMessages = {
  25: { title: 'Quarter Way There!', emoji: '🌱' },
  50: { title: 'Halfway There!', emoji: '🎉' },
  75: { title: 'Almost Done!', emoji: '🔥' },
  100: { title: 'Strategy Complete!', emoji: '🏆' },
};

function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FF9B9B', '#B4D7D3', '#FF6B6B', '#4ECDC4'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-60">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '110vh', 
            opacity: 0, 
            rotate: 720,
            x: `${particle.x + (Math.random() - 0.5) * 20}vw`
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            delay: particle.delay,
            ease: 'easeOut'
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

export function MilestoneModal({ 
  milestone, 
  weeksCompleted, 
  totalInvested, 
  currentValue, 
  profit, 
  profitPercent,
  onClose 
}: MilestoneModalProps) {
  const { title, emoji } = milestoneMessages[milestone];
  const isProfitable = profit >= 0;

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-card rounded-2xl shadow-lg max-w-md w-full p-8 text-center border-4 border-gold"
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {emoji}{emoji}{emoji}
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-6"
          >
            You've DCA'd for {weeksCompleted} weeks straight without missing a single buy.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 p-4 rounded-xl bg-muted/50 mb-6"
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Invested:</span>
              <span className="font-bold text-foreground">£{totalInvested.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Value:</span>
              <span className="font-bold text-foreground">£{currentValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit:</span>
              <span className={`font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}£{profit.toFixed(0)} ({isProfitable ? '+' : ''}{profitPercent.toFixed(1)}%)
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground mb-6"
          >
            The discipline is paying off! 💪
          </motion.p>

          <Button variant="coral" size="lg" className="w-full" onClick={onClose}>
            Keep Going ✨
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
