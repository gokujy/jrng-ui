import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  J_SPEECH_RECOGNITION_FACTORY,
  JSpeechRecognitionLike,
  JSpeechRecognitionService,
} from './speech-recognition.service';
import { JSpeechToTextDirective } from './speech-to-text.directive';

class FakeRecognition implements JSpeechRecognitionLike {
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: JSpeechRecognitionLike['onresult'] = null;
  onerror: JSpeechRecognitionLike['onerror'] = null;
  start(): void {
    this.onstart?.();
  }
  stop(): void {
    this.onend?.();
  }
  abort = vi.fn();
}

@Component({
  imports: [JSpeechToTextDirective],
  template: `
    <textarea
      jSpeechToText
      #speech="jSpeechToText"
      language="en-IN"
      [continuous]="true"
      (input)="value = $any($event.target).value"
    >
Hello</textarea>
  `,
})
class SpeechHostComponent {
  value = '';
}

describe('JSpeechToTextDirective', () => {
  let fixture: ComponentFixture<SpeechHostComponent>;
  let recognition: FakeRecognition;
  let directive: JSpeechToTextDirective;

  beforeEach(async () => {
    recognition = new FakeRecognition();
    await TestBed.configureTestingModule({
      imports: [SpeechHostComponent],
      providers: [
        JSpeechRecognitionService,
        { provide: J_SPEECH_RECOGNITION_FACTORY, useValue: () => recognition },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SpeechHostComponent);
    fixture.detectChanges();
    directive = fixture.debugElement.children[0].injector.get(JSpeechToTextDirective);
  });

  it('starts with configuration and inserts final transcript at the caret', () => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.setSelectionRange(5, 5);
    expect(directive.start()).toBe(true);
    expect(recognition.lang).toBe('en-IN');
    expect(recognition.continuous).toBe(true);
    recognition.onresult?.({
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: ' customer' } }],
    });
    fixture.detectChanges();
    expect(textarea.value).toContain('customer');
    expect(fixture.componentInstance.value).toContain('customer');
  });

  it('stops, cancels, restarts, and cleans up', () => {
    directive.start();
    directive.stop();
    expect(directive.service.state()).toBe('idle');
    directive.start();
    directive.cancel();
    expect(directive.service.state()).toBe('idle');
    expect(directive.restart()).toBe(true);
    expect(() => fixture.destroy()).not.toThrow();
  });
});
