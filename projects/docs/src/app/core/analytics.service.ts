import { InjectionToken, Injectable, inject } from '@angular/core';

export type DocsAnalyticsEventName =
  | 'get_started_click'
  | 'npm_click'
  | 'github_click'
  | 'admin_starter_click'
  | 'copy_code'
  | 'online_example_open'
  | 'search_use'
  | 'component_page_view'
  | 'guide_page_view';

export interface DocsAnalyticsEvent {
  readonly name: DocsAnalyticsEventName;
  readonly properties?: Readonly<Record<string, string | number | boolean>>;
}

export interface DocsAnalyticsProvider {
  track(event: DocsAnalyticsEvent): void;
}

export const DOCS_ANALYTICS_PROVIDER = new InjectionToken<DocsAnalyticsProvider>(
  'DOCS_ANALYTICS_PROVIDER',
);

@Injectable({ providedIn: 'root' })
export class DocsAnalyticsService {
  private readonly provider = inject(DOCS_ANALYTICS_PROVIDER, { optional: true });
  readonly enabled = Boolean(this.provider);

  track(name: DocsAnalyticsEventName, properties?: DocsAnalyticsEvent['properties']): void {
    this.provider?.track({ name, properties });
  }
}
