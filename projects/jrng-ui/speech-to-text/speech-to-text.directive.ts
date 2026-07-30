import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import {
  JSpeechRecognitionError,
  JSpeechRecognitionService,
  JSpeechRecognitionState,
} from './speech-recognition.service';

export type JSpeechInsertionMode = 'append' | 'replace';

@Directive({
  selector:
    'input[jSpeechToText], textarea[jSpeechToText], j-input[jSpeechToText], j-textarea[jSpeechToText], j-editor[jSpeechToText]',
  exportAs: 'jSpeechToText',
  host: {
    '[attr.data-j-speech-state]': 'service.state()',
    'data-jc-name': 'speech-to-text',
  },
})
export class JSpeechToTextDirective implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly service = inject(JSpeechRecognitionService);
  private committedLength = 0;

  readonly language = input('en-US');
  readonly continuous = input(false, { transform: booleanAttribute });
  readonly singleResult = input(false, { transform: booleanAttribute });
  readonly interim = input(true, { transform: booleanAttribute });
  readonly mode = input<JSpeechInsertionMode>('append');
  readonly separator = input(' ');
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly listeningChange = output<boolean>();
  readonly interimTranscript = output<string>();
  readonly finalTranscript = output<string>();
  readonly stateChange = output<JSpeechRecognitionState>();
  readonly speechError = output<JSpeechRecognitionError>();

  constructor() {
    effect(() => {
      const state = this.service.state();
      this.stateChange.emit(state);
      this.listeningChange.emit(state === 'listening');
    });
    effect(() => {
      const value = this.service.interimTranscript();
      this.interimTranscript.emit(value);
    });
    effect(() => {
      const complete = this.service.finalTranscript();
      const next = complete.slice(this.committedLength);
      if (!next) return;
      this.committedLength = complete.length;
      this.insert(next);
      this.finalTranscript.emit(next);
    });
    effect(() => {
      const error = this.service.error();
      if (error) this.speechError.emit(error);
    });
  }

  start(): boolean {
    if (this.disabled()) return false;
    this.committedLength = this.service.finalTranscript().length;
    return this.service.start({
      language: this.language(),
      continuous: this.continuous(),
      interimResults: this.interim(),
      singleResult: this.singleResult(),
    });
  }

  stop(): void {
    this.service.stop();
  }

  cancel(): void {
    this.service.cancel();
  }

  restart(): boolean {
    if (this.disabled()) return false;
    return this.service.restart({
      language: this.language(),
      continuous: this.continuous(),
      interimResults: this.interim(),
      singleResult: this.singleResult(),
    });
  }

  ngOnDestroy(): void {
    this.service.cancel();
  }

  private insert(transcript: string): void {
    const target = this.findEditable();
    if (!target) return;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? start;
      const prefix = this.mode() === 'replace' ? '' : target.value.slice(0, start);
      const suffix = this.mode() === 'replace' ? '' : target.value.slice(end);
      const joiner = prefix && !/\s$/.test(prefix) ? this.separator() : '';
      target.value = `${prefix}${joiner}${transcript}${suffix}`;
      const caret = prefix.length + joiner.length + transcript.length;
      target.setSelectionRange(caret, caret);
    } else {
      target.textContent =
        this.mode() === 'replace'
          ? transcript
          : `${target.textContent ?? ''}${target.textContent ? this.separator() : ''}${transcript}`;
    }
    target.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private findEditable(): HTMLInputElement | HTMLTextAreaElement | HTMLElement | null {
    if (this.host instanceof HTMLInputElement || this.host instanceof HTMLTextAreaElement) {
      return this.host;
    }
    return this.host.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLElement>(
      'input, textarea, [contenteditable="true"]',
    );
  }
}
