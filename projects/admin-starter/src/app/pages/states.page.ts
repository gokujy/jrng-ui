import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JEmptyStateComponent } from 'jrng-ui/empty-state';
import { JErrorPageComponent } from 'jrng-ui/error-page';
import { JLoaderComponent } from 'jrng-ui/loader';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JSkeletonComponent } from 'jrng-ui/skeleton';

@Component({
  selector: 'admin-states-page',
  imports: [
    JEmptyStateComponent,
    JErrorPageComponent,
    JLoaderComponent,
    JPageHeaderComponent,
    JSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="admin-page">
    <j-page-header
      title="Application states"
      description="Reusable loading, skeleton, empty and error treatments."
    />
    <section class="admin-status-grid">
      <article class="admin-panel">
        <h2>Loading</h2>
        <j-loader variant="dots" label="Loading records" />
      </article>
      <article class="admin-panel">
        <h2>Skeleton</h2>
        <j-skeleton variant="card" />
      </article>
      <article class="admin-panel">
        <h2>Empty</h2>
        <j-empty-state title="No records" description="Adjust filters or create a record." />
      </article>
    </section>
    <j-error-page
      code="503"
      title="Service unavailable"
      description="The service could not be reached. Try again shortly."
    />
  </div>`,
})
export class StatesPage {
  readonly loading = signal(false);
}
