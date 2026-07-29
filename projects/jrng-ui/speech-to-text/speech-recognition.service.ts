import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, InjectionToken, PLATFORM_ID, signal } from '@angular/core';

export type JSpeechRecognitionState =
  'idle' | 'listening' | 'stopping' | 'permission-denied' | 'unsupported' | 'error';
export type JSpeechRecognitionError =
  'permission-denied' | 'no-speech' | 'network' | 'device' | 'aborted' | 'unknown';

export interface JSpeechRecognitionAlternativeLike {
  readonly transcript: string;
}

export interface JSpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: JSpeechRecognitionAlternativeLike;
}

export interface JSpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: ArrayLike<JSpeechRecognitionResultLike>;
}

export interface JSpeechRecognitionErrorEventLike {
  readonly error: string;
  readonly message?: string;
}

export interface JSpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: JSpeechRecognitionEventLike) => void) | null;
  onerror: ((event: JSpeechRecognitionErrorEventLike) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type JSpeechRecognitionFactory = () => JSpeechRecognitionLike | null;

export const J_SPEECH_RECOGNITION_FACTORY = new InjectionToken<JSpeechRecognitionFactory>(
  'J_SPEECH_RECOGNITION_FACTORY',
  {
    providedIn: 'root',
    factory: () => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) return () => null;
      return () => {
        const browser = window as typeof window & {
          SpeechRecognition?: new () => JSpeechRecognitionLike;
          webkitSpeechRecognition?: new () => JSpeechRecognitionLike;
        };
        const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
        return Constructor ? new Constructor() : null;
      };
    },
  },
);

export interface JSpeechRecognitionStartOptions {
  readonly language?: string;
  readonly continuous?: boolean;
  readonly interimResults?: boolean;
  readonly singleResult?: boolean;
}

@Injectable({ providedIn: 'root' })
export class JSpeechRecognitionService {
  private readonly factory = inject(J_SPEECH_RECOGNITION_FACTORY);
  private recognition: JSpeechRecognitionLike | null = null;
  private restartRequested = false;
  private session = 0;

  readonly state = signal<JSpeechRecognitionState>('idle');
  readonly interimTranscript = signal('');
  readonly finalTranscript = signal('');
  readonly error = signal<JSpeechRecognitionError | null>(null);
  readonly supported = signal(this.detectSupport());

  constructor() {
    if (!this.supported()) this.state.set('unsupported');
  }

  start(options: JSpeechRecognitionStartOptions = {}): boolean {
    if (this.state() === 'listening' || this.state() === 'stopping') return false;
    const recognition = this.factory();
    if (!recognition) {
      this.supported.set(false);
      this.state.set('unsupported');
      return false;
    }
    this.disposeRecognition();
    this.recognition = recognition;
    const session = ++this.session;
    recognition.lang = options.language || 'en-US';
    recognition.continuous = options.singleResult ? false : (options.continuous ?? false);
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (session !== this.session) return;
      this.error.set(null);
      this.state.set('listening');
    };
    recognition.onresult = (event) => {
      if (session === this.session) this.handleResult(event);
    };
    recognition.onerror = (event) => {
      if (session === this.session) this.handleError(event);
    };
    recognition.onend = () => {
      if (session !== this.session) return;
      const restart = this.restartRequested;
      this.restartRequested = false;
      this.disposeRecognition();
      if (!this.error()) this.state.set('idle');
      if (restart) this.start(options);
    };
    this.interimTranscript.set('');
    this.error.set(null);
    try {
      recognition.start();
      return true;
    } catch {
      this.handleError({ error: 'audio-capture' });
      return false;
    }
  }

  stop(): void {
    if (!this.recognition || this.state() !== 'listening') return;
    this.state.set('stopping');
    this.recognition.stop();
  }

  cancel(): void {
    this.restartRequested = false;
    this.session++;
    this.recognition?.abort();
    this.disposeRecognition();
    this.interimTranscript.set('');
    this.state.set('idle');
  }

  restart(options: JSpeechRecognitionStartOptions = {}): boolean {
    if (this.recognition) {
      this.restartRequested = true;
      this.recognition.abort();
      return true;
    }
    return this.start(options);
  }

  resetTranscript(): void {
    this.interimTranscript.set('');
    this.finalTranscript.set('');
  }

  destroy(): void {
    this.cancel();
  }

  private detectSupport(): boolean {
    const recognition = this.factory();
    if (!recognition) return false;
    recognition.abort();
    return true;
  }

  private handleResult(event: JSpeechRecognitionEventLike): void {
    let interim = '';
    let final = '';
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const result = event.results[index];
      if (result.isFinal) final += result[0]?.transcript ?? '';
      else interim += result[0]?.transcript ?? '';
    }
    if (final) this.finalTranscript.update((value) => `${value}${final}`);
    this.interimTranscript.set(interim);
  }

  private handleError(event: JSpeechRecognitionErrorEventLike): void {
    const error = this.mapError(event.error);
    this.error.set(error);
    this.state.set(error === 'permission-denied' ? 'permission-denied' : 'error');
  }

  private mapError(error: string): JSpeechRecognitionError {
    if (error === 'not-allowed' || error === 'service-not-allowed') return 'permission-denied';
    if (error === 'no-speech') return 'no-speech';
    if (error === 'network') return 'network';
    if (error === 'audio-capture') return 'device';
    if (error === 'aborted') return 'aborted';
    return 'unknown';
  }

  private disposeRecognition(): void {
    if (!this.recognition) return;
    this.recognition.onstart = null;
    this.recognition.onend = null;
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition = null;
  }
}
