# JR UI

JR UI is a lightweight Angular standalone component library for ERP, admin panels,
dashboards, and business applications.

Package name: `jrng-ui`

Repository: https://github.com/gokujy/jrng-ui

## Installation

Publishing is not configured yet. After publishing, install with:

```bash
npm install jrng-ui
```

Inside this workspace, build the library first so the local `jrng-ui` path alias
resolves from `dist/jr/jrng-ui`.

```ts
import { ButtonComponent } from 'jrng-ui/button';
```

## Theme Setup

Add the JR UI theme once in your global stylesheet:

```scss
@use 'jrng-ui/theme';
```

The default theme is light. Wrap any section or app root with `.jr-dark` to use
dark tokens.

```html
<section class="jr-dark">
  <jr-button variant="primary">Save</jr-button>
</section>
```

## Usage

Standalone components can be imported directly into Angular components.

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<jr-button variant="primary">Save</jr-button>`,
})
export class ExampleComponent {}
```

```html
<jr-button variant="primary">Save</jr-button>
```

## Phase 1 Components

- `JrButtonComponent` / `jr-button`
- `JrInputComponent` / `jr-input`
- `JrCardComponent` / `jr-card`
- `JrDialogComponent` / `jr-dialog`
- `JrDialogService`
- `JrToastService`
- `JrToastContainerComponent` / `jr-toast-container`

## Development Commands

```bash
npm install
npm start
npm run build
npm run build:lib
npm run build:docs
```

## Testing Commands

```bash
npm test
npm run test:lib
npm run test:docs
```

The docs app imports the local package through secondary entrypoints such as
`jrng-ui/button`, so `npm start`, `npm test`, and the docs-specific scripts build the
library first.

## Workspace

- Library source: `projects/jr/jrng-ui/src/lib`
- Public API: `projects/jr/jrng-ui/src/public-api.ts`
- Docs app: `projects/docs/src/app`
- Theme tokens: `projects/jr/jrng-ui/src/lib/theme/jr-theme.scss`
