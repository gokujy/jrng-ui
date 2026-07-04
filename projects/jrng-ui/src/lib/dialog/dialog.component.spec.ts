import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JrDialogComponent } from './dialog.component';

@Component({
  imports: [JrDialogComponent],
  template: `
    <button id="before-dialog" type="button">Before</button>
    <j-dialog
      header="Confirm"
      [visible]="open"
      [dismissableMask]="closeOnBackdrop"
      [closeOnEscape]="closeOnEscape"
      (visibleChange)="open = $event"
      (closed)="lastReason = $event"
    >
      Delete record?
      <button jDialogFooter>Confirm</button>
    </j-dialog>
  `,
})
class DialogHostComponent {
  open = false;
  closeOnBackdrop = true;
  closeOnEscape = true;
  lastReason = '';
}

describe('JrDialogComponent', () => {
  let fixture: ComponentFixture<DialogHostComponent>;
  let host: DialogHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('opens when bound open is true', () => {
    host.open = true;
    detectHostChanges();

    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Delete record?');
  });

  it('closes from close button', () => {
    host.open = true;
    detectHostChanges();

    const close = fixture.debugElement.query(By.css('.j-dialog__close'))
      .nativeElement as HTMLButtonElement;
    close.click();
    detectHostChanges();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('close-button');
  });

  it('closes on escape when enabled', async () => {
    const before = fixture.debugElement.query(By.css('#before-dialog')).nativeElement as HTMLButtonElement;
    before.focus();
    host.open = true;
    detectHostChanges();
    await Promise.resolve();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]')).nativeElement as HTMLElement;
    const close = fixture.debugElement.query(By.css('.j-dialog__close')).nativeElement as HTMLButtonElement;
    const labelledBy = dialog.getAttribute('aria-labelledby');

    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy || '')?.textContent).toContain('Confirm');
    expect(document.activeElement).toBe(close);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    detectHostChanges();
    await Promise.resolve();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('escape');
    expect(document.activeElement).toBe(before);
  });

  it('does not close on escape when disabled', () => {
    host.open = true;
    host.closeOnEscape = false;
    detectHostChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    detectHostChanges();

    expect(host.open).toBe(true);
  });

  it('closes on backdrop click only when enabled', () => {
    host.open = true;
    host.closeOnBackdrop = true;
    detectHostChanges();

    const backdrop = fixture.debugElement.query(By.css('.j-dialog__backdrop'))
      .nativeElement as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    detectHostChanges();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('backdrop');
  });
});
