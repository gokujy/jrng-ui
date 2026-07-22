# Angular 21 pilot migration template

Use one representative application module. Keep business logic, API services, authentication, authorization, tenant behavior, status definitions, validators, backend mappings, and workflows application-side.

## Scope

- Module and owner:
- Rollback branch/tag:
- JRNG version:
- Generic patterns selected: page header, form field, validation, input/select, table or grid/filter, dialog, upload, avatar, state display, formatting, responsive behavior.

## Before migration

Record custom components/directives/pipes/SCSS, accessibility behavior, JS/CSS sizes, render measurements, table features and saved state, form/CVA behavior, and API payload snapshots.

## During migration

Replace one generic pattern at a time using modular `jrng-ui/*` imports. Preserve payload construction and domain mapping. Commit at reversible boundaries and run behavior, accessibility, responsive, and API-contract tests after each replacement.

## After migration

Record wrappers and SCSS removed, JS/CSS deltas, render/accessibility results, missing capabilities, awkward APIs, effort, regressions, and rollback verification. Classify every finding as JRNG defect, JRNG missing feature, application-specific requirement, migration mistake, or documentation gap.
