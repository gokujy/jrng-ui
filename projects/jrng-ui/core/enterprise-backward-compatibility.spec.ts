import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { JrButtonComponent } from 'jrng-ui/button';
import { JrInputComponent } from 'jrng-ui/input';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JSelectComponent } from 'jrng-ui/select';
import { JMultiselectComponent } from 'jrng-ui/multiselect';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JRadioComponent } from 'jrng-ui/radio';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTableComponent } from 'jrng-ui/table';
import { JDataGridComponent } from 'jrng-ui/data-grid';
import { JrDialogComponent } from 'jrng-ui/dialog';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JrToastContainerComponent } from 'jrng-ui/toast';
import { JFileUploadComponent } from 'jrng-ui/file-upload';
import { JrCardComponent } from 'jrng-ui/card';
import { JTabComponent, JTabsComponent } from 'jrng-ui/tabs';
import { JMenuComponent } from 'jrng-ui/menu';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JEditorComponent } from 'jrng-ui/editor';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JrButtonComponent,
    JrInputComponent,
    JTextareaComponent,
    JSelectComponent,
    JMultiselectComponent,
    JDatePickerComponent,
    JCheckboxComponent,
    JRadioComponent,
    JSwitchComponent,
    JTableComponent,
    JDataGridComponent,
    JrDialogComponent,
    JConfirmDialogComponent,
    JrToastContainerComponent,
    JFileUploadComponent,
    JrCardComponent,
    JTabsComponent,
    JTabComponent,
    JMenuComponent,
    JPageHeaderComponent,
    JTooltipDirective,
    JEditorComponent,
  ],
  template: `
    <j-page-header title="Compatibility fixture" />
    <j-card>
      <j-button label="Save" (onClick)="activated = true" />
      <j-input name="name" [(ngModel)]="name" />
      <j-textarea [formControl]="notes" />
      <j-select [options]="options" />
      <j-multiselect [options]="options" />
      <j-date-picker />
      <j-checkbox label="Enabled" />
      <j-radio name="choice" value="one" label="One" />
      <j-switch label="Active" />
      <span jTooltip="More information">Help</span>
      <j-editor />
    </j-card>
    <j-table [value]="rows" />
    <j-data-grid [value]="rows" />
    <j-tabs><j-tab header="Overview">Content</j-tab></j-tabs>
    <j-menu [model]="[]" />
    <j-file-upload />
    <j-dialog />
    <j-confirm-dialog />
    <j-toast />
  `,
})
class EnterpriseBackwardCompatibilityFixture {
  protected activated = false;
  protected name = '';
  protected readonly notes = new FormControl('');
  protected readonly options = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
  ];
  protected readonly rows = [{ id: 1, name: 'Stable record' }];
}

describe('enterprise backward compatibility fixture', () => {
  it('compiles previous documented selectors and modular entrypoint imports unchanged', async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseBackwardCompatibilityFixture],
    }).compileComponents();

    const fixture = TestBed.createComponent(EnterpriseBackwardCompatibilityFixture);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('j-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('j-editor')).not.toBeNull();
  });
});
