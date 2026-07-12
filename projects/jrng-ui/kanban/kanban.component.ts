import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
  output,
  signal,
} from '@angular/core';

export interface JKanbanCard {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly metadata?: string;
  readonly data?: unknown;
}

export interface JKanbanColumn {
  readonly id: string;
  readonly title: string;
  readonly cards: readonly JKanbanCard[];
  readonly data?: unknown;
}

export interface JKanbanCardContext {
  readonly $implicit: JKanbanCard;
  readonly card: JKanbanCard;
  readonly column: JKanbanColumn;
  readonly columnIndex: number;
  readonly cardIndex: number;
}

export interface JKanbanColumnContext {
  readonly $implicit: JKanbanColumn;
  readonly column: JKanbanColumn;
  readonly columnIndex: number;
}

export interface JKanbanMoveEvent {
  readonly card: JKanbanCard;
  readonly fromColumn: JKanbanColumn;
  readonly toColumn: JKanbanColumn;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly columns: readonly JKanbanColumn[];
}

export interface JKanbanColumnEvent {
  readonly column: JKanbanColumn;
}

export interface JKanbanCardEvent {
  readonly card: JKanbanCard;
  readonly column: JKanbanColumn;
}

interface JKanbanDragState {
  readonly columnId: string;
  readonly cardId: string;
  readonly cardIndex: number;
}

@Component({
  selector: 'j-kanban',
  imports: [NgTemplateOutlet],
  template: `
    <section class="j-kanban" [class]="styleClass()" data-jc-name="kanban" data-jc-section="root">
      @for (column of value(); track column.id; let columnIndex = $index) {
        <section
          class="j-kanban__column"
          data-jc-section="column"
          [attr.data-j-active]="dropColumnId() === column.id ? 'true' : null"
          (dragover)="handleDragOver($event, column.id)"
          (dragleave)="handleDragLeave(column.id)"
          (drop)="handleDrop($event, column, column.cards.length)"
        >
          <header class="j-kanban__column-header">
            @if (columnTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="columnContext(column, columnIndex)"
              />
            } @else {
              <strong>{{ column.title }}</strong>
              <span>{{ column.cards.length }}</span>
            }
          </header>

          <div
            class="j-kanban__cards"
            data-jc-section="cards"
            (dragover)="handleDragOver($event, column.id)"
            (drop)="handleDrop($event, column, column.cards.length)"
          >
            @for (card of column.cards; track card.id; let cardIndex = $index) {
              <article
                class="j-kanban__card"
                data-jc-section="card"
                draggable="true"
                (dragstart)="handleDragStart(column, card, cardIndex)"
                (dragend)="handleDragEnd()"
                (dragover)="handleDragOver($event, column.id)"
                (drop)="handleDrop($event, column, cardIndex)"
              >
                @if (cardTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="cardContext(card, column, columnIndex, cardIndex)"
                  />
                } @else {
                  <strong>{{ card.title }}</strong>
                  @if (card.description) {
                    <p>{{ card.description }}</p>
                  }
                  @if (card.metadata) {
                    <small>{{ card.metadata }}</small>
                  }
                }
                <button
                  type="button"
                  class="j-kanban__remove"
                  aria-label="Remove card"
                  (click)="removeCard.emit({ card, column })"
                >
                  Remove
                </button>
              </article>
            } @empty {
              <div class="j-kanban__empty" data-jc-section="empty">{{ emptyMessage() }}</div>
            }
          </div>

          <button type="button" class="j-kanban__add" (click)="addCard.emit({ column })">
            {{ addCardLabel() }}
          </button>
        </section>
      }
    </section>
  `,
  styles: [
    `
      .j-kanban {
        align-items: stretch;
        display: grid;
        gap: var(--j-spacing-4);
        grid-auto-columns: minmax(18rem, 1fr);
        grid-auto-flow: column;
        overflow-x: auto;
        padding-bottom: var(--j-spacing-2);
      }

      .j-kanban__column {
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-rows: auto minmax(8rem, 1fr) auto;
        padding: var(--j-spacing-3);
      }

      .j-kanban__column[data-j-active='true'] {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-kanban__column-header {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }

      .j-kanban__column-header span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
      }

      .j-kanban__cards {
        display: grid;
        gap: var(--j-spacing-3);
        align-content: start;
      }

      .j-kanban__card {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-sm);
        cursor: grab;
        display: grid;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-3);
      }

      .j-kanban__card p,
      .j-kanban__card small,
      .j-kanban__empty {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-kanban__remove,
      .j-kanban__add {
        background: transparent;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
      }

      .j-kanban__remove {
        color: var(--j-color-danger);
        justify-self: start;
        padding: 0 var(--j-spacing-2);
      }

      .j-kanban__add {
        background: var(--j-color-card);
        width: 100%;
      }

      .j-kanban__remove:focus-visible,
      .j-kanban__add:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JKanbanComponent {
  readonly value = input<readonly JKanbanColumn[]>([]);
  readonly emptyMessage = input('No cards in this column.');
  readonly addCardLabel = input('Add card');
  readonly styleClass = input('');

  readonly addCard = output<JKanbanColumnEvent>();
  readonly removeCard = output<JKanbanCardEvent>();
  readonly reorder = output<JKanbanMoveEvent>();

  readonly cardTemplate = contentChild<unknown, TemplateRef<JKanbanCardContext>>('jKanbanCard', {
    read: TemplateRef,
  });
  readonly columnTemplate = contentChild<unknown, TemplateRef<JKanbanColumnContext>>(
    'jKanbanColumn',
    { read: TemplateRef },
  );

  readonly dropColumnId = signal('');
  private readonly dragState = signal<JKanbanDragState | null>(null);

  handleDragStart(column: JKanbanColumn, card: JKanbanCard, cardIndex: number): void {
    this.dragState.set({ columnId: column.id, cardId: card.id, cardIndex });
  }

  handleDragOver(event: DragEvent, columnId: string): void {
    if (!this.dragState()) {
      return;
    }
    event.preventDefault();
    this.dropColumnId.set(columnId);
  }

  handleDragLeave(columnId: string): void {
    if (this.dropColumnId() === columnId) {
      this.dropColumnId.set('');
    }
  }

  handleDrop(event: DragEvent, toColumn: JKanbanColumn, toIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    const state = this.dragState();
    if (!state) {
      return;
    }
    const fromColumn = this.value().find((column) => column.id === state.columnId);
    const card = fromColumn?.cards.find((item) => item.id === state.cardId);
    if (!fromColumn || !card) {
      this.handleDragEnd();
      return;
    }

    const columns = this.moveCard(fromColumn, toColumn, card, state.cardIndex, toIndex);
    this.reorder.emit({ card, fromColumn, toColumn, fromIndex: state.cardIndex, toIndex, columns });
    this.handleDragEnd();
  }

  handleDragEnd(): void {
    this.dragState.set(null);
    this.dropColumnId.set('');
  }

  cardContext(
    card: JKanbanCard,
    column: JKanbanColumn,
    columnIndex: number,
    cardIndex: number,
  ): JKanbanCardContext {
    return { $implicit: card, card, column, columnIndex, cardIndex };
  }

  columnContext(column: JKanbanColumn, columnIndex: number): JKanbanColumnContext {
    return { $implicit: column, column, columnIndex };
  }

  private moveCard(
    fromColumn: JKanbanColumn,
    toColumn: JKanbanColumn,
    card: JKanbanCard,
    fromIndex: number,
    toIndex: number,
  ): readonly JKanbanColumn[] {
    return this.value().map((column) => {
      if (column.id !== fromColumn.id && column.id !== toColumn.id) {
        return column;
      }
      if (fromColumn.id === toColumn.id && column.id === fromColumn.id) {
        const cards = [...column.cards];
        cards.splice(fromIndex, 1);
        cards.splice(Math.min(toIndex, cards.length), 0, card);
        return { ...column, cards };
      }
      if (column.id === fromColumn.id) {
        return { ...column, cards: column.cards.filter((item) => item.id !== card.id) };
      }
      const cards = [...column.cards];
      cards.splice(Math.min(toIndex, cards.length), 0, card);
      return { ...column, cards };
    });
  }
}
