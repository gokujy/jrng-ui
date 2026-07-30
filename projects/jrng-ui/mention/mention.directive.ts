import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { jCreateId } from 'jrng-ui/core';

export type JMentionSourceItem = string | Readonly<Record<string, unknown>>;

export interface JMentionQuery {
  readonly trigger: string;
  readonly query: string;
  readonly start: number;
  readonly end: number;
}

export interface JMentionSelection {
  readonly trigger: string;
  readonly item: JMentionSourceItem;
  readonly insertedText: string;
  readonly value: string;
}

export interface JMentionTemplateContext {
  readonly $implicit: JMentionSourceItem;
  readonly item: JMentionSourceItem;
  readonly label: string;
  readonly active: boolean;
  readonly trigger: string;
}

@Directive({
  selector: '[jMention]',
  exportAs: 'jMention',
})
export class JMentionDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly documentRef = inject(DOCUMENT);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cleanup: (() => void)[] = [];
  private readonly views: EmbeddedViewRef<JMentionTemplateContext>[] = [];
  private editable?: HTMLInputElement | HTMLTextAreaElement | HTMLElement;
  private panel?: HTMLElement;
  private queryState?: JMentionQuery;
  private visibleItems: readonly JMentionSourceItem[] = [];
  private activeIndex = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private asyncRun = 0;
  private composing = false;

  readonly suggestions = input<readonly JMentionSourceItem[]>([], { alias: 'jMention' });
  readonly triggers = input<readonly string[]>(['@', '#', '/']);
  readonly dataSource = input<
    | ((
        query: string,
        trigger: string,
      ) => readonly JMentionSourceItem[] | Promise<readonly JMentionSourceItem[]>)
    | null
  >(null);
  readonly debounce = input(200, { transform: numberAttribute });
  readonly minQueryLength = input(0, { transform: numberAttribute });
  readonly labelField = input('label');
  readonly valueField = input('value');
  readonly loadingText = input('Loading suggestions');
  readonly emptyText = input('No suggestions');
  readonly errorText = input('Suggestions could not be loaded');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly appendSpace = input(true, { transform: booleanAttribute });
  readonly mentionTemplate = input<TemplateRef<JMentionTemplateContext> | null>(null);

  readonly mentionQuery = output<JMentionQuery>();
  readonly mentionSelected = output<JMentionSelection>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly loadError = output<unknown>();

  readonly panelId = jCreateId('j-mention-listbox');

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.editable = this.resolveEditable();
    if (!this.editable) return;
    this.editable.setAttribute('aria-autocomplete', 'list');
    this.editable.setAttribute('aria-controls', this.panelId);
    this.listen(this.editable, 'input', () => {
      if (!this.composing) this.scheduleQuery();
    });
    this.listen(this.editable, 'keydown', (event) => this.onKeydown(event as KeyboardEvent));
    this.listen(this.editable, 'compositionstart', () => (this.composing = true));
    this.listen(this.editable, 'compositionend', () => {
      this.composing = false;
      this.scheduleQuery();
    });
    this.listen(this.editable, 'blur', () => {
      setTimeout(() => {
        if (!this.panel?.contains(this.documentRef.activeElement)) this.close();
      });
    });
    this.listen(this.documentRef, 'pointerdown', (event) => {
      if (
        !this.host.contains(event.target as Node) &&
        !this.panel?.contains(event.target as Node)
      ) {
        this.close();
      }
    });
  }

  open(): void {
    if (this.disabled() || !this.queryState) return;
    this.ensurePanel();
    this.positionPanel();
    this.editable?.setAttribute('aria-expanded', 'true');
    this.opened.emit();
  }

  close(): void {
    if (!this.panel) return;
    this.destroyViews();
    this.panel.remove();
    this.panel = undefined;
    this.editable?.setAttribute('aria-expanded', 'false');
    this.editable?.removeAttribute('aria-activedescendant');
    this.closed.emit();
  }

  select(item: JMentionSourceItem): void {
    const query = this.queryState;
    const editable = this.editable;
    if (!query || !editable || this.disabled()) return;
    const insertion = `${query.trigger}${this.itemValue(item)}${this.appendSpace() ? ' ' : ''}`;
    const current = this.readValue();
    const tailStart =
      this.appendSpace() && /\s/.test(current[query.end] ?? '') ? query.end + 1 : query.end;
    const next = `${current.slice(0, query.start)}${insertion}${current.slice(tailStart)}`;
    this.writeValue(next, query.start + insertion.length);
    this.mentionSelected.emit({
      trigger: query.trigger,
      item,
      insertedText: insertion,
      value: next,
    });
    this.close();
    editable.focus();
  }

  ngOnDestroy(): void {
    this.asyncRun++;
    if (this.timer) clearTimeout(this.timer);
    this.close();
    this.cleanup.splice(0).forEach((remove) => remove());
  }

  private scheduleQuery(): void {
    if (this.timer) clearTimeout(this.timer);
    const state = this.currentQuery();
    this.queryState = state;
    if (!state || state.query.length < Math.max(0, this.minQueryLength())) {
      this.close();
      return;
    }
    this.mentionQuery.emit(state);
    this.timer = setTimeout(() => void this.load(state), Math.max(0, this.debounce()));
  }

  private async load(state: JMentionQuery): Promise<void> {
    const run = ++this.asyncRun;
    const source = this.dataSource();
    if (source) {
      this.renderState(this.loadingText());
      try {
        const items = await source(state.query, state.trigger);
        if (run !== this.asyncRun || this.queryState !== state) return;
        this.renderItems(this.filter(items, state.query), state.trigger);
      } catch (error) {
        if (run !== this.asyncRun) return;
        this.loadError.emit(error);
        this.renderState(this.errorText(), true);
      }
    } else {
      this.renderItems(this.filter(this.suggestions(), state.query), state.trigger);
    }
  }

  private filter(
    items: readonly JMentionSourceItem[],
    query: string,
  ): readonly JMentionSourceItem[] {
    const normalized = query.toLocaleLowerCase();
    return items.filter((item) => this.itemLabel(item).toLocaleLowerCase().includes(normalized));
  }

  private renderItems(items: readonly JMentionSourceItem[], trigger: string): void {
    this.visibleItems = items;
    this.activeIndex = 0;
    if (!items.length) {
      this.renderState(this.emptyText());
      return;
    }
    this.ensurePanel();
    this.destroyViews();
    this.panel!.replaceChildren();
    items.forEach((item, index) => {
      const button = this.documentRef.createElement('button');
      button.type = 'button';
      button.id = `${this.panelId}-${index}`;
      button.className = 'j-mention__option';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === this.activeIndex));
      Object.assign(button.style, {
        display: 'block',
        width: '100%',
        minHeight: '2.25rem',
        border: '0',
        borderRadius: 'var(--j-radius-sm, .25rem)',
        background: index === this.activeIndex ? 'var(--j-color-muted, #e2e8f0)' : 'transparent',
        color: 'inherit',
        padding: 'var(--j-spacing-2, .5rem)',
        textAlign: 'start',
      });
      button.addEventListener('pointerdown', (event) => event.preventDefault());
      button.addEventListener('click', () => this.select(item));
      const template = this.mentionTemplate();
      if (template) {
        const view = this.viewContainer.createEmbeddedView(template, {
          $implicit: item,
          item,
          label: this.itemLabel(item),
          active: index === this.activeIndex,
          trigger,
        });
        view.detectChanges();
        view.rootNodes.forEach((node) => button.append(node));
        this.views.push(view);
      } else {
        button.textContent = this.itemLabel(item);
      }
      this.panel!.append(button);
    });
    this.open();
    this.syncActive();
  }

  private renderState(text: string, error = false): void {
    this.ensurePanel();
    this.destroyViews();
    const state = this.documentRef.createElement('div');
    state.className = 'j-mention__state';
    state.textContent = text;
    state.setAttribute('role', error ? 'alert' : 'status');
    this.panel!.replaceChildren(state);
    this.open();
  }

  private ensurePanel(): void {
    if (this.panel) return;
    const panel = this.documentRef.createElement('div');
    panel.id = this.panelId;
    panel.className = 'j-mention__panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Mention suggestions');
    Object.assign(panel.style, {
      position: 'fixed',
      zIndex: '1200',
      maxHeight: '16rem',
      overflow: 'auto',
      minWidth: '12rem',
      background: 'var(--j-color-popover, #fff)',
      color: 'var(--j-color-popover-foreground, #0f172a)',
      border: '1px solid var(--j-color-border, #cbd5e1)',
      borderRadius: 'var(--j-radius-md, .5rem)',
      boxShadow: 'var(--j-shadow-lg, 0 10px 25px rgb(15 23 42 / .15))',
      padding: 'var(--j-spacing-1, .25rem)',
    });
    this.documentRef.body.append(panel);
    this.panel = panel;
  }

  private positionPanel(): void {
    if (!this.panel || !this.editable) return;
    const rect = this.caretRect() ?? this.editable.getBoundingClientRect();
    this.panel.style.left = `${Math.max(8, rect.left)}px`;
    this.panel.style.top = `${rect.bottom + 4}px`;
  }

  private caretRect(): DOMRect | null {
    const selection = this.documentRef.getSelection();
    if (
      this.editable?.isContentEditable &&
      selection?.rangeCount &&
      this.editable.contains(selection.anchorNode)
    ) {
      return selection.getRangeAt(0).cloneRange().getBoundingClientRect();
    }
    const editable = this.editable;
    if (!this.isTextControl(editable)) {
      return null;
    }
    const mirror = this.documentRef.createElement('div');
    const style = this.documentRef.defaultView?.getComputedStyle(editable);
    if (!style) return null;
    const properties = [
      'font',
      'letterSpacing',
      'lineHeight',
      'padding',
      'border',
      'boxSizing',
      'whiteSpace',
      'wordBreak',
      'width',
    ] as const;
    properties.forEach((property) => {
      mirror.style[property] = style[property];
    });
    Object.assign(mirror.style, {
      position: 'fixed',
      visibility: 'hidden',
      left: `${editable.getBoundingClientRect().left}px`,
      top: `${editable.getBoundingClientRect().top}px`,
      whiteSpace: editable.tagName === 'INPUT' ? 'pre' : 'pre-wrap',
      overflowWrap: 'break-word',
    });
    mirror.textContent = editable.value.slice(0, editable.selectionStart ?? 0);
    const marker = this.documentRef.createElement('span');
    marker.textContent = '\u200b';
    mirror.append(marker);
    this.documentRef.body.append(mirror);
    const rect = marker.getBoundingClientRect();
    mirror.remove();
    return rect;
  }

  private currentQuery(): JMentionQuery | undefined {
    const value = this.readValue();
    const caret = this.caretOffset();
    const before = value.slice(0, caret);
    let bestStart = -1;
    let bestTrigger = '';
    for (const trigger of this.triggers()) {
      const index = before.lastIndexOf(trigger);
      if (index > bestStart && (index === 0 || /\s/.test(before[index - 1]))) {
        bestStart = index;
        bestTrigger = trigger;
      }
    }
    if (bestStart < 0) return undefined;
    const query = before.slice(bestStart + bestTrigger.length);
    if (/\s/.test(query)) return undefined;
    return { trigger: bestTrigger, query, start: bestStart, end: caret };
  }

  private onKeydown(event: KeyboardEvent): void {
    if (!this.panel || !this.visibleItems.length) {
      if (event.key === 'Escape') this.close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex =
        (this.activeIndex + delta + this.visibleItems.length) % this.visibleItems.length;
      this.syncActive();
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.select(this.visibleItems[this.activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  private syncActive(): void {
    const options = this.panel?.querySelectorAll<HTMLElement>('[role="option"]') ?? [];
    options.forEach((option, index) => {
      option.setAttribute('aria-selected', String(index === this.activeIndex));
      Object.assign(option.style, {
        background: index === this.activeIndex ? 'var(--j-color-muted, #e2e8f0)' : 'transparent',
      });
    });
    const active = options[this.activeIndex];
    if (active) {
      this.editable?.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView?.({ block: 'nearest' });
    }
  }

  private resolveEditable(): HTMLInputElement | HTMLTextAreaElement | HTMLElement | undefined {
    if (
      this.host.tagName === 'INPUT' ||
      this.host.tagName === 'TEXTAREA' ||
      this.host.isContentEditable
    ) {
      return this.host;
    }
    return (
      this.host.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea') ??
      this.host.querySelector<HTMLElement>('[contenteditable="true"]') ??
      undefined
    );
  }

  private readValue(): string {
    const editable = this.editable;
    if (this.isTextControl(editable)) {
      return editable.value;
    }
    return editable?.textContent ?? '';
  }

  private caretOffset(): number {
    const editable = this.editable;
    if (this.isTextControl(editable)) {
      return editable.selectionStart ?? editable.value.length;
    }
    const selection = this.documentRef.getSelection();
    if (!editable || !selection?.anchorNode || !editable.contains(selection.anchorNode)) {
      return this.readValue().length;
    }
    const range = this.documentRef.createRange();
    range.selectNodeContents(editable);
    range.setEnd(selection.anchorNode, selection.anchorOffset);
    return range.toString().length;
  }

  private writeValue(value: string, caret: number): void {
    const editable = this.editable;
    if (this.isTextControl(editable)) {
      editable.value = value;
      editable.setSelectionRange(caret, caret);
    } else if (editable) {
      editable.textContent = value;
      const range = this.documentRef.createRange();
      const node = editable.firstChild ?? editable;
      range.setStart(node, Math.min(caret, node.textContent?.length ?? 0));
      range.collapse(true);
      const selection = this.documentRef.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    const event = this.documentRef.createEvent('Event');
    event.initEvent('input', true, false);
    editable?.dispatchEvent(event);
  }

  private itemLabel(item: JMentionSourceItem): string {
    return typeof item === 'string' ? item : String(item[this.labelField()] ?? '');
  }

  private itemValue(item: JMentionSourceItem): string {
    return typeof item === 'string'
      ? item
      : String(item[this.valueField()] ?? item[this.labelField()] ?? '');
  }

  private destroyViews(): void {
    this.views.splice(0).forEach((view) => view.destroy());
  }

  private isTextControl(
    element: HTMLElement | undefined,
  ): element is HTMLInputElement | HTMLTextAreaElement {
    return element?.tagName === 'INPUT' || element?.tagName === 'TEXTAREA';
  }

  private listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean,
  ): void {
    target.addEventListener(type, listener, options);
    this.cleanup.push(() => target.removeEventListener(type, listener, options));
  }
}
