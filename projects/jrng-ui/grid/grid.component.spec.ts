import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JGridColumnComponent } from './grid-column.component';
import { JGridRowComponent } from './grid-row.component';
import { JGridComponent } from './grid.component';

@Component({
  imports: [JGridComponent, JGridRowComponent, JGridColumnComponent],
  template: `
    <j-grid fixed [columns]="12" gap="lg" rowGap="xl" styleClass="workspace-grid">
      <j-row justify="between" align="center" columnGap="md">
        <j-col size="12" md="8" [offsetLg]="1" order="last" orderMd="first">
          <article>Primary content</article>
        </j-col>
        <j-col size="auto"><aside>Actions</aside></j-col>
      </j-row>
    </j-grid>
  `,
})
class GridHostComponent {}

describe('responsive grid', () => {
  let fixture: ComponentFixture<GridHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GridHostComponent] });
    fixture = TestBed.createComponent(GridHostComponent);
    fixture.detectChanges();
  });

  it('renders a fixed 12-track grid without adding table semantics', () => {
    const grid = fixture.nativeElement.querySelector('j-grid') as HTMLElement;

    expect(grid.classList.contains('j-grid')).toBe(true);
    expect(grid.classList.contains('j-grid--fixed')).toBe(true);
    expect(grid.classList.contains('workspace-grid')).toBe(true);
    expect(grid.style.getPropertyValue('--j-grid-column-count')).toBe('12');
    expect(grid.getAttribute('role')).toBeNull();
  });

  it('maps row alignment, justification, and gutter inputs to layout properties', () => {
    const row = fixture.nativeElement.querySelector('j-row') as HTMLElement;

    expect(row.style.getPropertyValue('--j-row-align')).toBe('center');
    expect(row.style.getPropertyValue('--j-row-justify')).toBe('space-between');
    expect(row.style.getPropertyValue('--j-row-column-gap')).toBe('var(--j-spacing-md)');
  });

  it('maps responsive spans, offsets, and order while preserving projected content', () => {
    const [primary, actions] = fixture.nativeElement.querySelectorAll(
      'j-col',
    ) as NodeListOf<HTMLElement>;

    expect(primary.style.getPropertyValue('--j-col-width')).toContain('12');
    expect(primary.style.getPropertyValue('--j-col-md-width')).toContain('8');
    expect(primary.style.getPropertyValue('--j-col-lg-offset')).toContain('1');
    expect(primary.style.getPropertyValue('--j-col-order')).toBe('13');
    expect(primary.style.getPropertyValue('--j-col-md-order')).toBe('-1');
    expect(primary.textContent).toContain('Primary content');
    expect(actions.style.getPropertyValue('--j-col-width')).toBe('auto');
  });
});
