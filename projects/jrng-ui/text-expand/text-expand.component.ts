import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { jCreateId } from 'jrng-ui/core';

export type JTextExpandMode = 'characters' | 'lines';

@Component({
  selector: 'j-text-expand',
  imports: [],
  template: `
    <div
      class="j-text-expand"
      [class.j-text-expand--animated]="animation()"
      [class.is-expanded]="expanded()"
      data-jc-name="text-expand"
      data-jc-section="root"
    >
      <div
        #content
        class="j-text-expand__content"
        data-jc-section="content"
        [id]="contentId"
        [class.j-text-expand__content--lines]="mode() === 'lines' && !expanded()"
        [style.--j-text-expand-lines]="normalizedLines()"
      >
        @if (text()) {
          {{ displayedText() }}
        } @else {
          <ng-content />
        }
      </div>

      @if (showToggle()) {
        <button
          type="button"
          class="j-text-expand__toggle"
          data-jc-section="toggle"
          [disabled]="disabled()"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="contentId"
          (click)="toggleExpanded()"
        >
          {{ expanded() ? showLessLabel() : showMoreLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .j-text-expand {
        color: var(--j-text-expand-color, var(--j-color-text));
      }
      .j-text-expand__content {
        overflow-wrap: anywhere;
      }
      .j-text-expand__content--lines {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: var(--j-text-expand-lines, 3);
        display: -webkit-box;
        overflow: hidden;
      }
      .j-text-expand__toggle {
        background: transparent;
        border: 0;
        color: var(--j-text-expand-action-color, var(--j-color-primary));
        cursor: pointer;
        font: inherit;
        font-weight: var(--j-font-weight-semibold, 600);
        margin-block-start: var(--j-spacing-xs, 0.25rem);
        padding: var(--j-spacing-xs, 0.25rem) 0;
      }
      .j-text-expand__toggle:hover {
        text-decoration: underline;
      }
      .j-text-expand__toggle:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-text-expand__toggle:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.56);
      }
      .j-text-expand--animated .j-text-expand__content {
        transition: max-height var(--j-transition-duration-normal, 180ms)
          var(--j-transition-easing, ease);
      }
      @media (prefers-reduced-motion: reduce) {
        .j-text-expand--animated .j-text-expand__content {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTextExpandComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private resizeObserver: ResizeObserver | null = null;

  readonly text = input<string | null | undefined>('');
  readonly mode = input<JTextExpandMode>('characters');
  readonly collapsedLength = input(150, { transform: numberAttribute });
  readonly collapsedLines = input(3, { transform: numberAttribute });
  readonly showMoreLabel = input('Show more');
  readonly showLessLabel = input('Show less');
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly animation = input(true, { transform: booleanAttribute });
  readonly preserveWords = input(true, { transform: booleanAttribute });
  readonly ellipsis = input('…');
  readonly toggle = output<boolean>();

  readonly contentId = jCreateId('j-text-expand');
  readonly lineOverflow = signal(false);
  readonly normalizedText = computed(() => this.text() ?? '');
  readonly normalizedLength = computed(() => Math.max(0, this.collapsedLength()));
  readonly normalizedLines = computed(() => Math.max(1, this.collapsedLines()));
  readonly characterOverflow = computed(
    () => this.normalizedText().length > this.normalizedLength(),
  );
  readonly displayedText = computed(() => {
    const value = this.normalizedText();
    if (this.mode() !== 'characters' || this.expanded() || !this.characterOverflow()) return value;
    let result = value.slice(0, this.normalizedLength());
    if (this.preserveWords() && result.length < value.length) {
      const boundary = result.lastIndexOf(' ');
      if (boundary > 0) result = result.slice(0, boundary);
    }
    return `${result.trimEnd()}${this.ellipsis()}`;
  });
  readonly showToggle = computed(() =>
    this.mode() === 'characters' ? this.characterOverflow() : this.lineOverflow(),
  );

  constructor() {
    afterNextRender(() => {
      this.measureLineOverflow();
      const ResizeObserverCtor = this.documentRef.defaultView?.ResizeObserver;
      const element = this.content()?.nativeElement;
      if (ResizeObserverCtor && element) {
        this.resizeObserver = new ResizeObserverCtor(() => this.measureLineOverflow());
        this.resizeObserver.observe(element);
      }
    });
    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  toggleExpanded(): void {
    if (this.disabled() || !this.showToggle()) return;
    const next = !this.expanded();
    this.expanded.set(next);
    this.toggle.emit(next);
  }

  /** Recalculates projected or line-clamped content after an external layout change. */
  recalculate(): void {
    this.measureLineOverflow();
  }

  private measureLineOverflow(): void {
    if (!this.isBrowser || this.mode() !== 'lines') return;
    const element = this.content()?.nativeElement;
    if (!element) return;
    const wasExpanded = this.expanded();
    if (wasExpanded) {
      element.classList.add('j-text-expand__content--lines');
    }
    const overflow = element.scrollHeight > element.clientHeight + 1;
    if (wasExpanded) {
      element.classList.remove('j-text-expand__content--lines');
    }
    this.lineOverflow.set(overflow);
  }
}
