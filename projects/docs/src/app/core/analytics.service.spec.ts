import { TestBed } from '@angular/core/testing';
import {
  DOCS_ANALYTICS_PROVIDER,
  DocsAnalyticsEvent,
  DocsAnalyticsService,
} from './analytics.service';

describe('DocsAnalyticsService', () => {
  it('is disabled by default', () => {
    const service = TestBed.inject(DocsAnalyticsService);
    expect(service.enabled).toBe(false);
    expect(() => service.track('get_started_click')).not.toThrow();
  });

  it('forwards privacy-safe events when a provider is configured', () => {
    TestBed.resetTestingModule();
    const events: DocsAnalyticsEvent[] = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCS_ANALYTICS_PROVIDER,
          useValue: { track: (event: DocsAnalyticsEvent) => events.push(event) },
        },
      ],
    });
    const service = TestBed.inject(DocsAnalyticsService);
    service.track('search_use', { area: 'public_api', hasQuery: true });
    expect(service.enabled).toBe(true);
    expect(events).toEqual([
      { name: 'search_use', properties: { area: 'public_api', hasQuery: true } },
    ]);
  });
});
