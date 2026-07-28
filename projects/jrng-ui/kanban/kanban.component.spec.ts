import { Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JKanbanColumn, JKanbanComponent, JKanbanMoveEvent } from './kanban.component';

@Component({
  imports: [JKanbanComponent],
  template: `<j-kanban [value]="columns" (reorder)="move = $event" />`,
})
class KanbanHostComponent {
  columns: readonly JKanbanColumn[] = [
    {
      id: 'todo',
      title: 'To do',
      cards: [
        { id: 'one', title: 'One' },
        { id: 'two', title: 'Two' },
      ],
    },
    { id: 'done', title: 'Done', cards: [] },
  ];
  move: JKanbanMoveEvent | null = null;
}

describe('JKanbanComponent', () => {
  const metadata = reflectComponentType(JKanbanComponent);
  let fixture: ComponentFixture<KanbanHostComponent>;
  let host: KanbanHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KanbanHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(KanbanHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function cards(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('.j-kanban__card'))
      .map((card) => card.nativeElement as HTMLElement);
  }

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-kanban');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('exposes cards as named keyboard-reorderable groups', () => {
    expect(cards()[0]?.tabIndex).toBe(0);
    expect(cards()[0]?.getAttribute('role')).toBe('group');
    expect(cards()[0]?.getAttribute('aria-label')).toBe('One, column To do');
    expect(cards()[0]?.getAttribute('aria-keyshortcuts')).toContain('Alt+ArrowRight');
  });

  it('reorders within a column with Alt+ArrowDown', () => {
    cards()[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );
    expect(host.move?.fromIndex).toBe(0);
    expect(host.move?.toIndex).toBe(1);
    expect(host.move?.columns[0]?.cards.map((card) => card.id)).toEqual(['two', 'one']);
  });

  it('moves a card across columns with Alt+ArrowRight', () => {
    cards()[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }),
    );
    expect(host.move?.fromColumn.id).toBe('todo');
    expect(host.move?.toColumn.id).toBe('done');
    expect(host.move?.columns[0]?.cards.map((card) => card.id)).toEqual(['two']);
    expect(host.move?.columns[1]?.cards.map((card) => card.id)).toEqual(['one']);
  });

  it('does not treat nested control keyboard events as card reordering', () => {
    const remove = fixture.debugElement.query(By.css('.j-kanban__remove'))
      .nativeElement as HTMLButtonElement;
    remove.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );
    expect(host.move).toBeNull();
  });
});
