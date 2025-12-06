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
    Low: "bg-emerald-500/10 text-emerald-400",
    Medium: "bg-yellow-500/10 text-yellow-400",
    High: "bg-red-500/10 text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#161B26] border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-emerald-900/10 flex flex-col justify-between group"
    >
      {/* Header Section */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-600 text-white text-2xl shadow-inner">
              {strategy.avatar}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">
                {strategy.creator}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{strategy.username}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span>{strategy.followers} followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Allocation */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 italic mb-3">"{strategy.bio}"</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(strategy.allocation).map(([coin, percent]) => (
              <span
                key={coin}
                className="px-3 py-1 bg-[#1F2937] border border-gray-700 rounded-lg text-xs font-semibold text-gray-300"
              >
                {coin} <span className="text-emerald-400 ml-1">{percent}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-[#0B0E14] rounded-xl p-4 mb-6 grid grid-cols-3 gap-2 divide-x divide-gray-800">
        <div className="text-center px-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            12mo Rtn
          </p>
          <p className="text-emerald-400 font-bold text-lg">
            +{strategy.return12mo}%
          </p>
        </div>
        <div className="text-center px-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Risk
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
              riskColors[strategy.riskLevel]
            }`}
          >
            {strategy.riskLevel}
          </span>
        </div>
        <div className="text-center px-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Win Rate
          </p>
          <div className="flex items-center justify-center gap-1 text-gray-200 font-bold text-lg">
            <Zap className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
            {strategy.winRate}%
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onCopy(strategy)}
        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Copy Strategy
      </button>
    </motion.div>
  );
}
