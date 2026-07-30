import { TestBed } from '@angular/core/testing';
import {
  J_SPEECH_RECOGNITION_FACTORY,
  JSpeechRecognitionLike,
  JSpeechRecognitionService,
} from './speech-recognition.service';

class FakeRecognition implements JSpeechRecognitionLike {
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: JSpeechRecognitionLike['onresult'] = null;
  onerror: JSpeechRecognitionLike['onerror'] = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();
}

describe('JSpeechRecognitionService', () => {
  let instances: FakeRecognition[];
  let service: JSpeechRecognitionService;

  beforeEach(() => {
    instances = [];
    TestBed.configureTestingModule({
      providers: [
        JSpeechRecognitionService,
        {
          provide: J_SPEECH_RECOGNITION_FACTORY,
          useValue: () => {
            const instance = new FakeRecognition();
            instances.push(instance);
            return instance;
          },
        },
      ],
    });
    service = TestBed.inject(JSpeechRecognitionService);
    instances.length = 0;
  });

  it('starts only after an explicit method call and applies options', () => {
    expect(instances).toHaveLength(0);
    expect(service.start({ language: 'en-IN', continuous: true })).toBe(true);
    expect(instances[0].lang).toBe('en-IN');
    expect(instances[0].continuous).toBe(true);
    expect(service.state()).toBe('listening');
    expect(service.start()).toBe(false);
  });

  it('collects interim and final transcripts', () => {
    service.start();
    instances[0].onresult?.({
      resultIndex: 0,
      results: [
        { isFinal: false, 0: { transcript: 'draft' } },
        { isFinal: true, 0: { transcript: 'final' } },
      ],
    });
    expect(service.interimTranscript()).toBe('draft');
    expect(service.finalTranscript()).toBe('final');
  });

  it.each([
    ['not-allowed', 'permission-denied', 'permission-denied'],
    ['no-speech', 'no-speech', 'error'],
    ['network', 'network', 'error'],
    ['audio-capture', 'device', 'error'],
  ] as const)('maps %s errors', (browserError, error, state) => {
    service.start();
    instances[0].onerror?.({ error: browserError });
    expect(service.error()).toBe(error);
    expect(service.state()).toBe(state);
  });

  it('stops, cancels, restarts, resets, and cleans callbacks', () => {
    service.start();
    const first = instances[0];
    service.stop();
    expect(first.stop).toHaveBeenCalled();
    expect(service.state()).toBe('idle');

    service.start();
    service.cancel();
    expect(service.state()).toBe('idle');

    service.start();
    expect(service.restart({ language: 'fr-FR' })).toBe(true);
    instances.at(-1)?.onend?.();
    service.resetTranscript();
    expect(service.finalTranscript()).toBe('');
    expect(() => service.destroy()).not.toThrow();
  });

  it('provides a safe unsupported fallback', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        JSpeechRecognitionService,
        { provide: J_SPEECH_RECOGNITION_FACTORY, useValue: () => null },
      ],
    });
    const unsupported = TestBed.inject(JSpeechRecognitionService);
    expect(unsupported.supported()).toBe(false);
    expect(unsupported.start()).toBe(false);
    expect(unsupported.state()).toBe('unsupported');
  });
});
