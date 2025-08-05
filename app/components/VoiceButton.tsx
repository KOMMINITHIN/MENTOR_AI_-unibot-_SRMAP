"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import "./VoiceButton.css";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export default function VoiceButton({ onTranscript, isListening, setIsListening }: VoiceButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState({ language: "en-US", voiceEnabled: true });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = settings.language;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    // Listen for settings changes
    const handleSettingsChange = (event: any) => {
      setSettings(event.detail);
      if (recognitionRef.current) {
        recognitionRef.current.lang = event.detail.language;
      }
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Load initial settings
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      if (recognitionRef.current) {
        recognitionRef.current.lang = parsed.language;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, [onTranscript, setIsListening]);

  const toggleListening = () => {
    if (!settings.voiceEnabled) {
      alert("Voice input is disabled. Enable it in settings.");
      return;
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  if (!isSupported || !settings.voiceEnabled) {
    return null; // Hide button if not supported or disabled
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`voice-button ${isListening ? 'listening' : ''}`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      {isListening && <div className="pulse-ring"></div>}
    </button>
  );
}
