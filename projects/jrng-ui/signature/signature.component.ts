import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';

export interface JSignaturePoint {
  readonly x: number;
  readonly y: number;
  readonly pressure: number;
}

export interface JSignatureStroke {
  readonly color: string;
  readonly width: number;
  readonly points: readonly JSignaturePoint[];
}

export interface JSignatureValue {
  readonly strokes: readonly JSignatureStroke[];
  readonly width: number;
  readonly height: number;
}

@Component({
  selector: 'j-signature',
  imports: [JButtonComponent],
  template: `
    <div class="j-signature__canvas-wrap" [style.background]="background()">
      <canvas
        #canvas
        class="j-signature__canvas"
        [style.block-size.px]="height()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-disabled]="isDisabled()"
        [attr.aria-readonly]="readonly()"
        role="img"
        tabindex="0"
        (pointerdown)="startStroke($event)"
        (pointermove)="moveStroke($event)"
        (pointerup)="endStroke($event)"
        (pointercancel)="cancelStroke($event)"
      ></canvas>
    </div>
    @if (showToolbar()) {
      <div class="j-signature__toolbar" role="toolbar" [attr.aria-label]="toolbarAriaLabel()">
        <j-button
          label="Undo"
          icon="undo"
          size="sm"
          variant="soft"
          [disabled]="isDisabled() || readonly() || !canUndo()"
          (onClick)="undo()"
        />
        <j-button
          label="Redo"
          icon="redo"
          size="sm"
          variant="soft"
          [disabled]="isDisabled() || readonly() || !canRedo()"
          (onClick)="redo()"
        />
        <j-button
          label="Clear"
          icon="trash"
          size="sm"
          variant="soft"
          [disabled]="isDisabled() || readonly() || empty()"
          (onClick)="clear()"
        />
      </div>
    }
    <span class="j-signature__status" aria-live="polite">{{ statusText() }}</span>
  `,
  styleUrl: './signature.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JSignatureComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JSignatureComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-signature',
    '[class.is-disabled]': 'isDisabled()',
    '[class.is-readonly]': 'readonly()',
    '[class.is-empty]': 'empty()',
    'data-jc-name': 'signature',
    'data-jc-section': 'root',
    'data-jc-extend': 'canvas toolbar status',
  },
})
export class JSignatureComponent implements ControlValueAccessor, Validator, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly strokes = signal<readonly JSignatureStroke[]>([]);
  private readonly redoStack = signal<readonly JSignatureStroke[]>([]);
  private activeStroke: JSignatureStroke | null = null;
  private resizeObserver?: ResizeObserver;
  private onChange: (value: JSignatureValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly strokeColor = input('var(--j-color-text)');
  readonly background = input('var(--j-color-surface)');
  readonly strokeWidth = input(2.5, { transform: numberAttribute });
  readonly height = input(220, { transform: numberAttribute });
  readonly pressureSensitive = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showToolbar = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Signature drawing area');
  readonly toolbarAriaLabel = input('Signature controls');

  readonly valueChange = output<JSignatureValue | null>();
  readonly strokeStart = output<JSignatureStroke>();
  readonly strokeEnd = output<JSignatureStroke>();
  readonly cleared = output<void>();

  readonly formDisabled = signal(false);
  readonly statusText = signal('Signature is empty');
  readonly empty = () => this.strokes().length === 0;
  readonly canUndo = () => this.strokes().length > 0;
  readonly canRedo = () => this.redoStack().length > 0;
  readonly isDisabled = () => this.disabled() || this.formDisabled();

  constructor() {
    afterNextRender(() => this.setupCanvas());
  }

  startStroke(event: PointerEvent): void {
    if (this.isDisabled() || this.readonly() || event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLCanvasElement;
    target.setPointerCapture?.(event.pointerId);
    const point = this.toPoint(event);
    this.activeStroke = {
      color: this.resolveColor(this.strokeColor()),
      width: Math.max(0.5, this.strokeWidth()),
      points: [point],
    };
    this.strokeStart.emit(this.activeStroke);
    this.draw();
  }

  moveStroke(event: PointerEvent): void {
    if (!this.activeStroke) return;
    event.preventDefault();
    this.activeStroke = {
      ...this.activeStroke,
      points: [...this.activeStroke.points, this.toPoint(event)],
    };
    this.draw();
  }

  endStroke(event: PointerEvent): void {
    if (!this.activeStroke) return;
    (event.currentTarget as HTMLCanvasElement).releasePointerCapture?.(event.pointerId);
    const stroke = this.activeStroke;
    this.activeStroke = null;
    this.strokes.update((value) => [...value, stroke]);
    this.redoStack.set([]);
    this.strokeEnd.emit(stroke);
    this.commit('Signature captured');
  }

  cancelStroke(event: PointerEvent): void {
    if (!this.activeStroke) return;
    (event.currentTarget as HTMLCanvasElement).releasePointerCapture?.(event.pointerId);
    this.activeStroke = null;
    this.draw();
    this.statusText.set('Signature stroke cancelled');
  }

  undo(): void {
    if (this.isDisabled() || this.readonly()) return;
    const values = [...this.strokes()];
    const stroke = values.pop();
    if (!stroke) return;
    this.strokes.set(values);
    this.redoStack.update((redo) => [...redo, stroke]);
    this.draw();
    this.commit('Last stroke removed');
  }

  redo(): void {
    if (this.isDisabled() || this.readonly()) return;
    const values = [...this.redoStack()];
    const stroke = values.pop();
    if (!stroke) return;
    this.redoStack.set(values);
    this.strokes.update((strokes) => [...strokes, stroke]);
    this.draw();
    this.commit('Stroke restored');
  }

  clear(): void {
    if (this.isDisabled() || this.readonly() || this.empty()) return;
    this.strokes.set([]);
    this.redoStack.set([]);
    this.draw();
    this.commit('Signature cleared');
    this.cleared.emit();
  }

  reset(): void {
    this.strokes.set([]);
    this.redoStack.set([]);
    this.activeStroke = null;
    this.draw();
    this.commit('Signature reset');
  }

  importValue(value: JSignatureValue | null): void {
    this.writeValue(value);
    this.commit(value?.strokes.length ? 'Signature imported' : 'Signature is empty');
  }

  value(): JSignatureValue | null {
    if (this.empty()) return null;
    const size = this.canvasSize();
    return { strokes: this.strokes(), ...size };
  }

  toSVG(): string {
    const { width, height } = this.canvasSize();
    const paths = this.strokes()
      .map((stroke) => {
        const points = stroke.points
          .map((point, index) => `${index ? 'L' : 'M'} ${point.x * width} ${point.y * height}`)
          .join(' ');
        return `<path d="${points}" fill="none" stroke="${this.escapeXml(stroke.color)}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${this.escapeXml(this.resolveColor(this.background()))}"/>${paths}</svg>`;
  }

  toPNG(): string {
    return isPlatformBrowser(this.platformId)
      ? this.canvas().nativeElement.toDataURL('image/png')
      : '';
  }

  toBase64(): string {
    return this.toPNG();
  }

  async toBlob(type = 'image/png', quality?: number): Promise<Blob | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    return new Promise((resolve) => this.canvas().nativeElement.toBlob(resolve, type, quality));
  }

  writeValue(value: JSignatureValue | null): void {
    this.strokes.set(
      value?.strokes.map((stroke) => ({ ...stroke, points: [...stroke.points] })) ?? [],
    );
    this.redoStack.set([]);
    this.activeStroke = null;
    this.statusText.set(value?.strokes.length ? 'Signature loaded' : 'Signature is empty');
    if (isPlatformBrowser(this.platformId)) queueMicrotask(() => this.draw());
  }

  registerOnChange(fn: (value: JSignatureValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  validate(): ValidationErrors | null {
    return this.required() && this.empty() ? { required: true } : null;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private setupCanvas(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.resizeCanvas();
    const ResizeObserverConstructor =
      this.canvas().nativeElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserverConstructor) {
      this.resizeObserver = new ResizeObserverConstructor(() => this.resizeCanvas());
      this.resizeObserver.observe(this.canvas().nativeElement);
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvas().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.ownerDocument.defaultView?.devicePixelRatio ?? 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    this.draw();
  }

  private draw(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = this.resolveColor(this.background());
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (const stroke of [...this.strokes(), ...(this.activeStroke ? [this.activeStroke] : [])]) {
      if (!stroke.points.length) continue;
      context.beginPath();
      stroke.points.forEach((point, index) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      });
      const pressure =
        stroke.points.reduce((sum, point) => sum + point.pressure, 0) / stroke.points.length;
      context.lineWidth = stroke.width * (this.pressureSensitive() ? 0.5 + pressure : 1);
      context.strokeStyle = stroke.color;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
    }
  }

  private toPoint(event: PointerEvent): JSignaturePoint {
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
      pressure: event.pressure > 0 ? event.pressure : 0.5,
    };
  }

  private commit(status: string): void {
    const value = this.value();
    this.statusText.set(status);
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  private canvasSize(): { width: number; height: number } {
    if (!isPlatformBrowser(this.platformId)) return { width: 0, height: 0 };
    const canvas = this.canvas().nativeElement;
    return { width: canvas.width, height: canvas.height };
  }

  private resolveColor(value: string): string {
    if (!isPlatformBrowser(this.platformId) || !value.includes('var(')) return value;
    const probe = this.canvas().nativeElement;
    const variable = value.match(/var\((--[^,)]+)/)?.[1];
    return variable
      ? probe.ownerDocument.defaultView?.getComputedStyle(probe).getPropertyValue(variable).trim() ||
          '#111827'
      : value;
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
