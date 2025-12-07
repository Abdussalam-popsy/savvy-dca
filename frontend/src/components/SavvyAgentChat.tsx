import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Wallet, X, Mic, Volume2, Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useReactMediaRecorder } from "react-media-recorder";

type Message = {
  role: "user" | "agent";
  content: string;
};

const DEFAULT_WALLET = "0x1234567890123456789012345678901234567890";

interface SavvyAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedMessageRef = useRef<string>("");
  const currentAudioUrlRef = useRef<string | null>(null);

  // React Media Recorder hook for audio recording
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle audio blob when recording finishes
  useEffect(() => {
    if (!mediaBlobUrl) return;

    const transcribeAudio = async () => {
      try {
        // Fetch the blob from the mediaBlobUrl
        const blob = await fetch(mediaBlobUrl).then((r) => r.blob());

        // Create FormData and send to backend
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const transcribeResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5001"
          }/api/transcribe`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!transcribeResponse.ok) {
          throw new Error(
            `Transcription failed with status ${transcribeResponse.status}`
          );
        }

        const data = await transcribeResponse.json();
        const transcribedText = data?.text || "";

        if (transcribedText) {
          // Call sendMessage with the transcribed text
          sendMessage(transcribedText);
        }
      } catch (err) {
        console.error("Error transcribing audio:", err);
        // Optionally show error to user
      }
    };

    transcribeAudio();
  }, [mediaBlobUrl]);

  // Auto-play agent messages with voice
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === "agent" &&
      lastMessage.content &&
      lastMessage.content !== lastPlayedMessageRef.current
    ) {
      // Mark as played
      lastPlayedMessageRef.current = lastMessage.content;

      // Small delay to ensure message is rendered
      const timer = setTimeout(() => {
        playSavvyVoice(lastMessage.content);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
    };
  }, []);

  const handleVoiceInput = () => {
    // If recording, stop; otherwise, start
    if (status === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playSavvyVoice = async (text: string) => {
    try {
      setIsSpeaking(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiUrl}/api/savvy/speak`, {
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

      // Clean up previous URL if exists
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      currentAudioUrlRef.current = url;

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      // Wait a tick for audio element to be available in DOM
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (!audioRef.current) {
        URL.revokeObjectURL(url);
        currentAudioUrlRef.current = null;
        throw new Error("Audio element not available");
      }

      // Set audio source and play
      audioRef.current.src = url;
      await audioRef.current.play();
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsSpeaking(false);
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5001"
        }/api/agent/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_prompt: textToSend,
            wallet_address: walletAddress,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const agentReply = data?.response ?? "No response from agent.";

      const agentMessage: Message = { role: "agent", content: agentReply };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);
      let errorContent = "Something went wrong contacting the agent.";

      if (
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      ) {
        errorContent =
          "Unable to connect to the backend. Please make sure the server is running on http://localhost:5001";
      } else if (err?.message) {
        errorContent = `Error: ${err.message}`;
      }

      const errorMessage: Message = {
        role: "agent",
        content: errorContent,
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
        <>
          {/* Backdrop - Blurred and Darkened Background */}
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
                  {/* Clover Icon with Animation */}
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
                        {/* Pulsing background ring */}
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
                        {/* Second pulse ring */}
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
                        {/* Clover icon */}
                        <div className="relative z-10 text-2xl">🍀</div>
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-2xl opacity-70">
                        🍀
                      </div>
                    )}
                  </div>

                  {/* Title and Status */}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-400 bg-clip-text text-transparent">
                      Savvy AI
                    </h1>
                    <div className="flex items-center gap-2">
                      {isSpeaking ? (
                        <motion.p
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                          }}
                          className="text-xs font-medium text-[hsl(var(--primary))] flex items-center gap-1"
                        >
                          <span className="text-base">🎙️</span>
                          <span>Speaking...</span>
                        </motion.p>
                      ) : (
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Your DCA Coach
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Online indicator */}
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {isSpeaking && (
                      <motion.div
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                        }}
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
                      status === "recording"
                        ? "bg-red-500/20 border-2 border-red-500 animate-pulse"
                        : "bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status === "recording" ? (
                      <Square className="h-5 w-5 text-red-500" />
                    ) : (
                      <Mic className="h-5 w-5 text-[hsl(var(--foreground))]" />
                    )}
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
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 hover:from-[hsl(var(--primary))]/90 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-[hsl(var(--primary))]/30 hover:shadow-[hsl(var(--primary))]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[hsl(var(--primary))]/30"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                onEnded={() => {
                  setIsSpeaking(false);
                  if (currentAudioUrlRef.current) {
                    URL.revokeObjectURL(currentAudioUrlRef.current);
                    currentAudioUrlRef.current = null;
                  }
                }}
                onError={() => {
                  setIsSpeaking(false);
                  if (currentAudioUrlRef.current) {
                    URL.revokeObjectURL(currentAudioUrlRef.current);
                    currentAudioUrlRef.current = null;
                  }
                }}
                style={{ display: "none" }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
