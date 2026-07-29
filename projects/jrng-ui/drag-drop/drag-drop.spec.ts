import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import {
  JDragDirective,
  JDragDropEvent,
  JDragHandleDirective,
  JDropListDirective,
} from './drag-drop';

@Component({
  imports: [JDragDirective, JDropListDirective, JDragHandleDirective],
  template: `
    <div jDropList [(data)]="customers" (dropped)="drops.push($event)">
      @for (customer of customers; track customer) {
        <div jDrag [data]="customer" [dragLabel]="customer">
          <button jDragHandle type="button">Move</button>{{ customer
          }}<button type="button" class="edit">Edit</button>
        </div>
      }
    </div>
  `,
})
class DragDropHostComponent {
  customers: unknown[] = ['Aster Labs', 'Northstar'];
  drops: JDragDropEvent[] = [];
}

describe('drag and drop directives', () => {
  it('supports accessible keyboard reordering and emits a drop event', async () => {
    const fixture = TestBed.createComponent(DragDropHostComponent);
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector('[jDrag]') as HTMLElement;
    first.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', ctrlKey: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.customers).toEqual(['Northstar', 'Aster Labs']);
    expect(fixture.componentInstance.drops[0].currentIndex).toBe(1);
    await Promise.resolve();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelectorAll('[jDrag]')[1]);
  });

  it('does not start pointer dragging from interactive controls', () => {
    const fixture = TestBed.createComponent(DragDropHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.edit') as HTMLButtonElement;
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse' }),
    );
    expect(button.closest('[jDrag]')?.classList.contains('j-drag--active')).toBe(false);
  });

  it('allows an explicitly marked interactive handle and cancels with Escape', () => {
    const fixture = TestBed.createComponent(DragDropHostComponent);
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('[jDragHandle]') as HTMLButtonElement;
    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      pointerType: 'mouse',
      clientX: 10,
      clientY: 10,
    });
    const move = new PointerEvent('pointermove', {
      bubbles: true,
      pointerType: 'mouse',
      clientX: 30,
      clientY: 10,
    });
    Object.defineProperty(down, 'pointerId', { value: 2 });
    Object.defineProperty(down, 'button', { value: 0 });
    Object.defineProperty(move, 'pointerId', { value: 2 });
    const directive = fixture.debugElement
      .query(By.directive(JDragDirective))
      .injector.get(JDragDirective);
    Object.defineProperty(down, 'target', { value: handle });
    directive.handlePointerDown(down);
    document.dispatchEvent(move);
    expect(directive.active).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    expect(directive.active).toBe(false);
  });
});
