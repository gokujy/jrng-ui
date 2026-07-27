import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JFileBrowserComponent } from './file-browser.component';
import { JFileBrowserItem } from './file-browser.types';

@Component({
  imports: [JFileBrowserComponent],
  template: `<j-file-browser
    [items]="items"
    [breadcrumbs]="breadcrumbs"
    [selection]="selection"
    [actions]="actions"
    selectionMode="multiple"
    (folderOpen)="opened = $event.item.id"
    (selectionChange)="selection = $event"
    (action)="actionId = $event.action.id"
  />`,
})
class FileBrowserHostComponent {
  items: readonly JFileBrowserItem[] = [
    { id: 'folder', name: 'Invoices', kind: 'folder' },
    { id: 'sheet', name: 'Quarterly report.xlsx', kind: 'file', size: 1536 },
  ];
  breadcrumbs = [{ id: 'home', label: 'Home' }];
  selection: readonly string[] = [];
  actions = [{ id: 'download', label: 'Download', selection: 'any' as const }];
  opened = '';
  actionId = '';
}

describe('JFileBrowserComponent', () => {
  let fixture: ComponentFixture<FileBrowserHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileBrowserHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FileBrowserHostComponent);
    fixture.detectChanges();
  });

  it('renders folders before files with metadata', () => {
    const items = fixture.debugElement.queryAll(By.css('[data-j-file-item]'));
    expect(items.length).toBe(2);
    expect(items[0]?.nativeElement.textContent).toContain('Invoices');
    expect(items[1]?.nativeElement.textContent).toContain('1.5 KB');
  });

  it('emits folder navigation and selection independently', () => {
    const items = fixture.debugElement.queryAll(By.css('[data-j-file-item]'));
    (items[0]?.nativeElement as HTMLElement).click();
    expect(fixture.componentInstance.opened).toBe('folder');

    const checkbox = items[1]?.query(By.css('input[type="checkbox"]'))
      .nativeElement as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toEqual(['sheet']);
  });

  it('supports keyboard opening and exposes accessible path state', () => {
    const first = fixture.debugElement.query(By.css('[data-j-file-item]'))
      .nativeElement as HTMLElement;
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.opened).toBe('folder');
    expect(fixture.debugElement.query(By.css('[aria-current="page"]'))).toBeTruthy();
  });

  it('enables configured actions for the current selection and emits the action', () => {
    const items = fixture.debugElement.queryAll(By.css('[data-j-file-item]'));
    const checkbox = items[1]?.query(By.css('input[type="checkbox"]'))
      .nativeElement as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    const action = fixture.debugElement
      .queryAll(By.css('.j-file-browser__toolbar button'))
      .map((item) => item.nativeElement as HTMLButtonElement)
      .find((button) => button.textContent?.trim() === 'Download');
    expect(action).toBeDefined();
    if (!action) return;
    expect(action.disabled).toBe(false);
    action.click();
    expect(fixture.componentInstance.actionId).toBe('download');
  });
});
