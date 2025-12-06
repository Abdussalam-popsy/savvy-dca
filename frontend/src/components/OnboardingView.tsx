import { motion } from "framer-motion";
import { Mic, MousePointer2 } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingViewProps {
  onVoiceClick: () => void;
  onBrowseClick: () => void;
}

export function OnboardingView({
  onVoiceClick,
  onBrowseClick,
}: OnboardingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl leading-tight"
      >
        Stop panic-selling. Start building wealth.
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground mb-12 max-w-xl"
      >
        Your AI coach enforces DCA discipline—even when markets crash.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground mb-8"
      >
        <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          Powered by SpoonOS
        </span>
        <span>•</span>
        <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          Secured by Turnkey
        </span>
        <span>•</span>
        <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          Built on Neo
        </span>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-xl" />
          <Button
            variant="default"
            size="xl"
            onClick={onVoiceClick}
            className="relative z-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/50 transition-all hover:scale-105 flex items-center gap-3"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Mic className="w-5 h-5 text-white" />
            </motion.span>
            Use Voice
          </Button>
        </div>

        <Button
          variant="outline"
          size="xl"
          onClick={onBrowseClick}
          className="border-slate-700 hover:border-emerald-500 hover:text-emerald-400"
        >
          <MousePointer2 className="w-5 h-5" />
          Browse Strategies
        </Button>
      </motion.div>
    </motion.div>
  );
}
