import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Wallet, X, Mic, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  role: "user" | "agent";
  content: string;
};

const DEFAULT_WALLET = "0x1234567890123456789012345678901234567890";

interface SavvyAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Extend Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function SavvyAgentChat({ isOpen, onClose }: SavvyAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hi! I'm your Savvy DCA Agent on Neo X. Share your goal or ask me to check your balance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [walletAddress, setWalletAddress] = useState(DEFAULT_WALLET);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition once
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    // Initialize recognition instance once
    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // Set up event handlers
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      // Append transcript to existing input
      setInput((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    // Store in ref to prevent garbage collection
    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
        recognitionRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not available.");
      return;
    }

    // Crucial Logic: If listening, stop; if not, start
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        setIsListening(false);
      }
    }
  };

  const playAudioResponse = async (text: string) => {
    try {
      setIsSpeaking(true);

      const res = await fetch("http://localhost:5001/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`TTS request failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/agent/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_prompt: trimmed,
          wallet_address: walletAddress,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const agentReply = data?.response ?? "No response from agent.";

      const agentMessage: Message = { role: "agent", content: agentReply };
      setMessages((prev) => [...prev, agentMessage]);

      // Automatically play agent response
      await playAudioResponse(agentReply);
    } catch (err: any) {
      const errorMessage: Message = {
        role: "agent",
        content:
          err?.message ||
          "Something went wrong contacting the agent. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-[400px] h-[600px] bg-[hsl(var(--card))] backdrop-blur-xl border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-400 bg-clip-text text-transparent">
                    Savvy AI
                  </h1>
                  <div className="absolute -right-2 -top-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-1 text-[hsl(var(--primary))]"
                  >
                    <Volume2 className="h-4 w-4" />
                  </motion.div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[hsl(var(--foreground))]/70" />
              </button>
            </header>

            {/* Wallet Address Input */}
            <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 bg-[hsl(var(--input))] rounded-lg px-3 py-2 border border-[hsl(var(--border))]">
                <Wallet className="h-4 w-4 text-[hsl(var(--primary))]" />
                <input
                  className="bg-transparent w-full text-sm text-[hsl(var(--foreground))] focus:outline-none placeholder:text-[hsl(var(--foreground))]/40"
                  placeholder="Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))]"
            >
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
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`p-2 rounded-full border flex-shrink-0 ${
                          msg.role === "user"
                            ? "border-blue-500/50 bg-blue-500/20"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-blue-300" />
                        ) : (
                          <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                    isListening
                      ? "bg-red-500/20 border-2 border-red-500 animate-pulse"
                      : "bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Mic
                    className={`h-5 w-5 ${
                      isListening
                        ? "text-red-500"
                        : "text-[hsl(var(--foreground))]"
                    }`}
                  />
                </button>
                <input
                  className="flex-1 bg-[hsl(var(--input))] backdrop-blur-sm text-[hsl(var(--foreground))] rounded-xl px-4 py-2.5 border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20 placeholder:text-[hsl(var(--foreground))]/40 transition-all"
                  placeholder="Ask the Savvy agent..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 hover:from-[hsl(var(--primary))]/90 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-[hsl(var(--primary))]/30 hover:shadow-[hsl(var(--primary))]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[hsl(var(--primary))]/30"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
