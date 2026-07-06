# JRNG UI — Remaining Work / TODO

Editable checklist of remaining work toward full feature parity with a leading
reference Angular UI library. Check items off (`- [x]`) as they land. Effort figures
are human-developer-day equivalents.

> Snapshot (2026-07-07): tests 45 → **126**, spec files 8 → **26**. Runtime theming,
> presets, overlay portaling, filter helper, i18n, colocated migration, docs rebuild,
> date-picker feature push, and select/multiselect virtual scroll are **done**.
> See `docs/component-parity-audit.md` for the flagship gap analysis.

---

## 0. Housekeeping
- [ ] Commit the current verified-but-uncommitted work on `refactor/colocated-entrypoints` (in logical chunks) and open a PR.
- [ ] One-time `npm run format` across the repo (legacy files predate Prettier).
- [ ] At first stable release: bump `jrng-ui` version to `21.0.0` (one major per Angular major).
- [ ] Remove the global npm `min-release-age` config causing the harmless warning (machine-level, not repo).

## A. Finish known feature patterns  (~1 week)
- [ ] **Virtual scroll → tree** (~2–3 d) — hierarchical + expand/collapse windowing.
- [ ] **Virtual scroll → table** (~2–4 d) — row virtualization; interplay with frozen columns.
- [ ] **Virtual scroll → listbox / combobox** (~0.5 d each) — flat lists, mirror select.
- [ ] **Overlay portal (`appendTo`) → menu** (~0.5 d)
- [ ] **Overlay portal → tiered-menu / context-menu / mega-menu / menubar** (~1 d)
- [ ] **Overlay portal → popover / overlay-panel** (~0.5 d)
- [ ] **Date-picker multi-month** (`numberOfMonths`) (~0.5–1 d)
- [ ] Adopt **filter match-modes** in `table` and `tree` filters (~1 d)

## B. Per-component parity audit + fixes  (~1–3 months — the big unknown)
Only 6 of 123 components are audited feature-by-feature vs the reference library.
Audit the rest, then close gaps. Fix effort depends entirely on what the audit finds.
- [ ] **Audit remaining ~117 components** vs the reference API → extend `docs/component-parity-audit.md` (~3–5 d)
- [ ] Fix gaps in **data-heavy components** (likely deepest): `table`, `tree-table`, `tree`, `data-grid`, `data-view`, `paginator`
- [ ] Fix gaps in **rich inputs**: `autocomplete` (multiple, virtual, templating), `editor`, `input-number`, `input-mask`, `input-otp`, `color-picker`, `time-picker`, `date-range-picker`
- [ ] Fix gaps in **overlays/menus**: `menu` family, `confirm-dialog`, `dynamic-dialog`, `drawer`
- [ ] Fix gaps in **big widgets**: `gantt`, `kanban`, `org-chart`, `calendar-scheduler`, `carousel`, `gallery`, `file-upload`
- [ ] Templating slots (header/footer/group/empty/icon) across overlay components
- [ ] Grouping: option grouping (multiselect), row grouping (table)

## C. Test backfill  (~1–2 weeks)
Components with specs: `avatar, badge, button, card, checkbox, chip, date-picker,
dialog, input, multiselect, radio, select, switch, table, tag, textarea, toast,
tooltip` (+ infra: `core, theming, virtual-scroller`).

Remaining (no spec) — check off as added:
- [ ] Forms: `autocomplete, chips, color-picker, combobox, date-range-picker, input-group, input-icon, input-mask, input-number, input-otp, key-filter, knob, listbox, password, rating, select-button, slider, time-picker, toggle-button, float-label, form-field, ifta-label, icon-field, filter-bar`
- [ ] Buttons/basic: `copy-button, icon, divider, loader, progress-bar, progress-spinner, skeleton, avatar-group, meter-group, status-chip`
- [ ] Data: `data-grid, data-view, paginator, tree, tree-table, order-list, pick-list, transfer-list, column-filter, timeline, org-chart, gantt, kanban`
- [ ] Overlays/feedback: `confirm-dialog, confirm-popup, drawer, dynamic-dialog, popover, overlay-panel, notification-center, tour`
- [ ] Navigation: `accordion, breadcrumb, menu, menubar, mega-menu, tiered-menu, context-menu, panel, fieldset, splitter, stepper, tabs, command-palette, sidebar-nav`
- [ ] Media/misc: `carousel, gallery, image, image-preview, chart, sparkline, editor, file-upload, file-preview, dropzone, video-player, formatting, metric-card, stat-card, page-header, section-header, section-footer`
- [ ] Layouts: `app-shell, auth-layout, dashboard-layout, sidebar-layout, grid-layout, container, stack, responsive-sidebar, topbar, toolbar, calendar, calendar-scheduler, empty-state, empty-page, error-page, maintenance-page, bottom-sheet`

## D. Optional / ecosystem (not required for parity)
- [ ] Dedicated icon set — currently bring-your-own SVGs.
- [ ] Separate, independently-versioned themes package.
- [ ] Evaluate `@angular/cdk` foundation vs hand-rolled overlay/a11y primitives.
- [ ] Docs: live StackBlitz editors + generated API tables.

---

### Rough totals
- **Known/scoped (A + C + housekeeping):** ~2–3 weeks.
- **Full parity (B):** ~1–3 months, dominated by the unaudited long tail.
- Get a firm number by running **B's audit first** (~3–5 d) to size the gap.
