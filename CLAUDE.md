# CLAUDE.md

Guidance for working in this repository.

## What this is

`jrng-ui-workspace` — an Angular 21 monorepo that publishes **JRNG UI**, a standalone
Angular component library, plus a **docs/showcase** app that consumes it.

- `projects/jrng-ui` — the published library (`jrng-ui` on npm). Prefix: `j`.
- `projects/docs` — the documentation site (not published). Prefix: `app`.

## Mission

JRNG UI is a **standalone, dependency-free Angular UI component library** — apps can
adopt it with no runtime dependency on any third-party UI framework. It covers a
comprehensive component set for business and admin applications, using a
folder-per-component colocated-entrypoint layout with separate theming.

### Versioning & Angular targeting

- **One library major per Angular major**: the `jrng-ui` major version tracks the
  Angular major it supports (a `21.x` release targets Angular 21, `22.x` targets
  Angular 22, etc.).
- Peer deps are pinned to the current Angular major (`^21.2.0`) — do **not** widen the
  range across Angular majors. When adopting a new Angular version, branch, bump peer
  deps + `engines`, and release the next library major.
- `engines.node` follows the supported Angular version's Node range.

### Legal guardrails (important)

We may be API-compatible with other libraries, but must stay a clean, independent
implementation:

- ✅ **Allowed:** using common _folder/packaging layout_ and _conventions_ (not
  copyrightable), and matching public **API shapes** (inputs/outputs/selectors) for
  drop-in compatibility — interfaces are functional, not protected.
- ❌ **Not allowed:** copying any third-party UI library's **source code**, styles, or
  assets into this repo. Write our own.
- Keep the source free of third-party UI-framework package names and copyright — the
  codebase is fully independent; keep it that way.

## Key architectural facts

- **Colocated secondary entrypoints.** Every component is its own
  independent entrypoint (e.g. `jrng-ui/button`, `jrng-ui/input`) whose source is
  **colocated** in `projects/jrng-ui/<name>/`:
  ```
  projects/jrng-ui/button/
    button.component.ts / .html / .scss   ← implementation (lives HERE)
    button.component.spec.ts              ← test colocated
    ng-package.json                       ← entrypoint config
    public-api.ts                         ← exports from LOCAL files
  ```
  Each `public-api.ts` exports from its own local source, so `jrng-ui/button` pulls
  in only button + its real deps (e.g. `jrng-ui/core`) — **not** the whole library.
  Shared code lives in the `jrng-ui/core` entrypoint (`projects/jrng-ui/core/`).
  - **Cross-component/shared imports use the package path**, never a relative one:
    `import { JRippleDirective } from 'jrng-ui/core'`, `import { JPaginator } from
'jrng-ui/paginator'`. ng-packagr builds entrypoints in dependency order.
  - **The primary `src/public-api.ts` is now just an aggregator** — it re-exports
    every entrypoint (`export * from 'jrng-ui/<name>'`) so `import { X } from
'jrng-ui'` still works. It holds no component source.
  - **Adding a component:** create `projects/jrng-ui/<name>/` with the component
    source, `ng-package.json` (`{ "lib": { "entryFile": "public-api.ts" } }`), and
    `public-api.ts` exporting the local files (+ any `Jr*`→`J*` aliases). Then add
    `export * from 'jrng-ui/<name>';` to `src/public-api.ts`.
  - The library's `sourceRoot` is `projects/jrng-ui` (not `src/`) so the unit-test
    builder discovers the colocated `*.spec.ts` files.
- **The docs app consumes the built library**, not the source. This is why the
  library must be built before serving/testing the docs (see scripts below).
- Angular is **zoneless** and **SSR-ready**; the library targets `^21.2.0`.

## Theming

Two layers:

1. **Static CSS-variable theme** (`src/styles/`, published as `jrng-ui/theme` /
   `jrng-ui/styles`) — a token-driven system on CSS `@layer`s, with semantic
   `--j-*` variables. Light lives on `:root`; dark on `.j-dark` /
   `[data-j-theme='dark']`.
2. **Runtime theming API** (`jrng-ui/theming`) on top of that:
   - `provideJrngTheme(options)` — activate at bootstrap; pair with
     `provideJrngUI({ themeMode })` (from `jrng-ui/core`) to set the initial mode.
   - `JThemeService` — `mode`/`isDark` signals, `toggle()`, `setMode()` (incl.
     `'system'` OS tracking), `applyTokens()` (runtime CSS-var overrides),
     `setPreset()` (inject a light/dark token stylesheet), `getToken()`.
   - `JThemePreset` / `JThemeTokens` — preset shape. Built-in presets live in
     `theming/presets/color-presets.ts` (indigo/violet/emerald/rose/amber/sky) and
     are registered in `jThemePresets` (keyed by `JThemePresetName`).
   - The initial mode comes from `JRNG_CONFIG.themeMode`; the service reflects the
     resolved mode onto the document root's dark class. SSR/jsdom-safe.

## Commands

```bash
npm install          # install workspace deps (also runs husky via `prepare`)
npm start            # build lib, then serve docs at http://localhost:4300
npm run build        # build lib + docs
npm run build:lib    # build the library -> dist/jrng-ui
npm run build:docs   # build the docs app -> dist/docs
npm run test:lib     # run library unit tests (Vitest, jsdom)
npm run lint         # eslint over the whole workspace
npm run lint:fix     # eslint --fix
npm run format       # prettier --write across the repo
npm run format:check # prettier --check (report only)
```

`npm start`, `npm test`, and `npm run test:docs` build the library first because the
docs app depends on the built `dist/jrng-ui`. Expect the first `start` to take ~25s
before the dev server is up.

## Conventions (enforced by lint / audit)

- Component selectors use the `j-*` prefix; CSS classes use `.j-*`; theme tokens use `--j-*`.
- Components are **standalone** and use `ChangeDetectionStrategy.OnPush`.
- Prefer signals (`input()`, `output()`, `model()`, `signal()`, `computed()`) and the
  `inject()` function over constructor injection for new code.
- Form controls that own a value implement `ControlValueAccessor`.
- Templates use modern control-flow syntax (`@if`, `@for`, `@switch`).
- Docs and examples stay **generic** — no private organization or project names.
- The source is deliberately free of `any`, `console.*`, and `TODO`/`FIXME`. Keep it that way.

### Intentional exceptions

The public API intentionally exposes `on`-prefixed outputs (e.g. `(onClick)`,
`(onChange)`) and aliased directive inputs (e.g. `jTourStep`). The matching
angular-eslint rules (`no-output-on-prefix`, `no-output-native`, `no-input-rename`)
are **disabled** — renaming these would be a breaking change.

## Tooling notes

- **Lint baseline is clean (0 errors).** Existing accessibility gaps and modernization
  opportunities are surfaced as **warnings** for incremental cleanup; new code should
  not add errors.
- **Formatting is being adopted incrementally.** Most legacy files predate Prettier
  enforcement, so `format:check` currently reports many files. The pre-commit hook
  (husky + lint-staged) formats and lints **only staged files**, so touched files get
  cleaned up over time. A one-time `npm run format` would clean the rest.
- `angular-eslint` is pinned to the **v21** line to match Angular 21 (v22 requires
  Angular 22).
- The `npm warn Unknown env config "min-release-age"` message comes from a global npm
  config on the machine, not this repo.

## Testing gap to be aware of

Only ~8 of the library components currently have unit tests. When adding or changing a
component, add/extend its `*.component.spec.ts` alongside the implementation.
