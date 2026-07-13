import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JEditorComponent } from 'jrng-ui/editor';
import { JInputComponent } from 'jrng-ui/input';
import { JMenuComponent } from 'jrng-ui/menu';
import { JSelectComponent } from 'jrng-ui/select';
import { JStorageService } from 'jrng-ui/core';
import type { JChartComponent } from 'jrng-ui/chart';
import type { JTourService } from 'jrng-ui/tour';

@Component({
  selector: 'ssr-root',
  imports: [ReactiveFormsModule, JEditorComponent, JInputComponent, JMenuComponent, JSelectComponent],
  template: `
    <main class="j-app">
      <h1>JRNG UI SSR smoke test</h1>
      <j-input label="Name" [formControl]="name" />
      <j-select label="Status" [options]="options" [formControl]="status" />
      <j-editor label="Notes" [formControl]="notes" />
      <j-menu [model]="menu" />
      <p>{{ storageFallback }}</p>
    </main>
  `,
})
export class SsrAppComponent {
  private readonly storage = inject(JStorageService);
  readonly name = new FormControl('SSR');
  readonly status = new FormControl('ready');
  readonly notes = new FormControl('<p><strong>Hydration-safe</strong></p>');
  readonly options = [
    { label: 'Ready', value: 'ready' },
    { label: 'Pending', value: 'pending' },
  ];
  readonly menu = [{ label: 'Home' }];
  readonly storageFallback = this.storage.get('ssr-smoke') ?? 'storage unavailable on server';

  // Type-only references ensure optional entrypoint declarations resolve without loading peers.
  private declare readonly chartType: typeof JChartComponent;
  private declare readonly tourType: typeof JTourService;
}
