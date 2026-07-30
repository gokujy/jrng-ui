import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JButtonSeverity, JButtonSize, JButtonVariant, JButtonComponent } from './button.component';

@Component({
  imports: [JButtonComponent],
  template: `
    <j-button
      [severity]="severity"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      icon="S"
      (onClick)="presses = presses + 1"
    >
      Save
    </j-button>
  `,
})
class ButtonHostComponent {
  severity: JButtonSeverity = 'primary';
  size: JButtonSize = 'md';
  disabled = false;
  loading = false;
  presses = 0;
}

describe('JButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function button(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
  }

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('renders variant and size classes', () => {
    host.severity = 'danger';
    host.size = 'lg';
    detectHostChanges();

    expect(button().classList).toContain('j-button--danger');
    expect(button().classList).toContain('j-button--lg');
  });

  it('emits onClick when enabled', () => {
    button().click();

    expect(host.presses).toBe(1);
  });

  it('prevents presses while disabled', () => {
    host.disabled = true;
    detectHostChanges();

    button().click();

    expect(button().disabled).toBe(true);
    expect(host.presses).toBe(0);
  });

  it('prevents presses and marks busy while loading', () => {
    host.loading = true;
    detectHostChanges();

    button().click();

    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(host.presses).toBe(0);
  });

  it('supports icon labels', () => {
    expect(button().textContent).toContain('S');
  });

  it('applies ripple utility to the native button', () => {
    expect(button().classList).toContain('j-ripple');
  });

  it('renders every visual variant', () => {
    const variants: JButtonVariant[] = ['solid', 'outlined', 'soft', 'link', 'text'];
    for (const variant of variants) {
      const direct = TestBed.createComponent(JButtonComponent);
      direct.componentRef.setInput('variant', variant);
      direct.detectChanges();
      expect(direct.nativeElement.querySelector('button').classList).toContain(
        `j-button--${variant}`,
      );
    }
  });

  it('uses button as the safe native type and forwards submit or reset', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    direct.detectChanges();
    expect(direct.nativeElement.querySelector('button').type).toBe('button');
    direct.componentRef.setInput('type', 'submit');
    direct.detectChanges();
    expect(direct.nativeElement.querySelector('button').type).toBe('submit');
  });

  it('renders pill, full-width, icon-only, and badge presentation', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    direct.componentRef.setInput('shape', 'pill');
    direct.componentRef.setInput('width', 'full');
    direct.componentRef.setInput('actionDisplay', 'icon');
    direct.componentRef.setInput('icon', 'S');
    direct.componentRef.setInput('ariaLabel', 'Save record');
    direct.componentRef.setInput('badge', 4);
    direct.detectChanges();
    const native = direct.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(native.classList).toContain('j-button--shape-pill');
    expect(native.classList).toContain('j-button--full');
    expect(native.classList).toContain('j-button--icon-only');
    expect(native.getAttribute('aria-label')).toBe('Save record');
    expect(native.querySelector('.j-button__badge')?.textContent?.trim()).toBe('4');
  });

  it('provides loading text and suppresses click output while busy', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    let clicks = 0;
    direct.componentInstance.onClick.subscribe(() => clicks++);
    direct.componentRef.setInput('label', 'Save');
    direct.componentRef.setInput('loading', true);
    direct.componentRef.setInput('loadingLabel', 'Saving record');
    direct.detectChanges();
    const native = direct.nativeElement.querySelector('button') as HTMLButtonElement;
    native.click();
    expect(clicks).toBe(0);
    expect(native.textContent).toContain('Saving record');
  });

  it('forwards expanded state and controlled content for disclosure actions', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    direct.componentRef.setInput('ariaExpanded', true);
    direct.componentRef.setInput('ariaControls', 'details-panel');
    direct.detectChanges();
    const native = direct.nativeElement.querySelector('button');
    expect(native.getAttribute('aria-expanded')).toBe('true');
    expect(native.getAttribute('aria-controls')).toBe('details-panel');
  });

  it('clamps determinate progress and exposes accessible progress semantics', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    direct.componentRef.setInput('label', 'Upload customers');
    direct.componentRef.setInput('progress', 140);
    direct.componentRef.setInput('progressLabel', true);
    direct.componentRef.setInput('progressState', 'running');
    direct.detectChanges();
    const native = direct.nativeElement.querySelector('button') as HTMLButtonElement;
    const progress = native.querySelector('[role="progressbar"]');
    expect(progress?.getAttribute('aria-valuenow')).toBe('100');
    expect(progress?.getAttribute('aria-valuetext')).toBe('100%');
    expect(native.querySelector('.j-button__progress-fill')?.getAttribute('style')).toContain(
      '100%',
    );
    expect(native.textContent).toContain('100%');
    expect(native.disabled).toBe(true);
  });

  it('emits cancel instead of onClick for a cancelable running action', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    let clicks = 0;
    let cancellations = 0;
    direct.componentInstance.onClick.subscribe(() => clicks++);
    direct.componentInstance.cancel.subscribe(() => cancellations++);
    direct.componentRef.setInput('progress', 42);
    direct.componentRef.setInput('progressState', 'running');
    direct.componentRef.setInput('cancelable', true);
    direct.detectChanges();
    (direct.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(clicks).toBe(0);
    expect(cancellations).toBe(1);
  });

  it('applies success, error, and cancelled progress appearance without loading', () => {
    const direct = TestBed.createComponent(JButtonComponent);
    for (const state of ['success', 'error', 'cancelled'] as const) {
      direct.componentRef.setInput('progressState', state);
      direct.componentRef.setInput('progress', 100);
      direct.detectChanges();
      const native = direct.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(native.classList).toContain(`j-button--progress-${state}`);
      expect(native.getAttribute('aria-busy')).toBe('false');
    }
  });
});
