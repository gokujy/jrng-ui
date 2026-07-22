# Enterprise application patterns

These examples use generic application data. Each preview description is separated from its implementation code. Browser integrations are opt-in adapters; JRNG does not call application or remote APIs.

## Rich editor

### Preview

A full editor with sanitized paste, counts, validation, autosave notification, source mode, and an application-supplied image upload adapter.

### Code

```html
<j-editor
  label="Description"
  toolbar="full"
  [showCharacterCount]="true"
  [showWordCount]="true"
  [showSourceToggle]="true"
  [showFullscreen]="true"
  [maxLength]="4000"
  [autosaveDelay]="1000"
  [imageAdapter]="imageAdapter"
  (autosave)="saveDraft($event)"
/>
```

Content is sanitized on paste, model writes, and visual/source edits. A custom `JEditorSanitizerAdapter` may apply stricter application policy, but consumers remain responsible for validating stored content and setting an appropriate Content Security Policy. JRNG never uses Angular security-bypass APIs.

## HTML and email preview

### Preview

An isolated mobile email preview with source, refresh, copy, print, and application-controlled open/export actions.

### Code

```html
<j-html-preview
  [html]="generatedHtml"
  mode="iframe"
  device="mobile"
  [zoom]="0.9"
  [exportAdapter]="previewExport"
  (openWindow)="openPreview()"
  (print)="printPreview()"
/>
```

Iframe mode is the default and uses an empty `sandbox` plus `no-referrer`. Scripts are removed, no navigation is initiated, and remote content is not fetched by JRNG. Inline mode passes sanitized content through Angular's normal HTML binding.

## Audit history

### Preview

The same generic history can render as a timeline, table, or compact list, with search, pagination, expandable before/after data, and lazy loading.

### Code

```html
<j-timeline [value]="auditEntries" variant="activity" compact />
```

## Object change comparison

### Preview

A side-by-side object comparison masks sensitive values without mutating source data.

### Code

```html
<j-diff-viewer
  mode="object"
  layout="side-by-side"
  [before]="previousValue"
  [after]="currentValue"
  [mask]="maskSensitive"
/>
```

## Review sequence

### Preview

A readonly vertical sequence displays pending, approved, rejected, skipped, and cancelled steps. Parallel groups remain application data; JRNG does not execute workflow actions.

### Code

```html
<j-stepper
  [items]="approvalSteps"
  orientation="vertical"
  [linear]="true"
  [activeIndex]="activeApprovalStep"
>
</j-stepper>
```

## Notification center

### Preview

A popover, drawer, or inline panel supports read state, deletion, filtering, custom actions, loading, errors, and incremental loading.

### Code

```html
<j-notification-center
  [notifications]="notifications"
  layout="drawer"
  [showFilters]="true"
  [infinite]="hasMoreNotifications"
  (markReadChange)="markRead($event)"
  (delete)="deleteNotification($event)"
/>
```

The input is application-owned. JRNG does not open sockets or connect to messaging services.

## Password strength guidance

### Preview

The strength bar and rule checklist provide client-side guidance and integrate with the existing ControlValueAccessor.

### Code

```html
<j-password
  label="Password"
  [feedback]="true"
  [showRules]="true"
  [minimumLength]="12"
  [customRules]="passwordGuidance"
/>
```

Strength feedback is not a cryptographic assessment and must not replace server-side password policy or compromised-password checks.

## Chart interaction and export

### Preview

A chart shows export controls, an accessible summary, and an optional data table. Chart.js remains the optional renderer already used by `j-chart`.

### Code

```html
<j-chart
  [data]="chartData"
  [showActions]="true"
  summary="Monthly totals shown as columns."
  (dataPointClick)="selectPoint($event)"
  (legendClick)="toggleSeries($event)"
>
  <table jChartDataTable>
    <!-- accessible source data -->
  </table>
</j-chart>
```

## Safe highlighting

### Preview

Matching text is emitted as ordinary text nodes and `<mark>` elements, including case- and diacritic-insensitive matching. No HTML input is interpreted.

### Code

```html
<j-highlight
  [text]="result.label"
  [term]="['resume', query]"
  [diacriticInsensitive]="true"
  markClass="search-match"
/>
```

## Clipboard, download, print, and fullscreen

### Preview

Core services return explicit results and safely report unsupported SSR/browser environments.

### Code

```ts
await clipboard.copyStructured(value);
downloads.downloadJson(value, 'record-export.json');
printer.printElement(detailElement, { beforePrint, afterPrint });
await fullscreen.toggle(detailElement);
```

## Accessibility and responsive behavior

All new patterns use semantic buttons, named toolbars and regions, visible focus inherited from JRNG tokens, accessible expansion state, responsive stacking, dark-theme semantic colors, and reduced-motion fallbacks. Applications must provide meaningful actor, action, chart-summary, image-alt, and action labels.
