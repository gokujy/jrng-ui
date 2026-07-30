import { Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  JSwipeActionsComponent,
  JSwipeContentDirective,
  JSwipeEndActionsDirective,
  JSwipeStartActionsDirective,
} from './swipe-actions.component';

@Component({
  imports: [
    JSwipeActionsComponent,
    JSwipeStartActionsDirective,
    JSwipeContentDirective,
    JSwipeEndActionsDirective,
  ],
  template: `
    <j-swipe-actions
      [disabled]="disabled()"
      [readOnly]="readOnly()"
      [direction]="direction()"
      [destructiveConfirmation]="confirmation()"
      ariaLabel="Customer actions"
      (actionError)="errors.push($event)"
    >
      <ng-template jSwipeStartActions><button type="button">Activate</button></ng-template>
      <ng-template jSwipeContent>Customer Aster Labs</ng-template>
      <ng-template jSwipeEndActions><button type="button">Archive</button></ng-template>
    </j-swipe-actions>
  `,
})
class SwipeActionsHostComponent {
  @ViewChild(JSwipeActionsComponent) component!: JSwipeActionsComponent;
  readonly disabled = signal(false);
  readonly readOnly = signal(false);
  readonly direction = signal<'ltr' | 'rtl'>('ltr');
  readonly confirmation = signal<((side: 'start' | 'end') => boolean) | null>(null);
  errors: unknown[] = [];
}

describe('JSwipeActionsComponent', () => {
  let fixture: ComponentFixture<SwipeActionsHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SwipeActionsHostComponent);
    fixture.detectChanges();
  });

  it('renders independent start, content and end templates', () => {
    expect(fixture.nativeElement.textContent).toContain('Activate');
    expect(fixture.nativeElement.textContent).toContain('Customer Aster Labs');
    expect(fixture.nativeElement.textContent).toContain('Archive');
  });

  it('opens programmatically, closes with Escape and restores focus', () => {
    const component = fixture.componentInstance.component;
    const content = fixture.nativeElement.querySelector('.j-swipe-actions__content') as HTMLElement;
    component.open('end');
    fixture.detectChanges();
    expect(component.openSide()).toBe('end');
    expect(
      fixture.nativeElement
        .querySelector('.j-swipe-actions__actions--end')
        .getAttribute('aria-hidden'),
    ).toBe('false');
    content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    expect(component.openSide()).toBeNull();
    expect(document.activeElement).toBe(content);
  });

  it('supports RTL keyboard mapping and blocks read-only interaction', () => {
    const component = fixture.componentInstance.component;
    const content = fixture.nativeElement.querySelector('.j-swipe-actions__content') as HTMLElement;
    fixture.componentInstance.direction.set('rtl');
    fixture.detectChanges();
    content.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft', cancelable: true }),
    );
    expect(component.openSide()).toBe('start');
    component.close();
    fixture.componentInstance.readOnly.set(true);
    fixture.detectChanges();
    component.open('end');
    expect(component.openSide()).toBeNull();
  });

  it('prevents duplicate async actions and restores an errored action', async () => {
    const component = fixture.componentInstance.component;
    component.open('end');
    let reject!: (error: unknown) => void;
    const pending = component.triggerAction(
      'end',
      false,
      () =>
        new Promise<void>((_resolve, rejectAction) => {
          reject = rejectAction;
        }),
    );
    expect(component.loading()).toBe(true);
    expect(await component.triggerAction('end', false, () => Promise.resolve())).toBe(false);
    reject(new Error('offline'));
    expect(await pending).toBe(false);
    expect(fixture.componentInstance.errors).toHaveLength(1);
    expect(component.openSide()).toBe('end');
  });

  it('closes another row in the same group', () => {
    const second = TestBed.createComponent(SwipeActionsHostComponent);
    second.detectChanges();
    fixture.componentInstance.component.open('start');
    second.componentInstance.component.open('end');
    expect(fixture.componentInstance.component.openSide()).toBeNull();
    expect(second.componentInstance.component.openSide()).toBe('end');
  });

  it('requires destructive confirmation before emitting a full-swipe action', async () => {
    const component = fixture.componentInstance.component;
    fixture.componentInstance.confirmation.set(() => false);
    fixture.detectChanges();
    const triggered: unknown[] = [];
    component.actionTriggered.subscribe((event) => triggered.push(event));
    expect(await component.triggerAction('end', true)).toBe(false);
    expect(triggered).toHaveLength(0);
    expect(component.loading()).toBe(false);
  });
});
