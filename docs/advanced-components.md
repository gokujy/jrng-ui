# Advanced Components

These components cover common admin panel needs without adding heavy third-party UI dependencies.

## File Upload

```ts
import { JFileUploadComponent } from 'jrng-ui/file-upload';
```

```html
<j-file-upload
  accept=".pdf,.png,.jpg"
  [multiple]="true"
  [maxFileSize]="5_000_000"
  chooseLabel="Choose files"
  uploadLabel="Upload"
  cancelLabel="Clear"
  [auto]="false"
  [customUpload]="true"
  (filesChange)="files = $event"
  (upload)="uploadFiles($event.files)"
  (remove)="removeFile($event)"
/>
```

Supported:

- basic and advanced modes
- `multiple`
- `accept`
- `maxFileSize`
- choose/upload/cancel labels
- `auto`
- `customUpload`
- `filesChange`, `upload`, and `remove`
- drag/drop
- validation messages for file size

## Image and Preview

```ts
import { JImageComponent } from 'jrng-ui/image';
```

```html
<j-image
  src="/assets/profile.png"
  alt="Profile preview"
  width="160px"
  height="120px"
  fallback="/assets/fallback.png"
  preview
/>
```

Standalone preview is also available:

```ts
import { JImagePreviewComponent } from 'jrng-ui/image-preview';
```

```html
<j-image src="/assets/document.png" alt="Document preview" preview />
```

## Avatar Group

```ts
import { JAvatarGroupComponent, JAvatarGroupItem } from 'jrng-ui/avatar-group';

users: readonly JAvatarGroupItem[] = [
  { label: 'User Alpha', image: '/assets/user-alpha.png' },
  { label: 'User Beta' },
  { label: 'User Gamma' },
];
```

```html
<j-avatar-group [items]="users" size="md" [max]="3" ariaLabel="Assigned users" />
```

## Copy Button

```ts
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
```

```html
<j-copy-button text="REC-2026-001" ariaLabel="Copy record number" (copied)="showCopied($event)" />
```

## Status Chip

```ts
import { JStatusChipComponent } from 'jrng-ui/status-chip';
```

```html
<j-status-chip label="Approved" severity="success" />
<j-status-chip label="Pending" severity="warning" />
<j-status-chip label="Rejected" severity="danger" />
```

## Color Picker

```ts
import { JColorPickerComponent } from 'jrng-ui/color-picker';
```

```html
<j-color-picker label="Brand color" [formControl]="brandColor" (valueChange)="color = $event" />
```

The color picker is a lightweight native color input with optional text input and ControlValueAccessor support.

## Editor

```ts
import { JEditorComponent } from 'jrng-ui/editor';
```

```html
<j-editor label="Notes" placeholder="Enter private notes" [formControl]="notes" />
```

`j-editor` is a dependency-free contenteditable rich-text control. HTML mode sanitizes initial values, programmatic updates, user edits, and paste through the same allowlist; text mode preserves literal text. It supports Reactive Forms and `ngModel`, independent readonly and disabled states, touched tracking, and an isolated command adapter for bold, italic, underline, lists, links, undo, and redo.

## Pending Items

- File upload transport implementation for non-custom uploads
- File type validation beyond browser `accept`
- Image zoom controls and rotation
- Rich text toolbar/editor engine
- Color format conversion helpers beyond native hex values
