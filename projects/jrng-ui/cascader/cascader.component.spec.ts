import { Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  JCascaderComponent,
  JCascaderOptionDirective,
  JCascaderOptionRecord,
} from './cascader.component';

@Component({
  imports: [JCascaderComponent, JCascaderOptionDirective, ReactiveFormsModule],
  template: `
    <j-cascader
      label="Customer location"
      [options]="options"
      [searchable]="true"
      [formControl]="control"
      [loadChildren]="loader()"
      (pathChange)="paths.push($event)"
      (loadFailed)="errors.push($event)"
    >
      <ng-template jCascaderOption let-option>{{ option.label }}</ng-template>
    </j-cascader>
  `,
})
class CascaderHostComponent {
  @ViewChild(JCascaderComponent) component!: JCascaderComponent;
  readonly control = new FormControl<unknown>(null);
  readonly loader = signal<
    ((option: JCascaderOptionRecord) => Promise<readonly JCascaderOptionRecord[]>) | null
  >(null);
  paths: (readonly JCascaderOptionRecord[])[] = [];
  errors: unknown[] = [];
  readonly options: readonly JCascaderOptionRecord[] = [
    {
      label: 'Canada',
      value: 'ca',
      children: [
        {
          label: 'Ontario',
          value: 'on',
          children: [{ label: 'Toronto', value: 'toronto', leaf: true }],
        },
      ],
    },
    { label: 'United States', value: 'us', leaf: false },
  ];
}

describe('JCascaderComponent', () => {
  let fixture: ComponentFixture<CascaderHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CascaderHostComponent);
    fixture.detectChanges();
  });

  it('navigates levels, writes forms, and displays the full path', () => {
    const component = fixture.componentInstance.component;
    const canada = component.normalizedOptions()[0];
    component.activate(canada, 0);
    const ontario = component.columns()[1][0];
    component.activate(ontario, 1);
    const toronto = component.columns()[2][0];
    component.activate(toronto, 2);
    expect(fixture.componentInstance.control.value).toBe('toronto');
    expect(component.displayValue()).toBe('Canada / Ontario / Toronto');
    expect(fixture.componentInstance.paths[0]).toHaveLength(3);
  });

  it('searches full paths and clears the value', () => {
    const component = fixture.componentInstance.component;
    component.searchText.set('toronto');
    expect(component.searchResults()).toHaveLength(1);
    component.choosePath(component.searchResults()[0]);
    component.clear();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('loads lazy children once and prevents stale errors', async () => {
    fixture.componentInstance.loader.set(async () => [
      { label: 'California', value: 'ca-us', leaf: true },
    ]);
    fixture.detectChanges();
    const component = fixture.componentInstance.component;
    component.activate(component.normalizedOptions()[1], 0);
    await Promise.resolve();
    expect(component.columns()[1][0].label).toBe('California');
  });

  it('blocks opening through Angular Forms disabled state', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    fixture.componentInstance.component.open();
    expect(fixture.componentInstance.component.openState()).toBe(false);
  });
});
