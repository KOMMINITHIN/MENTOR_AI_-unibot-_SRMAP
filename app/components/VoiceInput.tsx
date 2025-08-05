"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Languages, Play, Pause } from "lucide-react";
import "./VoiceInput.css";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onSpeakText: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export default function VoiceInput({ onTranscript, onSpeakText, isListening, setIsListening }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Supported languages for speech recognition
  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" }
  ];

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      synthRef.current = speechSynthesis;
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
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
    
    // Listen for auto-speech events
    const handleAutoSpeech = (event: any) => {
      if (speechEnabled) {
        speakText(event.detail);
      }
    };

    window.addEventListener('speakText', handleAutoSpeech);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      window.removeEventListener('speakText', handleAutoSpeech);
    };
  }, [selectedLanguage, onTranscript, setIsListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || !speechEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Clean text for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/`(.*?)`/g, '$1')       // Remove code markdown
      .replace(/#{1,6}\s/g, '')        // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\n+/g, '. ')           // Replace newlines with pauses
      .trim();
    
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice based on selected language
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang.startsWith(selectedLanguage.split('-')[0])) || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-not-supported">
        <span>🎤 Voice features not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="voice-controls">
      {/* Speech Recognition */}
      <div className="voice-input-section">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>Listening...</span>
          </div>
        )}
      </div>

      {/* Text-to-Speech */}
      <div className="voice-output-section">
        <button
          type="button"
          onClick={toggleSpeech}
          className={`speech-btn ${speechEnabled ? 'enabled' : 'disabled'}`}
          title={speechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
        >
          {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            className="stop-speech-btn"
            title="Stop speaking"
          >
            <Pause size={16} />
          </button>
        )}
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <Languages size={16} />
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="language-select"
          title="Select language"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Status */}
      {(isListening || isSpeaking) && (
        <div className="voice-status">
          {isListening && <span className="status-item">🎤 Listening</span>}
          {isSpeaking && <span className="status-item">🔊 Speaking</span>}
        </div>
      )}
    </div>
  );
}
