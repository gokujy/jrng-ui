import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { JSignatureComponent, JSignatureValue } from './signature.component';

@Component({
  imports: [FormsModule, JSignatureComponent],
  template: `
    <j-signature
      [(ngModel)]="value"
      [required]="required()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      (valueChange)="changes = changes + 1"
    />
  `,
})
class SignatureHostComponent {
  value: JSignatureValue | null = null;
  readonly required = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  changes = 0;
}

describe('JSignatureComponent', () => {
  let fixture: ComponentFixture<SignatureHostComponent>;
  let component: JSignatureComponent;
  let canvas: HTMLCanvasElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignatureHostComponent] }).compileComponents();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    fixture = TestBed.createComponent(SignatureHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    canvas = fixture.nativeElement.querySelector('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 300,
      bottom: 220,
      width: 300,
      height: 220,
      toJSON: () => ({}),
    });
    canvas.setPointerCapture = vi.fn();
    canvas.releasePointerCapture = vi.fn();
  });

  it('renders an accessible empty signature and toolbar', () => {
    expect(canvas.getAttribute('aria-label')).toBe('Signature drawing area');
    expect(fixture.nativeElement.querySelector('[role="toolbar"]')).toBeTruthy();
    expect(component.value()).toBeNull();
  });

  it('captures pointer strokes with pressure and updates Angular Forms', () => {
    canvas.dispatchEvent(pointer('pointerdown', 10, 20, 0.8));
    canvas.dispatchEvent(pointer('pointermove', 120, 90, 0.6));
    canvas.dispatchEvent(pointer('pointerup', 120, 90, 0.6));
    fixture.detectChanges();

    expect(fixture.componentInstance.value?.strokes).toHaveLength(1);
    expect(fixture.componentInstance.value?.strokes[0].points[0].pressure).toBeCloseTo(0.8);
    expect(fixture.componentInstance.changes).toBe(1);
  });

  it('supports undo, redo, clear, reset, and import', () => {
    const value: JSignatureValue = {
      width: 300,
      height: 220,
      strokes: [
        {
          color: '#000',
          width: 2,
          points: [
            { x: 0.1, y: 0.2, pressure: 0.5 },
            { x: 0.4, y: 0.5, pressure: 0.5 },
          ],
        },
      ],
    };
    component.importValue(value);
    expect(component.value()?.strokes).toHaveLength(1);
    component.undo();
    expect(component.value()).toBeNull();
    component.redo();
    expect(component.value()?.strokes).toHaveLength(1);
    component.clear();
    expect(component.value()).toBeNull();
    component.importValue(value);
    component.reset();
    expect(component.value()).toBeNull();
  });

  it('blocks modification while disabled or readonly', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    canvas.dispatchEvent(pointer('pointerdown', 10, 20));
    canvas.dispatchEvent(pointer('pointerup', 20, 30));
    expect(component.value()).toBeNull();

    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    canvas.dispatchEvent(pointer('pointerdown', 10, 20));
    expect(component.value()).toBeNull();
  });

  it('validates required empty values', () => {
    fixture.componentInstance.required.set(true);
    fixture.detectChanges();
    expect(component.validate()).toEqual({ required: true });
  });

  it('exports SVG and safe binary formats', async () => {
    component.importValue({
      width: 100,
      height: 50,
      strokes: [
        {
          color: '#111',
          width: 2,
          points: [{ x: 0.1, y: 0.2, pressure: 0.5 }],
        },
      ],
    });
    expect(component.toSVG()).toContain('<path');
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,abc');
    canvas.toBlob = (callback) => callback(new Blob(['png'], { type: 'image/png' }));
    expect(component.toPNG()).toBe('data:image/png;base64,abc');
    expect(component.toBase64()).toBe('data:image/png;base64,abc');
    expect(await component.toBlob()).toBeInstanceOf(Blob);
  });

  it('cancels an active stroke and cleans up on destroy', () => {
    canvas.dispatchEvent(pointer('pointerdown', 10, 20));
    canvas.dispatchEvent(pointer('pointercancel', 20, 30));
    expect(component.value()).toBeNull();
    expect(() => fixture.destroy()).not.toThrow();
  });
});

function pointer(type: string, x: number, y: number, pressure = 0.5): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    button: 0,
    pointerId: 1,
    clientX: x,
    clientY: y,
    pressure,
    pointerType: 'pen',
  });
}
