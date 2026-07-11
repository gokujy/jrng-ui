import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JConfirmDialogComponent } from './confirm-dialog.component';
import { JConfirmationService } from './confirmation.service';

describe('JConfirmDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JConfirmDialogComponent] }).compileComponents();
  });

  it('labels the alert dialog, focuses the accept action, traps focus, and restores focus', async () => {
    const before = document.createElement('button');
    document.body.append(before);
    before.focus();
    const fixture = TestBed.createComponent(JConfirmDialogComponent);
    const service = TestBed.inject(JConfirmationService);
    service.confirm({ title: 'Remove product?', message: 'This cannot be undone.' });
    fixture.detectChanges();
    await Promise.resolve();

    const panel = fixture.debugElement.query(By.css('[role="alertdialog"]')).nativeElement as HTMLElement;
    const buttons = fixture.debugElement.queryAll(By.css('.j-confirm-dialog__button'));
    const cancel = buttons[0].nativeElement as HTMLButtonElement;
    const accept = buttons[1].nativeElement as HTMLButtonElement;
    expect(document.getElementById(panel.getAttribute('aria-labelledby') ?? '')?.textContent).toContain('Remove product?');
    expect(document.getElementById(panel.getAttribute('aria-describedby') ?? '')?.textContent).toContain('cannot be undone');
    expect(document.activeElement).toBe(accept);
    accept.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(cancel);

    service.close();
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(before);
    expect(document.body.style.overflow).toBe('');
    before.remove();
  });

  it('honors Escape and overlay close policies', () => {
    const fixture = TestBed.createComponent(JConfirmDialogComponent);
    const service = TestBed.inject(JConfirmationService);
    service.confirm({ message: 'Continue?', closeOnEscape: false, closeOnOverlayClick: false });
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const backdrop = fixture.debugElement.query(By.css('.j-confirm-dialog__backdrop')).nativeElement as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(service.confirmation()).not.toBeNull();

    service.close();
    fixture.detectChanges();
  });
});
