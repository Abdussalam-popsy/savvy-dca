import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useReactMediaRecorder } from "react-media-recorder";

interface VoiceModalProps {
  onClose: () => void;
  onResult: (transcript: string) => void;
}

export function VoiceModal({ onClose, onResult }: VoiceModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Media Recorder hook for audio recording
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  // Handle audio blob when recording finishes
  useEffect(() => {
    if (!mediaBlobUrl) return;

    const transcribeAudio = async () => {
      setIsProcessing(true);
      setError(null);

      try {
        // Fetch the blob from the mediaBlobUrl
        const blob = await fetch(mediaBlobUrl).then((r) => r.blob());

        // Convert WebM to WAV using AudioContext
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV
        const wavBlob = await audioBufferToWav(audioBuffer);

        // Create FormData and send to backend
        const formData = new FormData();
        formData.append("audio", wavBlob, "recording.wav");

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
          const errorData = await transcribeResponse.json();
          throw new Error(
            errorData.error ||
              `Transcription failed with status ${transcribeResponse.status}`
          );
        }

        const data = await transcribeResponse.json();
        const transcribedText = data?.text || "";

        if (transcribedText) {
          // Call onResult and close modal
          onResult(transcribedText);
          onClose();
        } else {
          setError("No text was transcribed. Please try speaking louder.");
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error("Error transcribing audio:", err);
        setError(
          err?.message || "Failed to transcribe audio. Please try again."
        );
        setIsProcessing(false);
      }
    };

    transcribeAudio();
  }, [mediaBlobUrl, onResult, onClose]);

  const handleButtonClick = () => {
    // If recording, stop; otherwise, start
    if (status === "recording") {
      stopRecording();
    } else {
      setError(null);
      startRecording();
    }
  };

  const isRecording = status === "recording";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="mb-8">
            <motion.div
              animate={
                isRecording
                  ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(16, 185, 129, 0.4)",
                        "0 0 0 30px rgba(16, 185, 129, 0)",
                        "0 0 0 0 rgba(16, 185, 129, 0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ${
                isRecording
                  ? "bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                  : "bg-white/5"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-16 h-16 text-emerald-400 animate-spin" />
              ) : (
                <motion.div
                  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 1,
                    repeat: isRecording ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Mic
                    className={`w-16 h-16 ${
                      isRecording ? "text-emerald-400" : "text-white/60"
                    }`}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            {isProcessing
              ? "Processing audio..."
              : isRecording
              ? "Listening... Click to stop"
              : "Voice Setup"}
          </h3>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-200 text-sm mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                {error}
              </motion.p>
            ) : !isProcessing && !isRecording ? (
              <motion.div
                key="instructions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 text-sm text-white/50 mb-6"
              >
                <p className="text-white/60 text-sm mb-2">
                  Say something like:
                </p>
                <p className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  "Copy SafeStack with 100 GAS weekly"
                </p>
                <p className="text-xs text-white/40">or</p>
                <p className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  "Create 60% BTC, 40% ETH, 100 GAS weekly"
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!isProcessing && (
            <Button
              onClick={handleButtonClick}
              className={`w-full ${
                isRecording
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              } font-bold transition-all duration-300`}
            >
              {isRecording ? "Stop Listening" : "Start Listening"}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  return new Promise((resolve) => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data = new Float32Array(buffer.length * numberOfChannels);
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      for (let j = 0; j < buffer.length; j++) {
        data[j * numberOfChannels + i] = channelData[j];
      }
    }

    const dataLength = data.length * bytesPerSample;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, totalLength - 8, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }

    resolve(new Blob([arrayBuffer], { type: "audio/wav" }));
  });
}
