import { Injectable, inject } from '@angular/core';

/**
 * Per-injector unique-id source. Because it is `providedIn: 'root'`, the server
 * creates a fresh instance per request while the browser gets one per bootstrap,
 * so the id sequence is deterministic on both sides and does not leak across SSR
 * requests — avoiding hydration mismatches on generated `id`/`aria-*` values.
 */
@Injectable({ providedIn: 'root' })
export class JIdGenerator {
  private counter = 0;

  create(prefix = 'j'): string {
    this.counter += 1;
    return `${prefix}-${this.counter}`;
  }
}

// Fallback counter for calls made outside an Angular injection context (e.g.
// runtime service methods that mint data ids rather than hydration-sensitive
// DOM ids).
let fallbackId = 0;

/**
 * Creates a unique id. When called from an injection context (component/directive
 * field initializers, which is the common case for `id`/`aria-*` bindings), it
 * uses the per-injector {@link JIdGenerator} so ids stay stable across SSR and
 * client hydration. Outside injection contexts it falls back to a module counter.
 */
export function jCreateId(prefix = 'j'): string {
  // `inject()` succeeds in an injection context (component/directive field
  // initializers, the common case for `id`/`aria-*`), giving per-injector ids
  // that stay stable across SSR and hydration. Outside a context it throws, so
  // we fall back to a module counter for the rare runtime call.
  try {
    return inject(JIdGenerator).create(prefix);
  } catch {
    fallbackId += 1;
    return `${prefix}-${fallbackId}`;
  }
}

export function jrCreateId(prefix: string): string {
  return jCreateId(prefix);
}
