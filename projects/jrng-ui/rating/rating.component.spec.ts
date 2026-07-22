import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JRatingComponent } from './rating.component';

describe('JRatingComponent', () => {
  let fixture: ComponentFixture<JRatingComponent>;
  let component: JRatingComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(JRatingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('step', 0.5);
    fixture.detectChanges();
  });

  it('preserves fractional form values and exposes accessible value text', () => {
    component.writeValue(2.5);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    expect(component.value).toBe(2.5);
    expect(component.fillPercent(3)).toBe(50);
    expect(root.getAttribute('aria-valuenow')).toBe('2.5');
    expect(root.getAttribute('aria-valuetext')).toBe('2.5 of 5');
  });

  it('rounds pointer selection to the configured step', () => {
    const changes: number[] = [];
    component.registerOnChange((value) => changes.push(value));
    const button = fixture.nativeElement.querySelectorAll('.j-rating__star')[2] as HTMLElement;
    button.getBoundingClientRect = () => ({ left: 0, width: 20 }) as DOMRect;

    component.selectAt(3, {
      currentTarget: button,
      clientX: 9,
      preventDefault: () => undefined,
    } as unknown as PointerEvent);

    expect(component.value).toBe(2.5);
    expect(changes).toEqual([2.5]);
  });

  it('changes fractional values with arrow keys', () => {
    component.writeValue(1.5);
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.value).toBe(2);
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(component.value).toBe(1.5);
  });

  it('blocks pointer and keyboard updates while disabled', () => {
    component.writeValue(3.5);
    component.setDisabledState(true);
    component.setValue(1);
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    expect(component.value).toBe(3.5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="slider"]').getAttribute('tabindex')).toBe(
      '-1',
    );
  });
});
