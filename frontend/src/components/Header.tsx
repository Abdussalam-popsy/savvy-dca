import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Plus, Home, Grid3x3, LayoutDashboard } from "lucide-react";
import { useEffect, useRef } from "react";

type View = "onboarding" | "strategies" | "dashboard";

interface HeaderProps {
  totalValue: number;
  onAddMoney: () => void;
  hasStrategy: boolean;
  onHomeClick?: () => void;
  currentView?: View;
  onViewChange?: (view: View) => void;
}

export function Header({
  totalValue,
  onAddMoney,
  hasStrategy,
  onHomeClick,
  currentView = "onboarding",
  onViewChange,
}: HeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (currentView && container && activeTabRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef.current;
      const clipLeft = offsetLeft;
      const clipRight = offsetLeft + offsetWidth;

      container.style.clipPath = `inset(0 ${Number(
        100 - (clipRight / container.offsetWidth) * 100
      ).toFixed()}% 0 ${Number(
        (clipLeft / container.offsetWidth) * 100
      ).toFixed()}% round 8px)`;
    }
  }, [currentView]);

  const tabs = [
    { view: "onboarding" as View, label: "Home", icon: Home },
    { view: "strategies" as View, label: "Strategies", icon: Grid3x3 },
    { view: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onViewChange?.("onboarding")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              ✨
            </motion.span>
            <div>
              <h1 className="text-xl font-bold text-foreground">Savvy</h1>
              <p className="text-xs text-muted-foreground">
                Your AI DCA Partner
              </p>
            </div>
          </div>

          {/* Animated Navigation Tabs */}
          {onViewChange && (
            <div className="relative">
              {/* Background tabs (inactive) */}
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.view}
                      ref={currentView === tab.view ? activeTabRef : null}
                      onClick={() => onViewChange(tab.view)}
                      className="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Animated overlay (active tab) */}
              <div
                ref={containerRef}
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none transition-[clip-path] duration-300 ease-out"
                style={{ clipPath: "inset(0 66% 0 0% round 8px)" }}
              >
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 h-full">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.view}
                        onClick={() => onViewChange(tab.view)}
                        className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 bg-emerald-600 text-white pointer-events-auto"
                        tabIndex={-1}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {hasStrategy && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Portfolio Value
                  </p>
                  <motion.p
                    key={totalValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    £{totalValue.toLocaleString()}
                  </motion.p>
                </div>
                <Button variant="coral" onClick={onAddMoney}>
                  <Plus className="w-4 h-4" />
                  Add Money
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
