import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JrDialogComponent } from './dialog.component';

@Component({
  imports: [JrDialogComponent],
  template: `
    <jr-dialog
      title="Confirm"
      [open]="open"
      [closeOnBackdrop]="closeOnBackdrop"
      [closeOnEscape]="closeOnEscape"
      (openChange)="open = $event"
      (jrClose)="lastReason = $event"
    >
      Delete record?
      <button jrDialogFooter>Confirm</button>
    </jr-dialog>
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

    const close = fixture.debugElement.query(By.css('.jr-dialog__close'))
      .nativeElement as HTMLButtonElement;
    close.click();
    detectHostChanges();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('close-button');
  });

  it('closes on escape when enabled', () => {
    host.open = true;
    detectHostChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    detectHostChanges();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('escape');
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

    const backdrop = fixture.debugElement.query(By.css('.jr-dialog__backdrop'))
      .nativeElement as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    detectHostChanges();

    expect(host.open).toBe(false);
    expect(host.lastReason).toBe('backdrop');
  });
});
