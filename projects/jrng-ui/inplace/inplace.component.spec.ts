import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  JInplaceActionsDirective,
  JInplaceComponent,
  JInplaceContentDirective,
  JInplaceDisplayDirective,
} from './inplace.component';

@Component({
  imports: [
    JInplaceComponent,
    JInplaceDisplayDirective,
    JInplaceContentDirective,
    JInplaceActionsDirective,
  ],
  template: `
    <j-inplace
      [(active)]="active"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [saveHandler]="saveHandler"
      (saved)="saved = saved + 1"
      (cancelled)="cancelled = cancelled + 1"
      (saveError)="failed = failed + 1"
    >
      <ng-template jInplaceDisplay>Customer status: Active</ng-template>
      <ng-template jInplaceContent><input aria-label="Customer status" /></ng-template>
      <ng-template jInplaceActions let-inplace>
        <button type="button" class="save" (click)="inplace.save()">Save</button>
        <button type="button" class="cancel" (click)="inplace.cancel()">Cancel</button>
      </ng-template>
    </j-inplace>
  `,
})
class InplaceHostComponent {
  active = false;
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  saveHandler: () => void | Promise<void> = () => undefined;
  saved = 0;
  cancelled = 0;
  failed = 0;
}

describe('JInplaceComponent', () => {
  let fixture: ComponentFixture<InplaceHostComponent>;
  let component: JInplaceComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(InplaceHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('supports uncontrolled activation, keyboard focus, save, and focus restoration', async () => {
    const display = fixture.nativeElement.querySelector('.j-inplace__display') as HTMLButtonElement;
    display.focus();
    display.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    expect(component.active()).toBe(true);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Customer status');
    await component.save();
    fixture.detectChanges();
    await Promise.resolve();
    expect(fixture.componentInstance.saved).toBe(1);
    expect(component.active()).toBe(false);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.j-inplace__display'));
  });

  it('supports controlled state and cancel without saving', () => {
    component.active.set(true);
    fixture.detectChanges();
    component.cancel();
    expect(fixture.componentInstance.cancelled).toBe(1);
    expect(fixture.componentInstance.active).toBe(false);
  });

  it('blocks disabled and read-only activation', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    component.activate();
    expect(component.active()).toBe(false);
    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    component.activate();
    expect(component.active()).toBe(false);
  });

  it('retains edit mode and exposes an async save error', async () => {
    fixture.componentInstance.saveHandler = () => Promise.reject(new Error('Save failed'));
    component.active.set(true);
    fixture.detectChanges();
    await component.save();
    fixture.detectChanges();
    expect(component.active()).toBe(true);
    expect(component.currentError()).toBe('Save failed');
    expect(fixture.componentInstance.failed).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Save failed',
    );
  });
});
