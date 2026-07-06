import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JTagComponent } from './tag.component';

describe('JTagComponent', () => {
  it('renders the label text', () => {
    const fixture = TestBed.createComponent(JTagComponent);
    fixture.componentRef.setInput('label', 'Stable');
    fixture.detectChanges();

    const label: HTMLElement = fixture.nativeElement.querySelector('.j-tag__label');
    expect(label.textContent).toContain('Stable');
  });

  it('hides the remove control by default', () => {
    const fixture = TestBed.createComponent(JTagComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.j-tag__remove')).toBeNull();
  });

  it('shows a remove control only when removable is set', () => {
    const fixture = TestBed.createComponent(JTagComponent);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.j-tag__remove');
    expect(removeButton).not.toBeNull();
    expect(removeButton.getAttribute('aria-label')).toBe('Remove');
  });

  it('emits remove when the remove control is clicked', () => {
    const fixture = TestBed.createComponent(JTagComponent);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    let emitted = 0;
    fixture.componentInstance.remove.subscribe(() => (emitted += 1));

    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.j-tag__remove');
    removeButton.click();

    expect(emitted).toBe(1);
  });
});
