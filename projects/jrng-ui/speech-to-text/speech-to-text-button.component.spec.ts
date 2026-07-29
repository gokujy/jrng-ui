import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  J_SPEECH_RECOGNITION_FACTORY,
  JSpeechRecognitionLike,
  JSpeechRecognitionService,
} from './speech-recognition.service';
import { JSpeechToTextButtonComponent } from './speech-to-text-button.component';

class FakeRecognition implements JSpeechRecognitionLike {
  lang = '';
  continuous = false;
  interimResults = true;
  maxAlternatives = 1;
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
  imports: [JSpeechToTextButtonComponent],
  template: `<j-speech-to-text-button
    showLabel
    (started)="started = started + 1"
    (stopped)="stopped = stopped + 1"
  />`,
})
class SpeechButtonHostComponent {
  started = 0;
  stopped = 0;
}

describe('JSpeechToTextButtonComponent', () => {
  let fixture: ComponentFixture<SpeechButtonHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechButtonHostComponent],
      providers: [
        JSpeechRecognitionService,
        { provide: J_SPEECH_RECOGNITION_FACTORY, useValue: () => new FakeRecognition() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SpeechButtonHostComponent);
    fixture.detectChanges();
  });

  it('starts and stops from explicit button activation with live status', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.started).toBe(1);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.stopped).toBe(1);
    expect(fixture.nativeElement.querySelector('[aria-live]').textContent).toContain('stopped');
  });

  it('disables itself for unsupported browsers', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SpeechButtonHostComponent],
      providers: [
        JSpeechRecognitionService,
        { provide: J_SPEECH_RECOGNITION_FACTORY, useValue: () => null },
      ],
    }).compileComponents();
    const unsupported = TestBed.createComponent(SpeechButtonHostComponent);
    unsupported.detectChanges();
    expect(unsupported.nativeElement.querySelector('button').disabled).toBe(true);
    expect(unsupported.nativeElement.querySelector('[aria-live]').textContent).toContain(
      'not supported',
    );
  });
});
