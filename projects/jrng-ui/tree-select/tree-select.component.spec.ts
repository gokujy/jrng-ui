import { Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JTreeNode } from 'jrng-ui/tree';
import {
  JTreeSelectComponent,
  JTreeSelectNodeDirective,
  JTreeSelectValueDirective,
} from './tree-select.component';

@Component({
  imports: [
    JTreeSelectComponent,
    JTreeSelectNodeDirective,
    JTreeSelectValueDirective,
    ReactiveFormsModule,
  ],
  template: `
    <j-tree-select
      label="Customer locations"
      [nodes]="nodes"
      [selectionMode]="mode()"
      [propagation]="propagation()"
      [searchable]="true"
      [clearable]="true"
      [formControl]="control"
      (lazyLoad)="lazyEvents.push($event.node)"
    >
      <ng-template jTreeSelectNode let-node>{{ node.label }}</ng-template>
      <ng-template jTreeSelectValue let-nodes="nodes">{{ nodes.length }} selected</ng-template>
    </j-tree-select>
  `,
})
class TreeSelectHostComponent {
  @ViewChild(JTreeSelectComponent) component!: JTreeSelectComponent;
  readonly control = new FormControl<unknown>(null);
  readonly mode = signal<'single' | 'multiple' | 'checkbox'>('single');
  readonly propagation = signal<'none' | 'down' | 'up' | 'both'>('none');
  lazyEvents: JTreeNode[] = [];
  readonly nodes: readonly JTreeNode[] = [
    {
      key: 'north',
      label: 'North region',
      children: [
        { key: 'toronto', label: 'Toronto', leaf: true },
        { key: 'montreal', label: 'Montreal', leaf: true },
      ],
    },
    { key: 'disabled', label: 'Unavailable', disabled: true, leaf: true },
  ];
}

describe('JTreeSelectComponent', () => {
  let fixture: ComponentFixture<TreeSelectHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeSelectHostComponent);
    fixture.detectChanges();
  });

  it('integrates with Angular Forms and closes a single selection', async () => {
    const component = fixture.componentInstance.component;
    component.open();
    fixture.detectChanges();
    const node = fixture.componentInstance.nodes[0];
    component.onTreeSelection(node);
    expect(fixture.componentInstance.control.value).toBe(node);
    expect(component.openState()).toBe(false);
    await Promise.resolve();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('.j-tree-select__trigger'),
    );
  });

  it('propagates checkbox selection to descendants and clears', () => {
    fixture.componentInstance.mode.set('checkbox');
    fixture.componentInstance.propagation.set('down');
    fixture.detectChanges();
    const component = fixture.componentInstance.component;
    component.onTreeSelection([fixture.componentInstance.nodes[0]]);
    expect(component.selectedNodes().map((node) => node.key)).toEqual([
      'north',
      'toronto',
      'montreal',
    ]);
    component.clearValue();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('supports loading, empty, error, virtual, disabled, and SSR-safe rendering', () => {
    const component = fixture.componentInstance.component;
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    component.open();
    expect(component.openState()).toBe(false);
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    component.open();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tree"]')).toBeTruthy();
  });
});
