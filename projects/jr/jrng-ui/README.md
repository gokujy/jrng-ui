# JR UI Angular

Standalone Angular UI components for ERP, admin panels, dashboards, and business
applications.

Repository: https://github.com/gokujy/jrng-ui

```bash
npm install jrng-ui
```

```ts
import { ButtonComponent } from 'jrng-ui/button';
```

```html
<jr-button variant="primary">Save</jr-button>
```

Theme:

```scss
@use 'jrng-ui/theme';
```

Components exported in Phase 1:

- Button
- Input
- Card
- Dialog / Modal
- Toast / Message

Development:

```bash
npm run build:lib
npm run test:lib
```
