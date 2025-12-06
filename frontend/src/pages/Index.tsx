import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Header } from "@/components/Header";
import { OnboardingView } from "@/components/OnboardingView";
import { StrategiesGrid } from "@/components/StrategiesGrid";
import { SetupModal } from "@/components/SetupModal";
import { VoiceModal } from "@/components/VoiceModal";
import { Dashboard } from "@/components/Dashboard";
import { AddMoneyModal } from "@/components/AddMoneyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { MilestoneModal } from "@/components/MilestoneModal";
import { SavvyAgentChat } from "@/components/SavvyAgentChat";
import {
  strategies,
  cryptoPrices,
  type Strategy,
  type PortfolioData,
  type Transaction,
} from "@/lib/strategies";
import { toast } from "@/hooks/use-toast";

type View = "onboarding" | "strategies" | "dashboard";
type Modal = "voice" | "setup" | "addMoney" | "withdraw" | "milestone" | null;

const Index = () => {
  const [view, setView] = useState<View>("onboarding");
  const [modal, setModal] = useState<Modal>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [milestoneValue, setMilestoneValue] = useState<
    25 | 50 | 75 | 100 | null
  >(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize portfolio from localStorage or default
  const savedPortfolio = localStorage.getItem("savvy_portfolio");
  const initialPortfolio: PortfolioData = savedPortfolio
    ? JSON.parse(savedPortfolio)
    : {
        hasStrategy: false,
        strategy: null,
        portfolio: {
          holdings: {},
          holdingsValue: {},
          holdingsChange: {},
          totalValue: 0,
          costBasis: 0,
          profitLoss: 0,
          profitLossPercent: 0,
        },
        nextDCA: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        dcaPoolBalance: 0,
      };

  const [portfolio, setPortfolio] = useState<PortfolioData>(initialPortfolio);

  // Initialize transactions from localStorage or default
  const savedTransactions = localStorage.getItem("savvy_transactions");
  const initialTransactions: Transaction[] = savedTransactions
    ? JSON.parse(savedTransactions)
    : [];

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  // Persist portfolio and transactions to localStorage
  useEffect(() => {
    localStorage.setItem("savvy_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem("savvy_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleSelectStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setModal("setup");
  };

  const handleSetup = useCallback(
    (config: {
      strategyId: string;
      weeklyAmount: number;
      duration: number | null;
      strictMode: boolean;
    }) => {
      const strategy = strategies.find((s) => s.id === config.strategyId);
      if (!strategy) return;

      setPortfolio({
        hasStrategy: true,
        strategy: {
          id: strategy.id,
          name: strategy.name,
          creator: strategy.creator,
          allocation: strategy.allocation,
          weeklyAmount: config.weeklyAmount,
          weeksCompleted: 0,
          totalWeeks: config.duration,
          strictMode: config.strictMode,
        },
        portfolio: {
          holdings: {},
          holdingsValue: {},
          holdingsChange: {},
          totalValue: 0,
          costBasis: 0,
          profitLoss: 0,
          profitLossPercent: 0,
        },
        nextDCA: getNextMonday().toISOString(),
        dcaPoolBalance: config.weeklyAmount * 5, // Start with 5 weeks of runway
      });

      setModal(null);
      setView("dashboard");

      toast({
        title: "Strategy activated! 🎉",
        description: "First DCA: Monday 9 AM",
      });
    },
    []
  );

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      // Parse voice command
      const lowerTranscript = transcript.toLowerCase();

      // Try to find a strategy name
      const foundStrategy = strategies.find(
        (s) =>
          lowerTranscript.includes(s.name.toLowerCase()) ||
          lowerTranscript.includes(s.creator.toLowerCase())
      );

      // Try to extract amount
      const amountMatch = transcript.match(/(\d+)\s*(gas|dollars?|£)/i);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 100;

      setModal(null);

      if (foundStrategy) {
        setSelectedStrategy(foundStrategy);
        handleSetup({
          strategyId: foundStrategy.id,
          weeklyAmount: amount,
          duration: 52,
          strictMode: true,
        });
      } else {
        // Default to SafeStack if no strategy found
        const defaultStrategy = strategies[0];
        setSelectedStrategy(defaultStrategy);
        handleSetup({
          strategyId: defaultStrategy.id,
          weeklyAmount: amount,
          duration: 52,
          strictMode: true,
        });
      }
    },
    [handleSetup]
  );

  const handleAddMoney = useCallback((amount: number) => {
    setPortfolio((prev) => ({
      ...prev,
      dcaPoolBalance: prev.dcaPoolBalance + amount,
    }));
    setModal(null);
    toast({
      title: "Funds added! 💰",
      description: `${amount} GAS added to your DCA pool`,
    });
  }, []);

  const handleSimulateWeek = useCallback(() => {
    if (!portfolio.strategy) return;

    setIsSimulating(true);

    setTimeout(() => {
      const { strategy, dcaPoolBalance, portfolio: p } = portfolio;
      const weeklyAmount = strategy.weeklyAmount;

      if (dcaPoolBalance < weeklyAmount) {
        setIsSimulating(false);
        toast({
          title: "Insufficient funds",
          description: "Add more GAS to continue your DCA",
          variant: "destructive",
        });
        return;
      }

      const newHoldings = { ...p.holdings };
      const newHoldingsValue = { ...p.holdingsValue };
      const newHoldingsChange = { ...p.holdingsChange };
      const purchased: Record<string, number> = {};

      // Calculate purchases for each coin
      Object.entries(strategy.allocation).forEach(([coin, percent]) => {
        const gasForCoin = weeklyAmount * (percent / 100);
        const price = cryptoPrices[coin] || 1;
        // Add some randomness to simulate price changes
        const adjustedPrice = price * (1 + (Math.random() - 0.5) * 0.1);
        const coinAmount = gasForCoin / adjustedPrice;

        newHoldings[coin] = (newHoldings[coin] || 0) + coinAmount;
        purchased[coin] = coinAmount;

        // Calculate new value with some price movement
        const priceChange = (Math.random() - 0.3) * 0.1; // Slight positive bias
        newHoldingsValue[coin] =
          newHoldings[coin] * adjustedPrice * (1 + priceChange);
        newHoldingsChange[coin] = priceChange * 100;
      });

      const newCostBasis = p.costBasis + weeklyAmount;
      const newTotalValue = Object.values(newHoldingsValue).reduce(
        (a, b) => a + b,
        0
      );
      const newProfitLoss = newTotalValue - newCostBasis;
      const newProfitLossPercent =
        newCostBasis > 0 ? (newProfitLoss / newCostBasis) * 100 : 0;

      const newWeeksCompleted = strategy.weeksCompleted + 1;

      // Create new transaction
      const newTransaction: Transaction = {
        week: newWeeksCompleted,
        date: new Date().toISOString(),
        purchased,
        gasSpent: weeklyAmount,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      setPortfolio((prev) => ({
        ...prev,
        strategy: prev.strategy
          ? {
              ...prev.strategy,
              weeksCompleted: newWeeksCompleted,
            }
          : null,
        portfolio: {
          holdings: newHoldings,
          holdingsValue: newHoldingsValue,
          holdingsChange: newHoldingsChange,
          totalValue: Math.round(newTotalValue),
          costBasis: newCostBasis,
          profitLoss: newProfitLoss,
          profitLossPercent: newProfitLossPercent,
        },
        dcaPoolBalance: prev.dcaPoolBalance - weeklyAmount,
        nextDCA: getNextMonday().toISOString(),
      }));

      // Check for milestones
      const totalWeeks = strategy.totalWeeks || 52;
      const progressPercent = (newWeeksCompleted / totalWeeks) * 100;

      if (progressPercent >= 25 && progressPercent < 26) {
        setMilestoneValue(25);
        setModal("milestone");
      } else if (progressPercent >= 50 && progressPercent < 51) {
        setMilestoneValue(50);
        setModal("milestone");
      } else if (progressPercent >= 75 && progressPercent < 76) {
        setMilestoneValue(75);
        setModal("milestone");
      } else if (progressPercent >= 100) {
        setMilestoneValue(100);
        setModal("milestone");
      }

      setIsSimulating(false);

      toast({
        title: `Week ${newWeeksCompleted} complete! ✅`,
        description: `Bought ${Object.keys(purchased).join(
          ", "
        )} with ${weeklyAmount} GAS`,
      });
    }, 1500);
  }, [portfolio]);

  const handleWithdraw = useCallback((amount: number) => {
    setPortfolio((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        totalValue: Math.max(0, prev.portfolio.totalValue - amount),
      },
    }));
    setModal(null);
    toast({
      title: "Withdrawal complete",
      description: `${amount} GAS withdrawn from your portfolio`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        totalValue={portfolio.portfolio.totalValue}
        onAddMoney={() => setModal("addMoney")}
        hasStrategy={portfolio.hasStrategy}
        currentView={view}
        onViewChange={setView}
      />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {view === "onboarding" && (
            <OnboardingView
              key="onboarding"
              onVoiceClick={() => setModal("voice")}
              onBrowseClick={() => setView("strategies")}
            />
          )}

          {view === "strategies" && (
            <StrategiesGrid
              key="strategies"
              onBack={() => setView("onboarding")}
              onSelectStrategy={handleSelectStrategy}
            />
          )}

          {view === "dashboard" && (
            <Dashboard
              key="dashboard"
              portfolio={portfolio}
              transactions={transactions}
              onAddMoney={() => setModal("addMoney")}
              onSimulateWeek={handleSimulateWeek}
              onWithdraw={() => setModal("withdraw")}
              isSimulating={isSimulating}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === "voice" && (
          <VoiceModal
            onClose={() => setModal(null)}
            onResult={handleVoiceResult}
          />
        )}

        {modal === "setup" && selectedStrategy && (
          <SetupModal
            strategy={selectedStrategy}
            onClose={() => setModal(null)}
            onSetup={handleSetup}
          />
        )}

        {modal === "addMoney" && portfolio.strategy && (
          <AddMoneyModal
            currentBalance={portfolio.dcaPoolBalance}
            weeklySpend={portfolio.strategy.weeklyAmount}
            onClose={() => setModal(null)}
            onAdd={handleAddMoney}
          />
        )}

        {modal === "withdraw" && portfolio.strategy && (
          <WithdrawModal
            currentValue={portfolio.portfolio.totalValue}
            weeksCompleted={portfolio.strategy.weeksCompleted}
            totalWeeks={portfolio.strategy.totalWeeks}
            strictMode={portfolio.strategy.strictMode}
            onClose={() => setModal(null)}
            onWithdraw={handleWithdraw}
          />
        )}

        {modal === "milestone" && milestoneValue && portfolio.strategy && (
          <MilestoneModal
            milestone={milestoneValue}
            weeksCompleted={portfolio.strategy.weeksCompleted}
            totalInvested={portfolio.portfolio.costBasis}
            currentValue={portfolio.portfolio.totalValue}
            profit={portfolio.portfolio.profitLoss}
            profitPercent={portfolio.portfolio.profitLossPercent}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Savvy Agent Chat Widget */}
      <div className="fixed bottom-24 right-6 z-50">
        <SavvyAgentChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-50 text-white"
      >
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

function getNextMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);
  return nextMonday;
}

export default Index;
