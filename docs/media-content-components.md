# Media And Content Components

jrng-ui includes generic content and media components for editors, uploads, image browsing, carousels, video, and file previews. Components are standalone, token-styled, and do not require a UI framework dependency.

## Editor

`j-editor` is a dependency-free rich text editor built on native editable content. It supports CVA, disabled and readonly states, placeholder text, HTML output by default, and a toolbar for common formatting.

```ts
import { JEditorComponent } from 'jrng-ui/editor';
```

```html
<j-editor
  label="Project notes"
  placeholder="Write notes..."
  formControlName="notes"
  hint="Supports rich text formatting."
/>
```

Toolbar actions include bold, italic, underline, strike, headings, ordered list, unordered list, link, image URL insertion, code block, blockquote, and clear formatting. Use `#jEditorToolbar` to provide a custom toolbar template when needed.

Initial `ngModel` and Reactive Forms values are sanitized before rendering, including values written before view initialization. `writeValue` never emits `valueChange`; user input emits once and blur marks the control touched. Scripts, event handlers, styles, executable embeds, unsupported elements, and unsafe URL protocols are removed. The editor is safe to render on the server; browser editing commands run only after a capability check.

## Dropzone

`j-dropzone` is a focused drag and drop primitive for custom upload flows.

```ts
import { JDropzoneComponent } from 'jrng-ui/dropzone';
```

```html
<j-dropzone
  multiple
  accept="image/*,.pdf"
  [maxFileSize]="5000000"
  (upload)="uploadFiles($event.files)"
  (remove)="removeFile($event)"
/>
```

It supports drag and drop, multiple files, accept rules, max size validation, selected file preview rows, remove actions, and a custom upload event.

## File Upload

`j-file-upload` supports basic and advanced modes, queue management, progress, cancel, retry, validation, and custom upload.

```ts
import { JFileUploadComponent } from 'jrng-ui/file-upload';
```

```html
<j-file-upload
  mode="advanced"
  multiple
  accept=".pdf,image/*"
  [maxFileSize]="10000000"
  (upload)="startUpload($event)"
  (cancelUpload)="cancelUpload($event.item)"
  (retryUpload)="retryUpload($event.item)"
/>
```

Use component methods such as `setProgress(itemId, progress)` and `setError(itemId, message)` to reflect custom upload progress.

## Image And Preview

```ts
import { JImageComponent, JImagePreviewComponent } from 'jrng-ui/image';
```

```html
<j-image
  src="/assets/product.png"
  alt="Product image"
  width="320px"
  height="200px"
  preview
  fallback="/assets/fallback.png"
/>
```

`j-image` supports preview, fallback source, lazy or eager loading, and object-fit styling. `j-image-preview` can also be used directly with two-way `visible` binding.

## Gallery

```ts
import { JGalleryComponent, JGalleryItem } from 'jrng-ui/gallery';

readonly images: JGalleryItem[] = [
  { src: '/assets/project-1.jpg', alt: 'Project image', caption: 'Project overview' },
  { src: '/assets/project-2.jpg', alt: 'Project detail', caption: 'Task detail' },
];
```

```html
<j-gallery [value]="images" />
```

`j-gallery` supports image lists, thumbnails, preview, and keyboard next or previous navigation while preview is open.

## Carousel

```ts
import { JCarouselComponent, JCarouselItem } from 'jrng-ui/carousel';

readonly items: JCarouselItem[] = [
  { title: 'Product update', description: 'New product metrics are available.', image: '/assets/product.jpg' },
  { title: 'Customer report', description: 'Customer activity has changed.', image: '/assets/customer.jpg' },
];
```

```html
<j-carousel [value]="items" autoplay [interval]="5000" [visibleItems]="1" />
```

`j-carousel` supports autoplay, controls, indicators, responsive item counts, and custom item templates with `#jCarouselItem`.

## Video Player

```ts
import { JVideoPlayerComponent } from 'jrng-ui/video-player';
```

```html
<j-video-player
  src="/assets/project-demo.mp4"
  poster="/assets/project-poster.jpg"
  caption="Project demo"
/>
```

`j-video-player` wraps native video with token styling and exposes play, pause, and ended outputs.

## File Preview

```ts
import { JFilePreviewComponent } from 'jrng-ui/file-preview';
```

```html
<j-file-preview
  fileName="invoice.pdf"
  [fileSize]="245000"
  description="Invoice attachment"
  url="/files/invoice.pdf"
/>
```

`j-file-preview` displays file name, extension, size, description, open link, and remove action.

## Design Rules

Use only generic examples such as User, Product, Customer, Order, Invoice, Project, Task, and Team. Do not copy editor, uploader, gallery, or carousel source code, CSS, docs, examples, naming, or exact visual design from external libraries. Component selectors use the `j-*` prefix and CSS classes use the `.j-*` prefix.
