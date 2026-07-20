import { Observable, Subscription, isObservable } from 'rxjs';

export interface JAsyncDataResult<TItem> {
  readonly items: readonly TItem[];
  readonly total?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly hasMore?: boolean;
}

export interface JAsyncOptionsQuery {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
  readonly selectedValues?: readonly unknown[];
}

export interface JAsyncDataSource<TItem, TQuery = unknown> {
  load(query: TQuery): Observable<JAsyncDataResult<TItem>> | Promise<JAsyncDataResult<TItem>>;
  hydrate?(
    values: readonly unknown[],
  ): Observable<JAsyncDataResult<TItem>> | Promise<JAsyncDataResult<TItem>>;
  cacheKey?(query: TQuery): string;
}

export interface JAsyncDataState<TItem> {
  readonly loading: boolean;
  readonly items: readonly TItem[];
  readonly error: unknown | null;
  readonly total?: number;
  readonly hasMore?: boolean;
}

export interface JAsyncDataControllerOptions<TItem> {
  readonly cache?: boolean;
  readonly cacheTtl?: number;
  readonly append?: (current: readonly TItem[], next: readonly TItem[]) => readonly TItem[];
  readonly onStateChange?: (state: JAsyncDataState<TItem>) => void;
}

interface JCacheEntry<TItem> {
  readonly expiresAt: number;
  readonly result: JAsyncDataResult<TItem>;
}

/** Framework-agnostic request coordination shared by async option controls. */
export class JAsyncDataController<TItem, TQuery = unknown> {
  private readonly cache = new Map<string, JCacheEntry<TItem>>();
  private requestId = 0;
  private subscription?: Subscription;
  private state: JAsyncDataState<TItem> = { loading: false, items: [], error: null };

  constructor(
    private readonly source: JAsyncDataSource<TItem, TQuery>,
    private readonly options: JAsyncDataControllerOptions<TItem> = {},
  ) {}

  get snapshot(): JAsyncDataState<TItem> {
    return this.state;
  }

  load(query: TQuery, append = false): Promise<JAsyncDataResult<TItem>> {
    const key = this.source.cacheKey?.(query) ?? stableKey(query);
    const cached = this.options.cache === false ? undefined : this.cache.get(key);
    if (cached && cached.expiresAt >= Date.now()) {
      this.accept(cached.result, append);
      return Promise.resolve(cached.result);
    }

    const id = ++this.requestId;
    this.subscription?.unsubscribe();
    this.update({ ...this.state, loading: true, error: null });

    return new Promise<JAsyncDataResult<TItem>>((resolve, reject) => {
      const request = this.source.load(query);
      if (isObservable(request)) {
        this.subscription = request.subscribe({
          next: (result) => {
            if (id !== this.requestId) return;
            this.remember(key, result);
            this.accept(result, append);
            resolve(result);
          },
          error: (error: unknown) => this.reject(id, error, reject),
        });
        return;
      }
      Promise.resolve(request).then(
        (result) => {
          if (id !== this.requestId) return;
          this.remember(key, result);
          this.accept(result, append);
          resolve(result);
        },
        (error: unknown) => this.reject(id, error, reject),
      );
    });
  }

  hydrate(values: readonly unknown[]): Promise<JAsyncDataResult<TItem> | null> {
    if (!values.length || !this.source.hydrate) return Promise.resolve(null);
    const request = this.source.hydrate(values);
    return resolveRequest(request).then((result) => {
      const existing = new Set(this.state.items.map((item) => stableKey(item)));
      const items = [
        ...result.items.filter((item) => !existing.has(stableKey(item))),
        ...this.state.items,
      ];
      this.update({ ...this.state, items });
      return result;
    });
  }

  cancel(): void {
    this.requestId += 1;
    this.subscription?.unsubscribe();
    this.update({ ...this.state, loading: false });
  }

  invalidate(predicate?: (key: string) => boolean): void {
    if (!predicate) this.cache.clear();
    else for (const key of this.cache.keys()) if (predicate(key)) this.cache.delete(key);
  }

  destroy(): void {
    this.cancel();
    this.cache.clear();
  }

  private accept(result: JAsyncDataResult<TItem>, append: boolean): void {
    const items = append
      ? (this.options.append?.(this.state.items, result.items) ?? [
          ...this.state.items,
          ...result.items,
        ])
      : result.items;
    this.update({
      loading: false,
      items,
      error: null,
      total: result.total,
      hasMore: result.hasMore,
    });
  }

  private reject(id: number, error: unknown, reject: (reason?: unknown) => void): void {
    if (id !== this.requestId) return;
    this.update({ ...this.state, loading: false, error });
    reject(error);
  }

  private remember(key: string, result: JAsyncDataResult<TItem>): void {
    if (this.options.cache === false) return;
    this.cache.set(key, {
      expiresAt: Date.now() + (this.options.cacheTtl ?? 5 * 60_000),
      result,
    });
  }

  private update(state: JAsyncDataState<TItem>): void {
    this.state = state;
    this.options.onStateChange?.(state);
  }
}

function stableKey(value: unknown): string {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableKey(entry)}`)
    .join(',')}}`;
}

function resolveRequest<T>(request: Observable<T> | Promise<T>): Promise<T> {
  if (!isObservable(request)) return Promise.resolve(request);
  return new Promise<T>((resolve, reject) => {
    let latest: T;
    request.subscribe({
      next: (value) => (latest = value),
      error: reject,
      complete: () => resolve(latest),
    });
  });
}
