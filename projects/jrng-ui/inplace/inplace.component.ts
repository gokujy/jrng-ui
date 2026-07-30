import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { jCreateId } from 'jrng-ui/core';

export interface JInplaceTemplateContext {
  readonly $implicit: JInplaceComponent;
  readonly inplace: JInplaceComponent;
  readonly active: boolean;
  readonly loading: boolean;
  readonly error: string;
}

@Directive({ selector: 'ng-template[jInplaceDisplay]' })
export class JInplaceDisplayDirective {
  readonly templateRef = inject<TemplateRef<JInplaceTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jInplaceContent]' })
export class JInplaceContentDirective {
  readonly templateRef = inject<TemplateRef<JInplaceTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jInplaceActions]' })
export class JInplaceActionsDirective {
  readonly templateRef = inject<TemplateRef<JInplaceTemplateContext>>(TemplateRef);
}

@Component({
  selector: 'j-inplace',
  imports: [NgTemplateOutlet],
  template: `
    @if (!active()) {
      <button
        #displayButton
        class="j-inplace__display"
        type="button"
        [disabled]="disabled()"
        [attr.aria-readonly]="readonly()"
        [attr.aria-expanded]="false"
        (click)="activate()"
        (keydown)="onDisplayKeydown($event)"
      >
        @if (displayTemplate()) {
          <ng-container
            [ngTemplateOutlet]="displayTemplate()!.templateRef"
            [ngTemplateOutletContext]="context()"
          />
        } @else {
          <ng-content select="[jInplaceDisplayContent]" />
        }
      </button>
    } @else {
      <section
        #contentContainer
        class="j-inplace__editor"
        [attr.aria-busy]="isLoading()"
        [attr.aria-describedby]="currentError() ? errorId : null"
      >
        @if (contentTemplate()) {
          <ng-container
            [ngTemplateOutlet]="contentTemplate()!.templateRef"
            [ngTemplateOutletContext]="context()"
          />
        } @else {
          <ng-content />
        }
        @if (currentError()) {
          <p class="j-inplace__error" [id]="errorId" role="alert">{{ currentError() }}</p>
        }
        <div class="j-inplace__actions">
          @if (actionsTemplate()) {
            <ng-container
              [ngTemplateOutlet]="actionsTemplate()!.templateRef"
              [ngTemplateOutletContext]="context()"
            />
          } @else {
            <button type="button" [disabled]="isLoading()" (click)="save()">Save</button>
            <button type="button" [disabled]="isLoading()" (click)="cancel()">Cancel</button>
          }
        </div>
      </section>
    }
  `,
  styleUrl: './inplace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-inplace',
    '[class.j-inplace--active]': 'active()',
    '[class.j-inplace--disabled]': 'disabled()',
    '[class.j-inplace--readonly]': 'readonly()',
    '[class.j-inplace--loading]': 'isLoading()',
    'data-jc-name': 'inplace',
    'data-jc-section': 'root',
    'data-jc-extend': 'display content actions error',
  },
})
export class JInplaceComponent {
  readonly active = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly autoFocus = input(true, { transform: booleanAttribute });
  readonly error = input('');
  readonly saveHandler = input<(() => void | Promise<void>) | null>(null);

  readonly activated = output<void>();
  readonly deactivated = output<void>();
  readonly saveRequested = output<void>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();
  readonly saveError = output<unknown>();

  readonly displayTemplate = contentChild(JInplaceDisplayDirective);
  readonly contentTemplate = contentChild(JInplaceContentDirective);
  readonly actionsTemplate = contentChild(JInplaceActionsDirective);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly displayButton = viewChild<ElementRef<HTMLButtonElement>>('displayButton');
  private readonly contentContainer = viewChild<ElementRef<HTMLElement>>('contentContainer');
  private readonly internalLoading = signal(false);
  private readonly internalError = signal('');
  private saveRun = 0;
  private restoreTarget: HTMLElement | null = null;
  readonly errorId = jCreateId('j-inplace-error');

  isLoading(): boolean {
    return this.loading() || this.internalLoading();
  }

  currentError(): string {
    return this.internalError() || this.error();
  }

  context(): JInplaceTemplateContext {
    return {
      $implicit: this,
      inplace: this,
      active: this.active(),
      loading: this.isLoading(),
      error: this.currentError(),
    };
  }

  activate(): void {
    if (this.disabled() || this.readonly() || this.active()) return;
    this.restoreTarget = this.host.ownerDocument.activeElement as HTMLElement | null;
    this.internalError.set('');
    this.active.set(true);
    this.activated.emit();
    if (this.autoFocus()) {
      queueMicrotask(() => {
        this.contentContainer()
          ?.nativeElement.querySelector<HTMLElement>(
            'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )
          ?.focus();
      });
    }
  }

  deactivate(restoreFocus = true): void {
    if (!this.active() || this.isLoading()) return;
    this.active.set(false);
    this.deactivated.emit();
    if (restoreFocus) {
      this.host.ownerDocument.defaultView?.setTimeout(() => {
        (this.displayButton()?.nativeElement ?? this.restoreTarget)?.focus();
      });
    }
  }

  async save(): Promise<void> {
    if (this.disabled() || this.readonly() || this.isLoading() || !this.active()) return;
    const run = ++this.saveRun;
    this.internalError.set('');
    this.saveRequested.emit();
    const handler = this.saveHandler();
    if (!handler) {
      this.saved.emit();
      this.deactivate();
      return;
    }
    this.internalLoading.set(true);
    try {
      await handler();
      if (run !== this.saveRun) return;
      this.internalLoading.set(false);
      this.saved.emit();
      this.deactivate();
    } catch (error) {
      if (run !== this.saveRun) return;
      this.internalLoading.set(false);
      this.internalError.set(
        error instanceof Error ? error.message : 'The value could not be saved',
      );
      this.saveError.emit(error);
    }
  }

  cancel(): void {
    if (!this.active() || this.isLoading()) return;
    this.saveRun++;
    this.internalError.set('');
    this.cancelled.emit();
    this.deactivate();
  }

  onDisplayKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.activate();
  }
}
