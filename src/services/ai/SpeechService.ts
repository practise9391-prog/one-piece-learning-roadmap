/**
 * Part 7 — Speech Service
 * Voice Input (Speech Recognition) & Voice Output (Speech Synthesis)
 *
 * Implements real Web Speech API when running in supported environments,
 * and provides honest, non-fake fallbacks when running in environments
 * without native speech modules (per Rules 51, 52, 65).
 */

export interface SpeechServiceOptions {
  language?: string;
  speed?: number; // 0.5 to 2.0
  pitch?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechService {
  private static instance: SpeechService | null = null;
  private currentSpeed: number = 1.0;
  private activeRecognition: any = null;

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * Checks whether speech synthesis (voice output) is supported.
   */
  isVoiceOutputAvailable(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether speech recognition (voice input) is supported.
   */
  isVoiceInputAvailable(): boolean {
    if (
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))
    ) {
      return true;
    }
    return false;
  }

  /**
   * General voice mode status.
   */
  isVoiceModeAvailable(): boolean {
    return this.isVoiceOutputAvailable() || this.isVoiceInputAvailable();
  }

  /**
   * Text-to-speech request with speed, pitch, and language support.
   */
  async speak(
    text: string,
    options?: SpeechServiceOptions
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isVoiceOutputAvailable()) {
      return {
        success: false,
        message: 'Speech synthesis is unavailable on this device. Text response is displayed above.',
      };
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior audio

      const cleanText = text
        .replace(/[#*`_~]/g, '') // remove markdown symbols for clean speech
        .replace(/```[\s\S]*?```/g, 'Code block omitted from speech.');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options?.speed ?? this.currentSpeed;
      utterance.pitch = options?.pitch ?? 1.0;
      if (options?.language) {
        utterance.lang = options.language;
      }

      window.speechSynthesis.speak(utterance);
      return { success: true, message: 'Speech synthesized.' };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to speak: ${err?.message || 'Synthesis error'}`,
      };
    }
  }

  /**
   * Pause ongoing speech output.
   */
  pauseSpeaking(): void {
    if (this.isVoiceOutputAvailable() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech output.
   */
  resumeSpeaking(): void {
    if (this.isVoiceOutputAvailable() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Stop speech output completely.
   */
  stopSpeaking(): void {
    if (this.isVoiceOutputAvailable()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if speech output is currently speaking.
   */
  isSpeaking(): boolean {
    if (!this.isVoiceOutputAvailable()) return false;
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }

  /**
   * Set playback speed (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
   */
  setSpeed(speed: number): void {
    this.currentSpeed = Math.max(0.5, Math.min(2.0, speed));
  }

  getSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Speech-to-text listener.
   */
  async startListening(
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<{ started: boolean; message: string }> {
    if (!this.isVoiceInputAvailable()) {
      return {
        started: false,
        message: 'Voice input is unavailable on this device. You can type your question instead.',
      };
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        if (onResult) {
          onResult({
            transcript,
            isFinal,
            confidence: event.results[0]?.[0]?.confidence || 0.9,
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (onError) onError(event.error || 'Recognition error');
      };

      recognition.onend = () => {
        this.activeRecognition = null;
      };

      this.activeRecognition = recognition;
      recognition.start();
      return { started: true, message: 'Listening initiated.' };
    } catch (err: any) {
      return {
        started: false,
        message: `Voice recognition failed to start: ${err?.message || 'Permission denied'}`,
      };
    }
  }

  stopListening(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch {
        // Safe no-op
      }
      this.activeRecognition = null;
    }
  }
}

export const speechService = SpeechService.getInstance();
