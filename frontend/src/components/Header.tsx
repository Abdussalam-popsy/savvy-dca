import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Plus, LogOut } from "lucide-react";

interface HeaderProps {
  totalValue: number;
  onAddMoney: () => void;
  hasStrategy: boolean;
  onHomeClick?: () => void;
}

export function Header({
  totalValue,
  onAddMoney,
  hasStrategy,
  onHomeClick,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          onClick={onHomeClick}
          className={`flex items-center gap-2 ${
            onHomeClick
              ? "cursor-pointer hover:opacity-80 transition-opacity"
              : ""
          }`}
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
            <p className="text-xs text-muted-foreground">Your AI DCA Partner</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasStrategy && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
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

          {onHomeClick && (
            <button
              onClick={onHomeClick}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
