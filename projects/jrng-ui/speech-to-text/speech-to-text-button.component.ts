import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JSpeechRecognitionService } from './speech-recognition.service';
import { JSpeechToTextDirective } from './speech-to-text.directive';

@Component({
  selector: 'j-speech-to-text-button',
  imports: [JButtonComponent],
  template: `
    <j-button
      [label]="showLabel() ? label() : ''"
      [icon]="service.state() === 'listening' ? stopIcon() : icon()"
      [actionDisplay]="showLabel() ? 'icon-label' : 'icon'"
      [ariaLabel]="accessibleLabel()"
      [severity]="
        service.state() === 'error' || service.state() === 'permission-denied'
          ? 'danger'
          : 'primary'
      "
      [variant]="variant()"
      [disabled]="disabled() || !service.supported()"
      [ariaPressed]="service.state() === 'listening'"
      (onClick)="toggle()"
    />
    <span
      class="j-speech-to-text-button__status"
      [class.is-visible]="
        service.state() === 'error' ||
        service.state() === 'permission-denied' ||
        service.state() === 'unsupported'
      "
      aria-live="polite"
      >{{ statusText() }}</span
    >
  `,
  styleUrl: './speech-to-text-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-speech-to-text-button',
    'data-jc-name': 'speech-to-text-button',
    'data-jc-section': 'root',
    'data-jc-extend': 'button status',
  },
})
export class JSpeechToTextButtonComponent {
  readonly service = inject(JSpeechRecognitionService);
  readonly target = input<JSpeechToTextDirective | null>(null);
  readonly label = input('Dictate');
  readonly showLabel = input(false, { transform: booleanAttribute });
  readonly icon = input('mic');
  readonly stopIcon = input('square');
  readonly variant = input<'solid' | 'outlined' | 'soft' | 'text' | 'link'>('soft');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly started = output<void>();
  readonly stopped = output<void>();

  toggle(): void {
    if (this.service.state() === 'listening') {
      const target = this.target();
      if (target) target.stop();
      else this.service.stop();
      this.stopped.emit();
      return;
    }
    const started = this.target()?.start() ?? this.service.start();
    if (started) this.started.emit();
  }

  accessibleLabel(): string {
    return this.service.state() === 'listening' ? 'Stop dictation' : this.label();
  }

  statusText(): string {
    const state = this.service.state();
    if (state === 'unsupported') return 'Speech recognition is not supported in this browser';
    if (state === 'permission-denied') return 'Microphone permission was denied';
    if (state === 'error') return `Speech recognition error: ${this.service.error() ?? 'unknown'}`;
    if (state === 'listening') {
      return this.service.interimTranscript()
        ? `Listening: ${this.service.interimTranscript()}`
        : 'Listening';
    }
    return 'Dictation stopped';
  }
}
