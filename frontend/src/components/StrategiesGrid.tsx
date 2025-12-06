import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { StrategyCard } from './StrategyCard';
import { strategies, type Strategy } from '@/lib/strategies';

interface StrategiesGridProps {
  onBack: () => void;
  onSelectStrategy: (strategy: Strategy) => void;
}

export function StrategiesGrid({ onBack, onSelectStrategy }: StrategiesGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Featured Strategies
          </h2>
          <p className="text-muted-foreground">
            Copy a proven strategy from our top performers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <StrategyCard 
              key={strategy.id}
              strategy={strategy}
              onCopy={onSelectStrategy}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
