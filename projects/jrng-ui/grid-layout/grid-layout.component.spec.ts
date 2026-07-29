import { Component, reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  JGridLayoutChange,
  JGridLayoutComponent,
  JGridLayoutItem,
  JGridLayoutItemTemplateDirective,
} from './grid-layout.component';

@Component({
  imports: [JGridLayoutComponent, JGridLayoutItemTemplateDirective],
  template: `
    <j-grid-layout
      [columns]="4"
      [rowHeight]="80"
      draggable
      resizable
      compact
      [(layout)]="layout"
      [responsiveLayouts]="responsive"
      [persistence]="persist"
      (layoutChangeEvent)="changes.push($event)"
    >
      <ng-template jGridLayoutItem let-data>{{ data }}</ng-template>
    </j-grid-layout>
  `,
})
class GridLayoutHostComponent {
  layout: readonly JGridLayoutItem[] = [
    { id: 'a', data: 'Revenue', column: 1, row: 1, columnSpan: 2, minColumnSpan: 1 },
    { id: 'b', data: 'Customers', column: 3, row: 1, locked: true },
  ];
  readonly responsive = {
    mobile: this.layout.map((item, index) => ({ ...item, column: 1, row: index + 1 })),
  };
  changes: JGridLayoutChange[] = [];
  persisted: readonly JGridLayoutItem[] = [];
  readonly persist = (layout: readonly JGridLayoutItem[]) => (this.persisted = layout);
}

describe('JGridLayoutComponent public contract', () => {
  const metadata = reflectComponentType(JGridLayoutComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-grid-layout');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('exposes the configured responsive column limit and minimum item width', () => {
    const fixture = TestBed.createComponent(JGridLayoutComponent);
    fixture.componentRef.setInput('columns', 4);
    fixture.componentRef.setInput('minItemWidth', '14rem');
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('.j-grid-layout') as HTMLElement;
    expect(grid.style.getPropertyValue('--j-grid-columns')).toBe('4');
    expect(grid.style.getPropertyValue('--j-grid-min')).toBe('14rem');
  });

  it('normalizes invalid column limits', () => {
    const fixture = TestBed.createComponent(JGridLayoutComponent);
    fixture.componentRef.setInput('columns', Number.NaN);
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('.j-grid-layout') as HTMLElement;
    expect(grid.style.getPropertyValue('--j-grid-columns')).toBe('1');
  });

  it('renders controlled spans, locked state, resize handles, and item templates', () => {
    const fixture = TestBed.createComponent(GridLayoutHostComponent);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.j-grid-layout__item');
    expect(items).toHaveLength(2);
    expect(items[0].style.gridColumnEnd).toBe('span 2');
    expect(items[0].textContent).toContain('Revenue');
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
    expect(items[0].querySelector('[aria-label="Resize tile"]')).toBeTruthy();
    expect(items[1].querySelector('[aria-label="Resize tile"]')).toBeNull();
  });

  it('supports keyboard movement, resizing, collision handling, and persistence', () => {
    const fixture = TestBed.createComponent(GridLayoutHostComponent);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as JGridLayoutComponent;
    component.moveItem('a', 1, 0);
    expect(component.layout()[0].column).toBe(2);
    component.resizeItem('a', 1, 1);
    expect(component.layout()[0].columnSpan).toBe(3);
    expect(component.layout()[0].rowSpan).toBe(2);
    expect(fixture.componentInstance.persisted).toEqual(component.layout());
    expect(fixture.componentInstance.changes.map((change) => change.reason)).toEqual([
      'move',
      'resize',
    ]);
  });

  it('applies responsive layouts and resets to the initial controlled layout', () => {
    const fixture = TestBed.createComponent(GridLayoutHostComponent);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as JGridLayoutComponent;
    expect(component.applyResponsiveLayout('mobile')).toBe(true);
    expect(component.layout().every((item) => item.column === 1)).toBe(true);
    component.reset();
    expect(component.layout()[1].column).toBe(3);
    expect(component.applyResponsiveLayout('missing')).toBe(false);
  });

  it('cancels pointer resize with Escape and restores layout', () => {
    const fixture = TestBed.createComponent(GridLayoutHostComponent);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0].componentInstance as JGridLayoutComponent;
    const original = component.layout();
    const handle = fixture.nativeElement.querySelector(
      '.j-grid-layout__resize-default',
    ) as HTMLButtonElement;
    handle.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      }),
    );
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(component.layout()).toEqual(original);
  });
});
