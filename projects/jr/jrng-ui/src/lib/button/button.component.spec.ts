import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JrButtonComponent, JrButtonSize, JrButtonVariant } from './button.component';

@Component({
  imports: [JrButtonComponent],
  template: `
    <jr-button
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      [fullWidth]="fullWidth"
      iconBefore="S"
      iconAfter="E"
      (jrPress)="presses = presses + 1"
    >
      Save
    </jr-button>
  `,
})
class ButtonHostComponent {
  variant: JrButtonVariant = 'primary';
  size: JrButtonSize = 'md';
  disabled = false;
  loading = false;
  fullWidth = false;
  presses = 0;
}

describe('JrButtonComponent', () => {
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
    host.variant = 'danger';
    host.size = 'lg';
    detectHostChanges();

    expect(button().classList).toContain('jr-button--danger');
    expect(button().classList).toContain('jr-button--lg');
  });

  it('emits jrPress when enabled', () => {
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

  it('supports full width mode and icon labels', () => {
    host.fullWidth = true;
    detectHostChanges();

    expect(button().classList).toContain('jr-button--full');
    expect(button().textContent).toContain('S');
    expect(button().textContent).toContain('E');
  });
});
