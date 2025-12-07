import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  FastForward,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import type { PortfolioData, Transaction } from "@/lib/strategies";

interface DashboardProps {
  portfolio: PortfolioData;
  transactions: Transaction[];
  onAddMoney: () => void;
  onSimulateWeek: () => void;
  onWithdraw: () => void;
  isSimulating: boolean;
}

export function Dashboard({
  portfolio,
  transactions,
  onAddMoney,
  onSimulateWeek,
  onWithdraw,
  isSimulating,
}: DashboardProps) {
  const { strategy, portfolio: p, nextDCA, dcaPoolBalance } = portfolio;

  // Empty state when no strategy selected
  if (!strategy) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-8 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-soft border border-border p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Active Strategy</h2>
            <p className="text-muted-foreground mb-6">
              Select a strategy to start building your portfolio
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Browse Strategies
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const progress = strategy.totalWeeks
    ? (strategy.weeksCompleted / strategy.totalWeeks) * 100
    : (strategy.weeksCompleted / 52) * 100; // Default to 52 for display

  const isProfitable = p.profitLoss >= 0;
  const canSimulate = dcaPoolBalance >= strategy.weeklyAmount;

  const handleReset = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      "⚠️ This will DELETE ALL your data including wallet, portfolio, and history. Continue?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("http://localhost:5001/api/agent/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Reset successful! Reloading...");
        window.location.reload(); // Refresh to show onboarding
      }
    } catch (error) {
      alert("❌ Reset failed: " + (error as Error).message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 px-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Market Intelligence Widget - NEW */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-900/20 to-slate-900/40 rounded-2xl shadow-soft border border-emerald-500/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className="font-semibold text-foreground">
                AI Market Intelligence
              </h3>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
              Powered by SpoonOS
            </span>
          </div>

          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">GAS Price</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">$3.42</div>
                <div className="text-sm text-red-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -12% this week
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-emerald-400">
                  Agent Analysis:
                </span>{" "}
                Healthy pullback after rally. RSI at 45 suggests good entry
                point. Neo developer activity up 23% this month. Your DCA timing
                is excellent—buying 15% more GAS per dollar than last week.
              </p>
            </div>

            {/* Next Action */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700">
              <span className="text-muted-foreground">Next Auto-Buy</span>
              <span className="font-semibold text-foreground">
                {new Date(nextDCA).toLocaleDateString("en-US", {
                  weekday: "long",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl shadow-soft border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span className="font-medium text-foreground">
                Following: {strategy.name} by {strategy.creator}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Next DCA:{" "}
              {new Date(nextDCA).toLocaleDateString("en-US", {
                weekday: "long",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="h-px bg-border mb-6" />

          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              Week {strategy.weeksCompleted} of {strategy.totalWeeks || "∞"} • £
              {p.costBasis.toLocaleString()} invested
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Your Holdings
            </h4>
            <div className="space-y-2">
              {Object.entries(p.holdings).map(([coin, amount]) => {
                const value = p.holdingsValue[coin] || 0;
                const change = p.holdingsChange[coin] || 0;
                const allocation = strategy.allocation[coin] || 0;

                return (
                  <div
                    key={coin}
                    className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {amount.toFixed(4)} {coin}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({allocation}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        £{value.toFixed(0)}
                      </span>
                      <span
                        className={`text-xs flex items-center gap-0.5 ${
                          change >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <motion.p
                key={p.totalValue}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-foreground"
              >
                £{p.totalValue.toLocaleString()}
              </motion.p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Profit/Loss</p>
              <p
                className={`text-xl font-bold flex items-center gap-1 ${
                  isProfitable ? "text-green-600" : "text-red-500"
                }`}
              >
                {isProfitable ? "+" : ""}£{p.profitLoss.toFixed(0)}
                <span className="text-sm">
                  ({isProfitable ? "+" : ""}
                  {p.profitLossPercent.toFixed(1)}%)
                </span>
                <span>{isProfitable ? "💚" : "🔴"}</span>
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </motion.div>

        {/* DCA Pool Balance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-soft border border-border p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  DCA Pool Balance
                </p>
                <p className="text-xl font-bold text-foreground">
                  {dcaPoolBalance} GAS
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Runway</p>
              <p
                className={`font-bold ${
                  dcaPoolBalance < strategy.weeklyAmount * 2
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {Math.floor(dcaPoolBalance / strategy.weeklyAmount)} weeks
                {dcaPoolBalance < strategy.weeklyAmount * 2 && " ⚠️"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <Button
            variant="default"
            size="lg"
            onClick={onAddMoney}
            className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Add Money
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onSimulateWeek}
            disabled={!canSimulate || isSimulating}
            className={`h-14 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-100 hover:bg-emerald-950/30 ${
              canSimulate && !isSimulating ? "animate-pulse-gentle" : ""
            }`}
          >
            <FastForward className="w-5 h-5 mr-2" />
            {isSimulating ? "Simulating..." : "Simulate Week"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onWithdraw}
            className="h-14 text-red-400 hover:bg-red-950/30 border-red-900/30"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Withdraw
          </Button>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-soft border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h3 className="font-bold text-foreground">Recent Activity</h3>
          </div>

          <div className="h-px bg-border mb-4" />

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet.</p>
              <p className="text-sm">Your first DCA is Monday!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.week}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-[#161B26] border border-slate-800 rounded-lg hover:border-slate-600 transition-colors"
                >
                  {/* Transaction Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-400 text-sm">✓</span>
                        <span className="font-semibold text-white text-sm">
                          Bought {tx.gasSpent} GAS
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-400 text-sm">
                        ${(tx.gasSpent * 3.42).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tx.gasSpent} GAS
                      </div>
                    </div>
                  </div>

                  {/* Asset Breakdown */}
                  <div className="mb-3 pt-2 border-t border-slate-700/50">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
                      Purchased
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(tx.purchased).map(([coin, amount]) => (
                        <span
                          key={coin}
                          className="text-xs text-gray-300 bg-slate-800/50 px-2 py-1 rounded"
                        >
                          {(amount as number).toFixed(4)} {coin}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Turnkey Transaction Hash */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-gray-400">Turnkey Tx:</span>
                    <code className="text-xs bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono">
                      {tx.txHash}
                    </code>

                    <a
                      href={`https://neoxplorer.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline ml-auto flex items-center gap-1"
                    >
                      View on Neo Explorer
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-red-900/20">
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-1">Danger Zone</h3>
                <p className="text-red-300/60 text-sm mb-4">
                  Reset all data and start fresh. This action cannot be undone.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 px-6 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
