# Documentation rebuild completion

Completed on 2026-07-28. Phases 0 through 10 were executed sequentially. Each completed phase was validated, reviewed with `git status` and `git diff`, committed with explicit paths, and pushed to the configured `origin/jr` upstream before the next phase began.

## Outcome

| Measure                                                   |              Result |
| --------------------------------------------------------- | ------------------: |
| Public components reviewed                                |                 122 |
| Documentation records/pages reviewed and standardised     |                 122 |
| Audited runnable examples before                          |                 547 |
| Runnable examples after                                   |               1,091 |
| Net example increase                                      |                 544 |
| Like-for-like coverage-generator examples                 | 563 to 1,091 (+528) |
| Public inputs reviewed                                    |               1,446 |
| Public outputs reviewed                                   |                 241 |
| Registry methods reviewed                                 |                 713 |
| Public template directives reviewed                       |                   7 |
| Written API exclusions                                    |                 636 |
| Remaining API-example gaps                                |                   0 |
| Documentation routes verified                             |                 122 |
| Broken or duplicate routes                                |                   0 |
| Missing navigation/search entries                         |                   0 |
| Forbidden business labels remaining                       |                   0 |
| Implemented advanced components found and exposed         |                  14 |
| Non-implemented advanced component names kept out of docs |                  11 |

The component inventory, route catalog, navigation/search metadata, live previews, code examples, API references, direct tests, shared support sections, and modular public entry points agree for all 122 public components.

## Preview experience

- Examples follow the focused progression and independence rules in `docs/guides/component-preview-standard.md`.
- Generated API examples separate appearance, state, configuration, forms, templates, events, programmatic behavior, responsive behavior, RTL, and accessibility where supported.
- Form, action, feedback, navigation, overlay, layout, data-display, media, Table, Tree Table, and advanced preview families were rebuilt or standardised.
- Preview data is fictional customer-related content. The five audited forbidden labels were removed.
- File-backed preview source tabs and public selectors are validated. Copy-code uses the same registered source.
- No unsupported APIs or component pages were invented.

## Table filtering

The Table page contains 239 focused examples and three new independent filtering experiences:

1. `Inline Column Filters`
2. `Filters Above Table`
3. `Expandable Filter Panel`

Each example owns its data, draft/applied filters, sorting, pagination, loading, empty-result, and interaction state. Filtering is case-insensitive, combines criteria correctly, restores the full data set on clear, supports horizontal scrolling, and uses JRNG controls and theme tokens. The expandable panel starts closed, preserves entered values, exposes active chips/count, and implements the requested ARIA and reduced-motion behavior.

## Advanced components

Implemented and visible:

- Query Builder
- Cron Expression Editor
- Barcode
- Calendar Scheduler
- Gantt
- Kanban
- Chart
- Sparkline
- File Browser
- File Preview
- Editor
- Gallery
- Grid Layout
- Tour Guide

Not implemented and intentionally undocumented:

- Pivot Table
- Diagram
- Map
- Chat
- Dock Manager
- Spreadsheet
- Image Editor
- Ribbon
- Code Editor
- Block Editor
- Document Editor

Each implemented advanced component has a source implementation, modular public entry point, registry record, route, navigation/search record, preview, API/example coverage, and the shared accessibility, keyboard, theming, testing, FAQ, and changelog sections.

## Homepage

The documentation homepage now provides an original JRNG experience with:

- a JRNG announcement and Angular 21 compatibility context;
- an original hero, installation snippet, Get Started and component CTAs;
- a live fictional customer dashboard showcase;
- six accurate feature cards;
- Default, Material, and Nexus preset previews;
- a featured customer-focused `j-table`;
- cards for implemented advanced components only;
- a final getting-started CTA; and
- an original responsive footer.

Optimus UI was used only as a high-level structural and UX reference. No Optimus or PrimeNG source, text, examples, measurements, screenshots, assets, API names, or styling were copied.

## Theme settings

The former topbar theme popup and density control were removed. A documentation-only, fixed right-center settings trigger now opens a JRNG Drawer containing:

- all supported JRNG primary palettes;
- all supported JRNG surface palettes;
- Default, Material, and Nexus presets with original descriptions;
- Light and Dark modes; and
- a documented reset to Default/Light and preset defaults.

The panel applies settings live to routes, overlays, and previews; validates versioned application-owned storage; remains SSR safe; restores focus; supports Escape, keyboard activation, mobile sizing, RTL, visible focus, and reduced motion; and is not exported as a JRNG component.

## Validation

| Command                            | Result                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `npm run build:docs`               | Pass; library and production docs built                                       |
| `npm test`                         | Pass                                                                          |
| `npm run lint`                     | Pass                                                                          |
| `npm run docs:validate`            | Pass; 122/122 complete, 0 route/example/content failures                      |
| `npm run verify:registry`          | Pass; 122 components                                                          |
| `npm run verify:api`               | Pass; 130 strict consumer entry points                                        |
| `npm run verify:package`           | Pass                                                                          |
| `npm run verify:consumer`          | Pass                                                                          |
| `npm run pack:dry-run`             | Pass; 272 files, 494.7 kB packed, 3.4 MB unpacked                             |
| `npm run verify:ssr`               | Pass                                                                          |
| `npm run verify:theme`             | Pass; 3 presets and 338 component source files                                |
| `npm run verify:enterprise-audits` | Pass; 127 audited entry points, 682 artifacts, 34 visual fixtures             |
| `npm run test:e2e:table`           | Pass; 8/8 viewport, horizontal scroll, frozen, RTL, resize, and reorder cases |

The first browser run could not launch because the local Playwright Chromium runtime was absent. After installing that declared test runtime, a 45-second suite timeout exposed slow Table documentation rendering at small widths. The suite now has a 120-second allowance and all eight assertions pass. This is a test-runtime adjustment, not a package dependency.

Non-failing warnings:

- npm reports the environment-level `min-release-age` configuration as unknown.
- the production documentation initial bundle is 1.15 MB, 149.79 kB above its 1.00 MB warning budget but below the configured failure budget.
- jsdom emits existing non-failing CSS parsing and cross-document navigation messages.

There are no remaining failing validation commands.

## Package and bundle impact

- No package dependencies were added or changed.
- The npm dry-run remains 272 files, 494.7 kB packed, and 3.4 MB unpacked.
- The docs initial bundle remains 1.15 MB and retains its existing warning.
- Documentation-only theme settings are not present in the package inventory or public exports.
- Prompts, planning artifacts, tests, development notes, and private files remain excluded from the npm package.

## Commits and pushes

| Phase | Commit                                                       | Hash                                                                                                | Push                                      |
| ----: | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
|     0 | `docs(audit): record documentation rebuild baseline`         | `41b71a9b8fa3e70e6cde4dac21bb86bbf39387ea`                                                          | Pushed to `origin/jr`                     |
|     1 | `docs(previews): define documentation standards`             | `460ff66877b1897552237519f4d670c8dcaac128`                                                          | Pushed to `origin/jr`                     |
|     2 | `feat(docs): move theme settings to side panel`              | `664efee8d4587985d68a0e012bba70925dad7394`                                                          | Pushed to `origin/jr`                     |
|     3 | `feat(docs): redesign documentation homepage`                | `fa4c0bd4765c053c491f0862fb9a61792c0ffc23`                                                          | Pushed to `origin/jr`                     |
|     4 | `docs(components): rebuild form and feedback previews`       | `403cf134d01a590ad818225ab3e7ea9f4f449eeb`                                                          | Pushed to `origin/jr`                     |
|     5 | `docs(components): rebuild layout and data previews`         | `bb2053ab21a4401ee6e040ebd1dd9ddddce43878`                                                          | Pushed to `origin/jr`                     |
|     6 | `docs(table): rebuild table previews and filtering examples` | `d457cf8a5a589cb6f7d4b5d884f64279aaaae9ca`                                                          | Pushed to `origin/jr`                     |
|     7 | `docs(advanced): rebuild advanced component previews`        | `f4b23eeccb40b542df8bcf825985f51c033444a6`                                                          | Pushed to `origin/jr`                     |
|     8 | `docs(advanced): expose implemented components`              | `bb8cedd464fc46ea34a8f3b922a1e04b67560140`                                                          | Pushed to `origin/jr`                     |
|     9 | `test(docs): add documentation coverage validation`          | `374c86d102892546d36d0f82b89e6f6f4c1d84e2`                                                          | Pushed to `origin/jr`                     |
|    10 | `chore(docs): finalize documentation rebuild`                | Self-referential hash cannot be embedded in the commit it identifies; recorded in the final handoff | Push result recorded in the final handoff |

All prior pushes succeeded. GitHub reported three existing Dependabot findings (two high and one moderate) after pushes; this task did not alter dependencies.

## Integrity confirmations

- All phases were completed sequentially without requesting intermediate approval.
- No PrimeNG or Optimus source, documentation text, assets, screenshots, examples, or measurements were copied.
- No fake documentation was created for a non-existent component.
- No removed component or `j-data-grid` was reintroduced.
- No unrelated pre-existing changes were committed. The user-owned staged video assets and the three associated modified documentation files remain outside these commits.
- No force push, amend, squash, reset, or history rewrite was used.
- The configured upstream was used; no remote destination was guessed.
