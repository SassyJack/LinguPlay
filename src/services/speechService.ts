import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

interface ResponsiveVoice {
  speak: (text: string, voice: string, options?: { rate?: number; pitch?: number; onend?: () => void }) => void;
  cancel: () => void;
  isSpeaking: boolean;
  getVoices: () => string[];
}

declare global {
  interface Window {
    responsiveVoice?: ResponsiveVoice;
    speechSynthesis?: SpeechSynthesis;
  }
}

let isInitialized = false;
let selectedVoice: SpeechSynthesisVoice | null = null;

function loadResponsiveVoice(): Promise<void> {
  return new Promise((resolve) => {
    if (window.responsiveVoice) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="responsivevoice.js"]');
    if (existing) {
      const check = () => {
        if (window.responsiveVoice) resolve();
      };
      check();
      const interval = setInterval(check, 100);
      setTimeout(() => { clearInterval(interval); resolve(); }, 3000);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=YOUR_KEY';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function getBestWebVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  let voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));

  const preferredNames = [
    'Google español',
    'Microsoft Pablo',
    'Microsoft Helena',
    'Microsoft Sabina',
    'Google Mexico',
    'Google Spain',
  ];

  for (const name of preferredNames) {
    const found = spanishVoices.find((v) => v.name.includes(name));
    if (found) return found;
  }

  return spanishVoices[0] || null;
}

function speakWithWebSpeech(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.pitch = 1.1;
  utterance.rate = 0.85;

  if (!selectedVoice) {
    selectedVoice = getBestWebVoice();
  }

  const trySpeak = () => {
    if (!selectedVoice) {
      selectedVoice = getBestWebVoice();
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => trySpeak();
    window.speechSynthesis.getVoices();
  } else {
    trySpeak();
  }
}

export class SpeechService {
  private language = 'es-419';
  private preferredVoice: string | undefined;

  async speak(text: string): Promise<void> {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    try {
      await this.stop();

      if (Platform.OS === 'web') {
        if (!isInitialized) {
          await loadResponsiveVoice();
          isInitialized = true;
          await new Promise((r) => setTimeout(r, 300));
        }

        if (window.responsiveVoice) {
          const voices = window.responsiveVoice.getVoices();
          const spanishVoice = voices.find(
            (v) =>
              v.includes('Spanish Female') ||
              v.includes('Spanish Male') ||
              v.includes('Laura') ||
              v.includes('Diego') ||
              v.includes('Pablo') ||
              v.includes('es-MX') ||
              v.includes('es-ES')
          );

          if (spanishVoice) {
            window.responsiveVoice.speak(trimmedText, spanishVoice, {
              rate: 0.85,
              pitch: 1.1,
            });
            return;
          }
        }

        speakWithWebSpeech(trimmedText);
        return;
      }

      if (!this.preferredVoice) {
        this.preferredVoice = await this.findBestVoice();
      }

      await Speech.speak(trimmedText, {
        language: this.language,
        pitch: 1.2,
        rate: 0.85,
        voice: this.preferredVoice,
      });
    } catch (error) {
      console.warn('Speech error:', error);
    }
  }

  private async findBestVoice(): Promise<string | undefined> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();

      const enhanced = voices.filter(
        (v) => v.language.startsWith('es') && v.quality === 'enhanced'
      );
      if (enhanced.length > 0) {
        return enhanced[0].identifier;
      }

      const mx = voices.find((v) => v.language === 'es-MX');
      if (mx) return mx.identifier;

      const mx419 = voices.find((v) => v.language === 'es-419');
      if (mx419) return mx419.identifier;

      const es = voices.find((v) => v.language === 'es-ES');
      if (es) return es.identifier;

      const anyEs = voices.find((v) => v.language.startsWith('es'));
      if (anyEs) return anyEs.identifier;

      return undefined;
    } catch (error) {
      console.warn('Error finding voice:', error);
      return undefined;
    }
  }

  async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (window.responsiveVoice) {
          window.responsiveVoice.cancel();
          return;
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          return;
        }
      }

      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
    } catch (error) {
      console.warn('Stop speech error:', error);
    }
  }
}

export const speechService = new SpeechService();
