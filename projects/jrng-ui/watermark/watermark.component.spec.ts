import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JWatermarkComponent } from './watermark.component';

@Component({
  imports: [JWatermarkComponent],
  template: `
    <j-watermark
      [text]="text()"
      [image]="image()"
      [opacity]="2"
      [width]="160"
      [height]="80"
      [horizontalGap]="40"
      [verticalGap]="20"
      [fullPage]="fullPage()"
    >
      <button type="button">Open customer</button>
    </j-watermark>
  `,
})
class WatermarkHostComponent {
  readonly text = signal<string | readonly string[]>(['CONFIDENTIAL', 'Aster Labs']);
  readonly image = signal('');
  readonly fullPage = signal(false);
}

describe('JWatermarkComponent', () => {
  let fixture: ComponentFixture<WatermarkHostComponent>;
  let layer: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(WatermarkHostComponent);
    fixture.detectChanges();
    layer = fixture.nativeElement.querySelector('.j-watermark__layer');
  });

  it('renders multiline text as a non-interactive repeating SVG watermark', () => {
    const decoded = decodeURIComponent(layer.style.backgroundImage);
    expect(decoded).toContain('CONFIDENTIAL');
    expect(decoded).toContain('Aster Labs');
    expect(decoded).toContain('fill-opacity="1"');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.style.backgroundSize).toBe('200px 100px');
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('updates dynamically and escapes text content', () => {
    fixture.componentInstance.text.set('<Customer & Co>');
    fixture.detectChanges();
    expect(decodeURIComponent(layer.style.backgroundImage)).toContain('&lt;Customer &amp; Co&gt;');
  });

  it('supports image mode', () => {
    fixture.componentInstance.image.set('/assets/customer-logo.svg');
    fixture.detectChanges();
    expect(decodeURIComponent(layer.style.backgroundImage)).toContain(
      '<image href="/assets/customer-logo.svg"',
    );
  });

  it('supports a full-page presentation without changing projected interaction', () => {
    fixture.componentInstance.fullPage.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-watermark').classList).toContain(
      'j-watermark--full-page',
    );
    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(
      false,
    );
  });
});
