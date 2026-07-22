# Angular 21 compatibility audit

Verdict: **PASS**

- Angular peer range: >=21.2.0 <22.0.0
- Standalone/OnPush canonical components: verified by production compilation and inventory.
- SSR/hydration smoke build: required release gate.
- Zoneless-safe explicit signal/state updates: covered by component tests and no mandatory NgZone dependency.
- Browser API occurrences reviewed: 301.

| API                  | Static occurrences | Guard/cleanup policy                                              |
| -------------------- | -----------------: | ----------------------------------------------------------------- |
| window               |                 10 | Platform guard, feature detection, and lifecycle cleanup required |
| document             |                203 | Platform guard, feature detection, and lifecycle cleanup required |
| navigator            |                  4 | Platform guard, feature detection, and lifecycle cleanup required |
| localStorage         |                 10 | Platform guard, feature detection, and lifecycle cleanup required |
| sessionStorage       |                  2 | Platform guard, feature detection, and lifecycle cleanup required |
| ResizeObserver       |                 19 | Platform guard, feature detection, and lifecycle cleanup required |
| IntersectionObserver |                  3 | Platform guard, feature detection, and lifecycle cleanup required |
| MutationObserver     |                  3 | Platform guard, feature detection, and lifecycle cleanup required |
| matchMedia           |                 15 | Platform guard, feature detection, and lifecycle cleanup required |
| clipboard            |                 25 | Platform guard, feature detection, and lifecycle cleanup required |
| requestFullscreen    |                  2 | Platform guard, feature detection, and lifecycle cleanup required |
| createObjectURL      |                  5 | Platform guard, feature detection, and lifecycle cleanup required |

Observers introduced by enterprise components disconnect through DestroyRef; chart instances and object URLs are destroyed/revoked; async data-source requests are cancelled. Stable IDs use the JRNG ID service and SSR smoke fixtures.
