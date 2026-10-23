"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: "mr-IN" | "hi-IN" | "en-IN";
  placeholder?: string;
  className?: string;
  title?: string;
}

export function VoiceInputButton({
  onTranscript,
  lang = "mr-IN",
  className = "",
  title = "बोलून इनपुट द्या (Voice Input)",
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMessage("मायक्रोफोन परवानगी नाकारली गेली आहे (Microphone access denied)");
        } else if (event.error === "no-speech") {
          setErrorMessage("आवाज ऐकू आला नाही, कृपया पुन्हा प्रयत्न करा (No speech heard)");
        } else {
          setErrorMessage(`आवाज ओळखण्यात त्रुटी: ${event.error}`);
        }
        setTimeout(() => setErrorMessage(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      setErrorMessage("तुमच्या ब्राऊझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया थेट टाईप करा.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = lang;
          recognitionRef.current.start();
        }
      } catch (err: any) {
        console.warn("Speech recognition start failed:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={title}
        aria-label={title}
        className={`p-2 rounded-lg transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] ${
          isListening
            ? "bg-red-500 text-white animate-pulse ring-2 ring-red-400"
            : "bg-[var(--warm-gray-100)] text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-200)] hover:text-[var(--ink)]"
        } ${className}`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 animate-bounce text-white" />
        ) : (
          <Mic className="w-4 h-4 text-[var(--teal-deep)]" />
        )}
      </button>

      {/* Floating status indicator when listening */}
      {isListening && (
        <div className="absolute right-0 top-full mt-1.5 z-40 bg-[var(--ink)] text-white text-[11px] px-2.5 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>ऐकत आहे... स्पष्ट बोला (Listening...)</span>
        </div>
      )}

      {/* Error Tooltip */}
      {errorMessage && (
        <div className="absolute right-0 top-full mt-1.5 z-40 bg-red-800 text-white text-[11px] px-2.5 py-1.5 rounded shadow-lg max-w-xs flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-red-200 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
