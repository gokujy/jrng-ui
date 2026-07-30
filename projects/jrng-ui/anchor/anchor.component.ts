import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  OnDestroy,
  output,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';

export interface JAnchorLink {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly children?: readonly JAnchorLink[];
}

export interface JAnchorNavigateEvent {
  readonly id: string;
  readonly link: JAnchorLink;
  readonly target: HTMLElement;
}

interface JFlatAnchorLink {
  readonly link: JAnchorLink;
  readonly level: number;
}

@Component({
  selector: 'j-anchor',
  template: `
    <nav
      #navigation
      class="j-anchor__nav"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-orientation]="orientation()"
      tabindex="-1"
      (keydown)="onKeydown($event)"
    >
      @for (entry of flatLinks(); track entry.link.id) {
        <a
          class="j-anchor__link"
          [class.is-active]="activeId() === entry.link.id"
          [class.is-disabled]="entry.link.disabled"
          [style.--j-anchor-level]="entry.level"
          [attr.href]="'#' + entry.link.id"
          [attr.aria-current]="activeId() === entry.link.id ? 'location' : null"
          [attr.aria-disabled]="entry.link.disabled || null"
          [attr.tabindex]="entry.link.disabled ? -1 : 0"
          (click)="onLinkClick($event, entry.link)"
        >
          {{ entry.link.label }}
        </a>
      }
    </nav>
  `,
  styleUrl: './anchor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-anchor',
    '[class.j-anchor--horizontal]': 'orientation() === "horizontal"',
    'data-jc-name': 'anchor',
    'data-jc-section': 'root',
    'data-jc-extend': 'nav link marker',
  },
})
export class JAnchorComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly navigation = viewChild<ElementRef<HTMLElement>>('navigation');
  private observer?: IntersectionObserver;

  readonly links = input<readonly JAnchorLink[]>([]);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly scrollContainer = input<HTMLElement | null>(null);
  readonly offset = input(0, { transform: numberAttribute });
  readonly smooth = input(true, { transform: booleanAttribute });
  readonly updateFragment = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('On this page');
  readonly activeId = model('');

  readonly navigated = output<JAnchorNavigateEvent>();
  readonly activeSectionChange = output<string>();

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    queueMicrotask(() => this.refresh());
  }

  flatLinks(): readonly JFlatAnchorLink[] {
    const flatten = (links: readonly JAnchorLink[], level: number): JFlatAnchorLink[] =>
      links.flatMap((link) => [{ link, level }, ...flatten(link.children ?? [], level + 1)]);
    return flatten(this.links(), 0);
  }

  navigate(id: string, focus = false): boolean {
    if (!this.isBrowser) return false;
    const entry = this.flatLinks().find((item) => item.link.id === id);
    if (!entry || entry.link.disabled) return false;
    const documentRef = this.host.ownerDocument;
    const target = documentRef.getElementById(id);
    if (!target) return false;
    const container = this.scrollContainer();
    const reduced =
      documentRef.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const behavior: ScrollBehavior = this.smooth() && !reduced ? 'smooth' : 'auto';
    if (container) {
      const top =
        container.scrollTop +
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        this.offset();
      container.scrollTo({ top, behavior });
    } else {
      const top =
        (documentRef.defaultView?.scrollY ?? 0) +
        target.getBoundingClientRect().top -
        this.offset();
      documentRef.defaultView?.scrollTo({ top, behavior });
    }
    this.setActive(id);
    if (this.updateFragment()) {
      documentRef.defaultView?.history.replaceState(
        documentRef.defaultView.history.state,
        '',
        `#${encodeURIComponent(id)}`,
      );
    }
    if (focus) {
      target.setAttribute('tabindex', target.getAttribute('tabindex') ?? '-1');
      target.focus({ preventScroll: true });
    }
    this.navigated.emit({ id, link: entry.link, target });
    return true;
  }

  refresh(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    if (!this.isBrowser) return;
    const documentRef = this.host.ownerDocument;
    const Observer = documentRef.defaultView?.IntersectionObserver;
    if (!Observer) {
      const fragment = decodeURIComponent(documentRef.defaultView?.location.hash.slice(1) ?? '');
      if (fragment) this.setActive(fragment);
      return;
    }
    const targets = this.flatLinks()
      .map((entry) => documentRef.getElementById(entry.link.id))
      .filter((target): target is HTMLElement => Boolean(target));
    this.observer = new Observer(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top - this.offset()) -
              Math.abs(right.boundingClientRect.top - this.offset()),
          );
        const id = (visible[0]?.target as HTMLElement | undefined)?.id;
        if (id) this.setActive(id);
      },
      {
        root: this.scrollContainer(),
        rootMargin: `${-this.offset()}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      },
    );
    targets.forEach((target) => this.observer?.observe(target));
  }

  onLinkClick(event: MouseEvent, link: JAnchorLink): void {
    event.preventDefault();
    this.navigate(link.id);
  }

  onKeydown(event: KeyboardEvent): void {
    const keys =
      this.orientation() === 'horizontal' ? ['ArrowRight', 'ArrowLeft'] : ['ArrowDown', 'ArrowUp'];
    if (![...keys, 'Home', 'End'].includes(event.key)) return;
    const links = Array.from(
      this.navigation()?.nativeElement.querySelectorAll<HTMLAnchorElement>(
        '.j-anchor__link:not(.is-disabled)',
      ) ?? [],
    );
    if (!links.length) return;
    event.preventDefault();
    const current = Math.max(
      0,
      links.indexOf(this.host.ownerDocument.activeElement as HTMLAnchorElement),
    );
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? links.length - 1
          : (current + (event.key === keys[0] ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setActive(id: string): void {
    if (this.activeId() === id) return;
    this.activeId.set(id);
    this.activeSectionChange.emit(id);
  }
}
