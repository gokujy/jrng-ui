# JR UI Angular

Standalone Angular UI components for ERP, admin panels, dashboards, and business
applications.

```bash
npm install jr
```

```ts
import { ButtonComponent } from 'jr/button';
```

```html
<jr-button variant="primary">Save</jr-button>
```

Theme:

```scss
@use 'jr/theme';
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
