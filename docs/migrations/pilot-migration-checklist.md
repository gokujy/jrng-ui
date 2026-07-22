# Pilot migration checklist

## Before

- [ ] Choose one Angular 21 module with forms, data control, overlay, upload, identity, and state handling.
- [ ] Capture UI, keyboard, screen-reader, payload, saved-state, bundle, CSS, and performance baselines.
- [ ] Inventory custom wrappers and establish a tested rollback point.
- [ ] Confirm the module has no unresolved production defect that would distort comparison.

## During

- [ ] Install the audited packed JRNG artifact and configure theme/core providers.
- [ ] Replace generic form and validation wrappers first.
- [ ] Replace value formatting, table/grid/filter, async controls, upload, headers, avatars, and overlays incrementally.
- [ ] Preserve services, payloads, permissions, validators, mappings, statuses, tenant rules, and workflows.
- [ ] Use modular entrypoints and do not introduce workaround wrappers without classifying the gap.

## After

- [ ] Prove feature and payload equivalence.
- [ ] Re-run keyboard, screen-reader, responsive, SSR, performance, bundle, and CSS comparisons.
- [ ] Verify no JRNG remote calls or unexpected optional dependency.
- [ ] Quantify wrapper/SCSS reduction and migration effort.
- [ ] Test rollback and obtain application-owner sign-off.
