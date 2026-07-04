import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JButtonSeverity, JButtonSize, JrButtonComponent } from './button.component';

@Component({
  imports: [JrButtonComponent],
  template: `
    <j-button
      [severity]="severity"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      icon="S"
      (clicked)="presses = presses + 1"
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
    host.severity = 'danger';
    host.size = 'lg';
    detectHostChanges();

    expect(button().classList).toContain('j-button--danger');
    expect(button().classList).toContain('j-button--lg');
  });

  it('emits clicked when enabled', () => {
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
});
