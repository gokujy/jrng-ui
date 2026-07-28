import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JConfirmPopupComponent } from './confirm-popup.component';

describe('JConfirmPopupComponent', () => {
  const metadata = reflectComponentType(JConfirmPopupComponent);
  let fixture: ComponentFixture<JConfirmPopupComponent>;
  let service: JConfirmationService;
  let target: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JConfirmPopupComponent] });
    fixture = TestBed.createComponent(JConfirmPopupComponent);
    service = TestBed.inject(JConfirmationService);
    target = document.createElement('button');
    document.body.append(target);
  });

  afterEach(() => {
    service.close();
    fixture.destroy();
    target.remove();
  });

  async function open(options: Parameters<JConfirmationService['confirm']>[0] = {}): Promise<void> {
    service.confirm({ target, header: 'Confirm action', message: 'Continue?', ...options });
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-confirm-popup');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('names and describes the alertdialog with unique referenced content', async () => {
    await open();
    const panel = fixture.debugElement.query(By.css('[role="alertdialog"]'))
      .nativeElement as HTMLElement;
    expect(document.getElementById(panel.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      'Confirm action',
    );
    expect(
      document.getElementById(panel.getAttribute('aria-describedby') ?? '')?.textContent?.trim(),
    ).toBe('Continue?');
  });

  it('honors popup Escape and outside-dismiss policies', async () => {
    await open({ closeOnEscape: false, closeOnOverlayClick: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(service.confirmation()).not.toBeNull();

    const popover = fixture.debugElement.query(By.directive(JPopoverComponent))
      .componentInstance as JPopoverComponent;
    popover.handleOutside();
    fixture.detectChanges();
    expect(service.confirmation()).not.toBeNull();
  });

  it('does not accept when Enter originates from the reject control', async () => {
    let accepted = 0;
    let rejected = 0;
    await open({
      confirmText: 'Proceed',
      cancelText: 'Stay',
      accept: () => accepted++,
      reject: () => rejected++,
    });
    const buttons = fixture.debugElement
      .queryAll(By.css('button'))
      .map((button) => button.nativeElement as HTMLButtonElement);
    const reject = buttons.find((button) => button.textContent?.includes('Stay'))!;
    expect(buttons.some((button) => button.textContent?.includes('Proceed'))).toBe(true);

    reject.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    expect(accepted).toBe(0);
    reject.click();
    fixture.detectChanges();
    expect(rejected).toBe(1);
    expect(accepted).toBe(0);
  });
});
