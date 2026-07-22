import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTabComponent, JTabsComponent, JTabsVariant } from './tabs.component';

@Component({
  imports: [JTabsComponent, JTabComponent],
  template: `<j-tabs [variant]="variant" orientation="vertical">
    <j-tab header="Account">Account panel</j-tab>
    <j-tab header="Disabled" disabled>Disabled panel</j-tab>
    <j-tab header="Security">Security panel</j-tab>
  </j-tabs>`,
})
class TabsVariantHost {
  variant: JTabsVariant = 'default';
}

describe('JTabsComponent variants', () => {
  let fixture: ComponentFixture<TabsVariantHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TabsVariantHost] }).compileComponents();
    fixture = TestBed.createComponent(TabsVariantHost);
    fixture.detectChanges();
  });

  it('renders each opt-in tab-list presentation without changing tab semantics', () => {
    const root = fixture.debugElement.query(By.css('.j-tabs')).nativeElement as HTMLElement;
    expect(root.classList).toContain('j-tabs--default');
    fixture.componentInstance.variant = 'pills';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(root.dataset['jVariant']).toBe('pills');
    expect(fixture.debugElement.query(By.css('[role="tab"]')).attributes['aria-selected']).toBe(
      'true',
    );
  });

  it('uses vertical arrow keys and skips disabled tabs', () => {
    const list = fixture.debugElement.query(By.css('[role="tablist"]'));
    list.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    const tabs = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    expect(tabs[2].attributes['aria-selected']).toBe('true');
  });
});
