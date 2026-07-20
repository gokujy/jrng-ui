# JRNG UI

[![npm version](https://img.shields.io/npm/v/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![npm downloads](https://img.shields.io/npm/dm/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![build](https://github.com/gokujy/jrng-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/gokujy/jrng-ui/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/jrng-ui.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/gokujy/jrng-ui.svg)](https://github.com/gokujy/jrng-ui/issues)
[![Angular 21.2](https://img.shields.io/badge/Angular-21.2%20verified-DD0031.svg)](#angular-compatibility)

**JRNG UI — A modern Angular component library for admin panels, dashboards and business applications.**

JRNG UI provides standalone Angular components for business interfaces: advanced data components, accessible overlays and forms, responsive layouts, theme customization, modular imports, SSR-safe behavior, and zoneless-friendly APIs.

## Get started

Install the package:

```bash
npm install jrng-ui
```

Add the theme once in `src/styles.scss`:

```scss
@use 'jrng-ui/styles';
```

Import and render a standalone component:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-root',
  imports: [JButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<j-button label="Create report" (onClick)="createReport()" />`,
})
export class App {
  createReport(): void {
    // Start the application workflow.
  }
}
```

Run the Angular application:

```bash
npm start
```

See the [complete Getting Started guide](https://jrngui.dev/docs), [component index](https://jrngui.dev/docs/components), and [live examples](https://jrngui.dev/examples).

## Why JRNG UI

- Angular standalone components, directives, pipes, and services
- Admin panel, dashboard, and business application components
- Advanced tables, data grids, filters, charts, and business metrics
- Token-driven light and dark themes with runtime customization
- Keyboard, focus, ARIA, and reduced-motion accessibility support
- SSR-safe browser integrations
- Zoneless-friendly state and event handling
- Modular secondary entrypoints such as `jrng-ui/button`
- Responsive application shells and layouts
- Reactive Forms support where form controls apply

## Angular compatibility

Only versions exercised by the project build and test workflow are listed.

| JRNG UI version | Supported Angular versions |
| --------------- | -------------------------- |
| 0.1.0 (current) | Angular 21.2.x             |

Required runtime peers are Angular common, core, forms, and platform-browser. Router and Chart.js are optional peers for features that use them; Tour Guide is native JRNG UI.

## Theme setup

Use Sass:

```scss
@use 'jrng-ui/styles';
```

Or add compiled CSS to `angular.json`:

```json
{
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.scss"]
}
```

Dark mode can be applied with the `j-dark` class or managed with `JThemeService`.

## Resources

- [Get Started](https://jrngui.dev/docs)
- [View Components](https://jrngui.dev/docs/components)
- [Live Examples](https://jrngui.dev/examples)
- [GitHub](https://github.com/gokujy/jrng-ui)
- [npm](https://www.npmjs.com/package/jrng-ui)
- [Support](SUPPORT.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)

## Maintainer repository topics

Recommended GitHub topics: `angular`, `angular-components`, `ui-library`, `component-library`, `design-system`, `admin-dashboard`, `business-ui`, `typescript`, `accessible-components`, `standalone-components`.

## License

MIT
