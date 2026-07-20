import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { JChipComponent } from './chip.component';

describe('JChipComponent', () => {
  it('renders the label', () => {
    const fixture = TestBed.createComponent(JChipComponent);
    fixture.componentRef.setInput('label', 'Angular');
    fixture.detectChanges();

    const label: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-jc-section="label"]',
    );
    expect(label).not.toBeNull();
    expect(label?.textContent?.trim()).toBe('Angular');
  });

  it('hides the remove control by default', () => {
    const fixture = TestBed.createComponent(JChipComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-jc-section="remove"]')).toBeNull();
  });

  it('shows the remove control only when removable', () => {
    const fixture = TestBed.createComponent(JChipComponent);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-jc-section="remove"]')).not.toBeNull();
  });

  it('emits remove when the remove button is clicked', () => {
    const fixture = TestBed.createComponent(JChipComponent);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.remove.subscribe(() => (emitted = true));

    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-jc-section="remove"] button',
    );
    removeButton.click();

    expect(emitted).toBe(true);
  });
});
