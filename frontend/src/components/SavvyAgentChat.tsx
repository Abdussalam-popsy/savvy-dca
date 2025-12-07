import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface SavvyAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extend HTML elements to include the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": any;
    }
  }
}

export function SavvyAgentChat({ isOpen, onClose }: SavvyAgentChatProps) {
  const agentId = "agent_0901kbwhr3abeahb4fkj6f232qjz";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-[400px] h-[600px] bg-[hsl(var(--card))] backdrop-blur-xl border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <header className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--card))]/80">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 flex items-center justify-center text-2xl">
                    🍀
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-400 bg-clip-text text-transparent">
                      Savvy AI
                    </h1>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Your DCA Coach
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors ml-2"
                >
                  <X className="h-5 w-5 text-[hsl(var(--foreground))]/70" />
                </button>
              </header>

              {/* ElevenLabs Widget */}
              <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
                <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
