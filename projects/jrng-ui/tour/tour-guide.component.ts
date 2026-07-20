import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JFocusTrapDirective } from 'jrng-ui/core';
import { JTourService } from './tour.service';

@Component({
  selector: 'j-tour-guide',
  imports: [JButtonComponent, JFocusTrapDirective],
  template: `
    @if (tour.isActive() && tour.currentStep(); as step) {
      <div class="j-tour-guide" role="presentation" [attr.dir]="dir()">
        <div class="j-tour-guide__shade" aria-hidden="true"></div>
        @if (tour.targetRect(); as rect) {
          <div
            class="j-tour-guide__spotlight"
            [class.j-tour-guide__spotlight--interactive]="
              step.interactive || tour.config()?.interactive
            "
            [style.top.px]="rect.top"
            [style.left.px]="rect.left"
            [style.width.px]="rect.width"
            [style.height.px]="rect.height"
            [style.border-radius.px]="step.radius ?? tour.config()?.stageRadius ?? 8"
          ></div>
        }
        <section
          class="j-tour-guide__popover"
          [class]="popoverClasses()"
          [style]="popoverStyle()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="step.title ? titleId : null"
          [attr.aria-describedby]="step.description ? descriptionId : null"
          jFocusTrap
        >
          <header class="j-tour-guide__header">
            <div class="j-tour-guide__heading">
              @if (step.title) {
                <h2 [id]="titleId">{{ step.title }}</h2>
              }
              @if (tour.config()?.showProgress) {
                <span>{{ tour.activeIndex() + 1 }} / {{ stepCount() }}</span>
              }
            </div>
            @if (tour.config()?.allowClose !== false && !step.disableButtons?.includes('close')) {
              <j-button
                variant="text"
                actionDisplay="icon"
                icon="close"
                [ariaLabel]="step.closeText || tour.config()?.closeText || 'Close'"
                title="Close tour"
                (onClick)="tour.skip()"
              />
            }
          </header>
          @if (step.description) {
            <p [id]="descriptionId">{{ step.description }}</p>
          }
          <ng-content />
          <footer class="j-tour-guide__footer">
            <j-button
              variant="text"
              [label]="step.previousText || tour.config()?.previousText || 'Previous'"
              [disabled]="tour.activeIndex() === 0 || !!step.disableButtons?.includes('previous')"
              (onClick)="tour.previous()"
            />
            <j-button
              [label]="
                tour.activeIndex() === stepCount() - 1
                  ? step.doneText || tour.config()?.doneText || 'Done'
                  : step.nextText || tour.config()?.nextText || 'Next'
              "
              [disabled]="!!step.disableButtons?.includes('next')"
              (onClick)="tour.next()"
            />
          </footer>
          <span class="j-tour-guide__arrow" aria-hidden="true"></span>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .j-tour-guide {
        inset: 0;
        pointer-events: none;
        position: fixed;
        z-index: var(--j-z-index-tour, 1400);
      }
      .j-tour-guide__shade {
        inset: 0;
        pointer-events: none;
        position: absolute;
      }
      .j-tour-guide__spotlight {
        background: transparent;
        box-shadow: 0 0 0 100vmax var(--j-tour-overlay, rgb(15 23 42 / 66%));
        pointer-events: none;
        position: fixed;
        transition:
          inset var(--j-duration-normal, 200ms),
          width var(--j-duration-normal, 200ms),
          height var(--j-duration-normal, 200ms);
        z-index: 1;
      }
      .j-tour-guide__spotlight--interactive {
        pointer-events: none;
      }
      .j-tour-guide__popover {
        background: var(--j-color-card, #fff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-lg, 0.75rem);
        box-shadow: var(--j-shadow-xl, 0 20px 40px rgb(15 23 42 / 25%));
        color: var(--j-color-text, #111827);
        display: grid;
        gap: var(--j-spacing-md, 0.75rem);
        max-width: min(22rem, calc(100vw - 2rem));
        padding: var(--j-spacing-md, 0.75rem);
        pointer-events: auto;
        position: fixed;
        width: max-content;
        z-index: 2;
      }
      .j-tour-guide__header,
      .j-tour-guide__footer,
      .j-tour-guide__heading {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm, 0.5rem);
      }
      .j-tour-guide__header,
      .j-tour-guide__footer {
        justify-content: space-between;
      }
      .j-tour-guide__heading {
        min-width: 0;
      }
      .j-tour-guide h2 {
        font-size: var(--j-font-size-lg, 1.125rem);
        margin: 0;
      }
      .j-tour-guide p {
        color: var(--j-color-text-muted, #64748b);
        line-height: 1.55;
        margin: 0;
        white-space: pre-line;
      }
      .j-tour-guide__heading span {
        color: var(--j-color-text-muted, #64748b);
        font-size: var(--j-font-size-xs, 0.75rem);
        white-space: nowrap;
      }
      .j-tour-guide__arrow {
        background: var(--j-color-card, #fff);
        border: solid var(--j-color-border, #dbe2ea);
        height: 0.75rem;
        position: absolute;
        transform: rotate(45deg);
        width: 0.75rem;
      }
      .j-tour-guide__popover--bottom .j-tour-guide__arrow {
        border-width: 1px 0 0 1px;
        inset-block-start: -0.42rem;
        inset-inline-start: calc(50% - 0.375rem);
      }
      .j-tour-guide__popover--top .j-tour-guide__arrow {
        border-width: 0 1px 1px 0;
        inset-block-end: -0.42rem;
        inset-inline-start: calc(50% - 0.375rem);
      }
      .j-tour-guide__popover--right .j-tour-guide__arrow {
        border-width: 0 0 1px 1px;
        inset-block-start: calc(50% - 0.375rem);
        inset-inline-start: -0.42rem;
      }
      .j-tour-guide__popover--left .j-tour-guide__arrow {
        border-width: 1px 1px 0 0;
        inset-block-start: calc(50% - 0.375rem);
        inset-inline-end: -0.42rem;
      }
      .j-tour-guide__popover--over .j-tour-guide__arrow {
        display: none;
      }
      @media (max-width: 480px) {
        .j-tour-guide__popover {
          inset-inline: 1rem !important;
          width: auto;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-tour-guide__spotlight {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTourGuideComponent {
  readonly tour = inject(JTourService);
  private readonly view = inject(DOCUMENT).defaultView;
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly titleId = 'j-tour-title';
  readonly descriptionId = 'j-tour-description';
  readonly stepCount = computed(() => this.tour.config()?.steps.length ?? 0);
  readonly placement = computed(() => {
    const requested = this.tour.currentStep()?.side ?? 'auto';
    const rect = this.tour.targetRect();
    if (requested !== 'auto' || !rect) return requested === 'auto' ? 'over' : requested;
    const spaces = {
      top: rect.top,
      bottom: (this.view?.innerHeight ?? 0) - rect.top - rect.height,
      left: rect.left,
      right: (this.view?.innerWidth ?? 0) - rect.left - rect.width,
    };
    return (Object.entries(spaces).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'over') as
      'top' | 'right' | 'bottom' | 'left' | 'over';
  });
  readonly popoverClasses = computed(
    () =>
      `j-tour-guide__popover j-tour-guide__popover--${this.placement()} ${this.tour.currentStep()?.popoverClass ?? this.tour.config()?.popoverClass ?? ''}`,
  );
  readonly popoverStyle = computed(() => {
    const rect = this.tour.targetRect();
    if (!rect) return 'top:50%;left:50%;transform:translate(-50%,-50%)';
    const gap = 14;
    const align = this.tour.currentStep()?.align ?? 'center';
    const place = this.placement();
    if (place === 'over')
      return `top:${rect.top + rect.height / 2}px;left:${rect.left + rect.width / 2}px;transform:translate(-50%,-50%)`;
    if (place === 'top' || place === 'bottom') {
      const left =
        align === 'start'
          ? rect.left
          : align === 'end'
            ? rect.left + rect.width
            : rect.left + rect.width / 2;
      const x = align === 'start' ? '0' : align === 'end' ? '-100%' : '-50%';
      return `top:${place === 'bottom' ? rect.top + rect.height + gap : rect.top - gap}px;left:${left}px;transform:translate(${x},${place === 'top' ? '-100%' : '0'})`;
    }
    const top =
      align === 'start'
        ? rect.top
        : align === 'end'
          ? rect.top + rect.height
          : rect.top + rect.height / 2;
    const y = align === 'start' ? '0' : align === 'end' ? '-100%' : '-50%';
    return `top:${top}px;left:${place === 'right' ? rect.left + rect.width + gap : rect.left - gap}px;transform:translate(${place === 'left' ? '-100%' : '0'},${y})`;
  });
}
