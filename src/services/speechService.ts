import * as Speech from 'expo-speech';

export class SpeechService {
  private language = 'es-CO';

  async speak(text: string): Promise<void> {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      await Speech.speak(trimmedText, {
        language: this.language,
        pitch: 1,
        rate: 0.9,
      });
    } catch (error) {
      console.warn('Speech error:', error);
    }
  }

  async stop(): Promise<void> {
    try {
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
