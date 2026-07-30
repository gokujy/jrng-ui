import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JAffixDirective } from './affix.directive';

@Component({
  imports: [JAffixDirective],
  template: `
    <div
      [jAffix]="position()"
      [offset]="8"
      [disabled]="disabled()"
      (affixedChange)="states.push($event)"
    >
      Customer filters
    </div>
  `,
})
class AffixHostComponent {
  readonly disabled = signal(false);
  readonly position = signal<'top' | 'bottom'>('top');
  states: boolean[] = [];
}

describe('JAffixDirective', () => {
  let fixture: ComponentFixture<AffixHostComponent>;
  let directive: JAffixDirective;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(AffixHostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector('.j-affix');
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: -10,
      bottom: 30,
      left: 20,
      right: 220,
      width: 200,
      height: 40,
      x: 20,
      y: -10,
      toJSON: () => ({}),
    });
    directive = fixture.debugElement
      .query(By.directive(JAffixDirective))
      .injector.get(JAffixDirective);
  });

  it('affixes at the configured top offset and preserves layout', () => {
    directive.recalculate();
    expect(directive.affixed()).toBe(true);
    expect(element.style.position).toBe('fixed');
    expect(element.style.insetBlockStart).toBe('8px');
    expect(fixture.componentInstance.states).toContain(true);
    expect(element.previousElementSibling?.classList).toContain('j-affix__placeholder');
  });

  it('restores styles when disabled', () => {
    directive.recalculate();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    directive.recalculate();
    expect(directive.affixed()).toBe(false);
    expect(element.style.position).toBe('');
  });

  it('supports bottom positioning', () => {
    fixture.componentInstance.position.set('bottom');
    fixture.detectChanges();
    vi.mocked(element.getBoundingClientRect).mockReturnValue({
      top: window.innerHeight - 20,
      bottom: window.innerHeight + 20,
      left: 20,
      right: 220,
      width: 200,
      height: 40,
      x: 20,
      y: window.innerHeight - 20,
      toJSON: () => ({}),
    });
    directive.recalculate();
    directive.recalculate();
    expect(element.style.position).toBe('fixed');
  });

  it('removes its placeholder and inline affix styles on destroy', () => {
    directive.recalculate();
    fixture.destroy();
    expect(document.querySelector('.j-affix__placeholder')).toBeNull();
    expect(element.style.position).toBe('');
  });
});
