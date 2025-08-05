"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Pause } from "lucide-react";
import "./SpeakingIndicator.css";

export default function SpeakingIndicator() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState({ autoSpeak: true, voiceEnabled: true });
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Listen for auto-speech events
    const handleAutoSpeech = (event: any) => {
      if (settings.autoSpeak && settings.voiceEnabled) {
        speakText(event.detail);
      }
    };

    // Listen for settings changes
    const handleSettingsChange = (event: any) => {
      setSettings(event.detail);
    };

    window.addEventListener('speakText', handleAutoSpeech);
    window.addEventListener('settingsChanged', handleSettingsChange);

    // Load initial settings
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      window.removeEventListener('speakText', handleAutoSpeech);
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, [settings.autoSpeak, settings.voiceEnabled]);

  const speakText = (text: string) => {
    if (!synthRef.current || !settings.voiceEnabled) return;
    
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
    const voice = voices.find(v => v.lang.startsWith(settings.language?.split('-')[0] || 'en')) || voices[0];
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

  if (!settings.voiceEnabled || !isSpeaking) {
    return null;
  }

  return (
    <div className="speaking-indicator">
      <div className="speaking-content">
        <div className="speaking-icon">
          <Volume2 size={16} />
        </div>
        <div className="speaking-text">
          <span>AI is speaking...</span>
          <div className="sound-waves">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <button
          type="button"
          onClick={stopSpeaking}
          className="stop-speaking-btn"
          title="Stop speaking"
        >
          <Pause size={14} />
        </button>
      </div>
    </div>
  );
}
