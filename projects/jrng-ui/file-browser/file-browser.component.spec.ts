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
    selectionMode="multiple"
    (folderOpen)="opened = $event.item.id"
    (selectionChange)="selection = $event"
  />`,
})
class FileBrowserHostComponent {
  items: readonly JFileBrowserItem[] = [
    { id: 'folder', name: 'Invoices', kind: 'folder' },
    { id: 'sheet', name: 'Quarterly report.xlsx', kind: 'file', size: 1536 },
  ];
  breadcrumbs = [{ id: 'home', label: 'Home' }];
  selection: readonly string[] = [];
  opened = '';
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
});
