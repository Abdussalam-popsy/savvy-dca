import { motion } from "framer-motion";
import { TrendingUp, Target, Zap } from "lucide-react";
import { Button } from "./ui/button";
import type { Strategy } from "@/lib/strategies";

interface StrategyCardProps {
  strategy: Strategy;
  onCopy: (strategy: Strategy) => void;
  index: number;
}

export function StrategyCard({ strategy, onCopy, index }: StrategyCardProps) {
  const riskColors = {
    Low: "text-green-600 bg-green-100",
    Medium: "text-yellow-600 bg-yellow-100",
    High: "text-red-600 bg-red-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
      className="bg-card rounded-2xl p-6 shadow-soft border border-border transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
          {strategy.avatar}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">{strategy.creator}</h3>
          <p className="text-sm text-muted-foreground">
            {strategy.username} • {strategy.followers} followers
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 italic">
        "{strategy.bio}"
      </p>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
          Strategy: {strategy.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(strategy.allocation).map(([coin, percent]) => (
            <span
              key={coin}
              className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium"
            >
              {percent}% {coin}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-sm font-bold">+{strategy.return12mo}%</span>
          </div>
          <p className="text-xs text-muted-foreground">12mo return</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-3 h-3" />
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                riskColors[strategy.riskLevel]
              }`}
            >
              {strategy.riskLevel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Risk</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-gold mb-1">
            <Zap className="w-3 h-3" />
            <span className="text-sm font-bold">{strategy.winRate}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Win rate</p>
        </div>
      </div>

      <Button
        variant="default"
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
        onClick={() => onCopy(strategy)}
      >
        Copy Strategy ✨
      </Button>
    </motion.div>
  );
}
