import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface VoiceModalProps {
  onClose: () => void;
  onResult: (transcript: string) => void;
}

export function VoiceModal({ onClose, onResult }: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice recognition not supported. Please use manual setup.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      setTranscript(current[0].transcript);
      
      if (current.isFinal) {
        setIsProcessing(true);
        setTimeout(() => {
          onResult(current[0].transcript);
        }, 1500);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError('Could not recognize speech. Please try again.');
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Auto-start listening
    recognitionRef.current.start();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-lg max-w-md w-full p-8 text-center"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="mb-8">
          <motion.div
            animate={isListening ? {
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 0 0 rgba(255, 155, 155, 0.4)',
                '0 0 0 20px rgba(255, 155, 155, 0)',
                '0 0 0 0 rgba(255, 155, 155, 0)'
              ]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center mx-auto"
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-coral animate-spin" />
            ) : (
              <Mic className={`w-10 h-10 ${isListening ? 'text-coral' : 'text-muted-foreground'}`} />
            )}
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">
          {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Click to speak'}
        </h3>

        {error ? (
          <p className="text-destructive text-sm mb-6">{error}</p>
        ) : transcript ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground mb-6 p-4 bg-muted rounded-lg"
          >
            "{transcript}"
          </motion.p>
        ) : (
          <p className="text-muted-foreground text-sm mb-6">
            Say something like:
          </p>
        )}

        {!transcript && !error && (
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p className="p-2 bg-muted/50 rounded-lg">
              "Copy SafeStack with 100 GAS weekly"
            </p>
            <p className="text-xs">or</p>
            <p className="p-2 bg-muted/50 rounded-lg">
              "Create 60% BTC, 40% ETH, 100 GAS weekly"
            </p>
          </div>
        )}

        {!isProcessing && (
          <Button 
            variant={isListening ? 'destructive' : 'coral'}
            onClick={toggleListening}
            className="w-full"
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
