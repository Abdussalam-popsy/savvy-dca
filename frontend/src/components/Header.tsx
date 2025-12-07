import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Plus, Home, Grid3x3, LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onViewChange?.("onboarding")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <motion.img
              src="/android-chrome-512x512.png"
              alt="Savvy Logo"
              className="w-8 h-8 object-contain"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Savvy</h1>
              <p className="text-xs text-muted-foreground">
                Your AI DCA Partner
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Hidden on mobile */}
          {onViewChange && (
            <div className="relative hidden md:block">
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

          {/* Mobile Menu Button - Visible on mobile landscape and below */}
          {onViewChange && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          )}

          {/* Right Side Actions - Desktop Only */}
          <div className="hidden md:flex items-center gap-4">
            {hasStrategy && (
              <div className="flex items-center gap-3">
                {/* Portfolio Value - Dark pill with green value section */}
                <div className="flex items-center bg-slate-900/90 rounded-full px-4 py-2 border border-slate-800">
                  <span className="text-sm text-white font-medium mr-3">
                    Portfolio Value
                  </span>
                  <motion.div
                    key={totalValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-600 rounded-full px-4 py-1"
                  >
                    <span className="text-sm font-bold text-white">
                      £{totalValue.toLocaleString()}
                    </span>
                  </motion.div>
                </div>
                {/* Add Money Button - Green pill */}
                <Button
                  onClick={onAddMoney}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-5 py-2 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add money
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="px-6 py-4 space-y-2">
                {/* Navigation Tabs */}
                {onViewChange &&
                  tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentView === tab.view;
                    return (
                      <button
                        key={tab.view}
                        onClick={() => {
                          onViewChange(tab.view);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-800/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}

                {/* Portfolio Value and Add Money - Mobile */}
                {hasStrategy && (
                  <>
                    <div className="pt-2 pb-2 border-t border-border mt-2">
                      {/* Portfolio Value */}
                      <div className="flex items-center justify-between mb-3 px-4 py-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-sm text-muted-foreground">
                          Portfolio Value
                        </span>
                        <motion.span
                          key={totalValue}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-bold text-emerald-400"
                        >
                          £{totalValue.toLocaleString()}
                        </motion.span>
                      </div>
                      {/* Add Money Button */}
                      <Button
                        onClick={() => {
                          onAddMoney();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add money
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
