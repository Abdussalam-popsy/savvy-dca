import { X, Mic, MicOff, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";

interface SavvyAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
  role: "user" | "agent";
  content: string;
};

export function SavvyAgentChat({ isOpen, onClose }: SavvyAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hi! I'm Savvy, your DCA investment coach. Ready to start building your crypto portfolio on Neo? Just hit the button and start talking!",
    },
  ]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to Savvy");
    },
    onDisconnect: () => {
      console.log("❌ Disconnected");
    },
    onMessage: (message) => {
      console.log("📩 Message:", message.role, "-", message.message);

      if (message.role === "user") {
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: message.message,
          },
        ]);
      } else if (message.role === "agent") {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: message.message,
          },
        ]);
      }
    },
    onError: (error) => {
      console.error("❌ Error:", error);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_0901kbwhr3abeahb4fkj6f232qjz",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    // Clear transcript and reset to welcome message
    setMessages([
      {
        role: "agent",
        content:
          "Hi! I'm Savvy, your DCA investment coach. Ready to start building your crypto portfolio on Neo? Just hit the button and start talking!",
      },
    ]);
  }, [conversation]);

  // Status states
  const status = conversation.status;
  const isSpeaking = status === "speaking";
  const isConnected = status === "connected";

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
              className="w-[450px] h-[700px] bg-[hsl(var(--card))] backdrop-blur-xl border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <header className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--card))]/80">
                <div className="flex items-center gap-3 flex-1">
                  {/* Animated Clover Icon */}
                  <div className="relative">
                    {isSpeaking ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          ease: "easeInOut",
                        }}
                        className="relative w-10 h-10 flex items-center justify-center"
                      >
                        {/* Pulsing rings */}
                        <motion.div
                          animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 bg-[hsl(var(--primary))] rounded-full blur-lg"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 2.2, 1],
                            opacity: [0.3, 0, 0.3],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            delay: 0.3,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 bg-cyan-400 rounded-full blur-xl"
                        />
                        <div className="relative z-10 text-2xl">🍀</div>
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-2xl opacity-70">
                        🍀
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-400 bg-clip-text text-transparent">
                      Savvy AI
                    </h1>
                    <div className="flex items-center gap-2">
                      {isSpeaking ? (
                        <motion.p
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Speaking...</span>
                        </motion.p>
                      ) : isConnected ? (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <Mic className="h-3 w-3" />
                          Listening...
                        </p>
                      ) : (
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Your DCA Coach
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="relative">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    {isConnected && (
                      <motion.div
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors ml-2"
                >
                  <X className="h-5 w-5 text-[hsl(var(--foreground))]/70" />
                </button>
              </header>

              {/* Conversation Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Transcript */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))]">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          {/* Label */}
                          <p
                            className={`text-xs font-medium ${
                              msg.role === "user"
                                ? "text-right text-blue-400"
                                : "text-left text-[hsl(var(--primary))]"
                            }`}
                          >
                            {msg.role === "user" ? "You" : "Savvy"}
                          </p>

                          {/* Message bubble */}
                          <div
                            className={`max-w-[320px] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-[hsl(var(--muted))] backdrop-blur-sm text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-lg"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Thinking indicator */}
                  {isConnected &&
                    !isSpeaking &&
                    messages.length > 0 &&
                    messages[messages.length - 1].role === "user" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-[hsl(var(--primary))]">
                            Savvy
                          </p>
                          <div className="bg-[hsl(var(--muted))] rounded-xl px-4 py-3 flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.4,
                              }}
                              className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-4">
                    {!isConnected ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startConversation}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 hover:from-[hsl(var(--primary))]/90 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-[hsl(var(--primary))]/30 hover:shadow-[hsl(var(--primary))]/50 transition-all font-medium"
                      >
                        <Mic className="h-5 w-5" />
                        Start Conversation
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopConversation}
                        className="flex items-center gap-3 px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-red-500 rounded-xl transition-all font-medium"
                      >
                        <MicOff className="h-5 w-5" />
                        End Conversation
                      </motion.button>
                    )}
                  </div>

                  {/* Voice mode indicator */}
                  {isConnected && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-3"
                    >
                      🎤 Voice mode active • Speak naturally
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
