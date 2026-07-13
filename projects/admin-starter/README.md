# JRNG Angular Admin Starter

A standalone Angular reference application built with JRNG UI for responsive admin panels and business dashboards.

## Installation and development

From the JRNG UI workspace:

```bash
npm install
npm run build:lib
npx ng serve admin-starter
```

Production build:

```bash
npx ng build admin-starter --configuration production
```

Unit tests (Vitest, jsdom):

```bash
npx ng test admin-starter --watch=false
```

## Structure

- `layouts/` contains the reusable responsive application shell.
- `pages/` contains lazy-loaded dashboard, user, account, authentication, and state pages.
- `services/` contains replaceable mock authentication and API services.
- `guards/` protects application routes.
- `models/` contains typed user, metric, and activity records.
- `*.spec.ts` files sit beside each unit and cover routing, the auth guard, mock services, the shell, and every page.

## Themes

The starter imports `jrng-ui/styles` and uses `JThemeService` for light and dark modes. Customize semantic `--j-*` variables in global styles instead of editing component internals.

## Replacing mock services

Keep the public methods and signal-based state shape while replacing `MockAuthService` and `MockAdminApiService` with HTTP-backed implementations. Do not expose tokens or private data in client-side state.

## Adding a page

Create a standalone component, add a lazy `loadComponent` route under the protected shell, then add its navigation item. Use JRNG UI controls for existing component equivalents.

## JRNG UI components used

App Shell, Button, Input, Select, Checkbox, Switch, Page Header, Metric Card, Chart, Table, Dialog confirmation, Toast, Loader, Skeleton, Empty State, and Error Page.
