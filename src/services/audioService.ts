import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Audio Service
 * Manages music and sound effects playback
 */

export class AudioService {
  private soundEffects: Map<string, Audio.Sound> = new Map();
  private backgroundMusic: Audio.Sound | null = null;
  private isMusicEnabled = true;
  private isSoundEnabled = true;

  constructor() {
    // Initialize audio mode
    this.initializeAudio();
  }

  /**
   * Initialize audio settings
   */
  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
  }

  /**
   * Play sound effect
   */
  async playSoundEffect(
    soundName: 'tap' | 'success' | 'error' | 'level_up' | 'achievement'
  ) {
    if (!this.isSoundEnabled) return;

    try {
      // Map sound names to require paths
      const soundMap = {
        tap: require('../../assets/sounds/tap.mp3'),
        success: require('../../assets/sounds/success.mp3'),
        error: require('../../assets/sounds/error.mp3'),
        level_up: require('../../assets/sounds/level_up.mp3'),
        achievement: require('../../assets/sounds/achievement.mp3'),
      };

      // Check if sound already loaded
      if (this.soundEffects.has(soundName)) {
        const sound = this.soundEffects.get(soundName);
        if (sound) {
          await sound.stopAsync();
          await sound.playAsync();
        }
        return;
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(soundMap[soundName]);
      this.soundEffects.set(soundName, sound);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }

  private currentMusicName: string | null = null;

  /**
   * Play background music
   */
  async playBackgroundMusic(
    musicName: 'menu' | 'game' | 'result' = 'game',
    loop = true
  ) {
    if (!this.isMusicEnabled) return;
    
    // Don't restart if the same music is already playing
    if (this.currentMusicName === musicName && this.backgroundMusic) {
      return;
    }

    try {
      const musicMap = {
        menu: require('../../assets/music/menu.mp3'),
        game: require('../../assets/music/game.mp3'),
        result: require('../../assets/music/result.mp3'),
      };

      // Stop current music
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }

      // Load and play new music
      const { sound } = await Audio.Sound.createAsync(
        musicMap[musicName],
        { progressUpdateIntervalMillis: 100 }
      );

      if (loop) {
        await sound.setIsLoopingAsync(true);
      }

      this.backgroundMusic = sound;
      this.currentMusicName = musicName;
      await sound.playAsync();
    } catch (error) {
      console.warn(`Error playing music ${musicName}:`, error);
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        this.currentMusicName = null;
      }
    } catch (error) {
      console.warn('Error stopping music:', error);
    }
  }

  /**
   * Pause background music
   */
  async pauseBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.pauseAsync();
      }
    } catch (error) {
      console.warn('Error pausing music:', error);
    }
  }

  /**
   * Resume background music
   */
  async resumeBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.playAsync();
      }
    } catch (error) {
      console.warn('Error resuming music:', error);
    }
  }

  /**
   * Set volume
   */
  async setVolume(soundName: string, volume: number) {
    try {
      if (soundName === 'music' && this.backgroundMusic) {
        await this.backgroundMusic.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } else if (this.soundEffects.has(soundName)) {
        const sound = this.soundEffects.get(soundName);
        if (sound) {
          await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        }
      }
    } catch (error) {
      console.warn(`Error setting volume for ${soundName}:`, error);
    }
  }

  /**
   * Toggle music
   */
  toggleMusic() {
    this.isMusicEnabled = !this.isMusicEnabled;
  }

  /**
   * Toggle sound effects
   */
  toggleSoundEffects() {
    this.isSoundEnabled = !this.isSoundEnabled;
  }

  /**
   * Get music enabled state
   */
  isMusicEnabledState() {
    return this.isMusicEnabled;
  }

  /**
   * Get sound enabled state
   */
  isSoundEnabledState() {
    return this.isSoundEnabled;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Unload all sound effects
      for (const sound of this.soundEffects.values()) {
        await sound.unloadAsync();
      }
      this.soundEffects.clear();

      // Unload background music
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }
    } catch (error) {
      console.warn('Error cleaning up audio:', error);
    }
  }
}

// Singleton instance
export const audioService = new AudioService();
