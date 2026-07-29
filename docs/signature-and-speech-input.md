# Signature and speech input

## Overview and imports

`j-signature` captures consent, approval, and delivery-confirmation signatures
from mouse, touch, or pressure-capable stylus input. Import
`JSignatureComponent` and its value types from `jrng-ui/signature`.

The `jSpeechToText` directive connects native inputs, textareas, `j-input`,
`j-textarea`, and supported `j-editor` content to browser speech recognition.
`j-speech-to-text-button` supplies the explicit microphone action and listening
status. Import the directive, button, service, state types, and
`J_SPEECH_RECOGNITION_FACTORY` from `jrng-ui/speech-to-text`.

## Signature usage and API

Bind Signature with Angular Forms:

```html
<j-signature [(ngModel)]="customerConsent" required ariaLabel="Customer consent signature" />
```

Inputs configure stroke color and width, background, pressure sensitivity,
responsive height, disabled/read-only/required states, the toolbar, and
accessible names. Outputs include `valueChange`, `strokeStart`, `strokeEnd`, and
`cleared`. The value contains normalized points, so strokes survive responsive
and high-DPI resizing.

Public methods include `undo()`, `redo()`, `clear()`, `reset()`,
`importValue()`, `value()`, `toPNG()`, `toSVG()`, `toBlob()`, and
`toBase64()`. PNG/Base64 exports are data URLs; Blob defaults to PNG. SVG output
includes the configured background and vector paths.

The toolbar uses JRNG Buttons and is keyboard accessible. The drawing canvas has
an accessible name and announces capture, undo, redo, clear, import, and
cancellation status. Disabled and read-only states retain the signature but
block drawing and toolbar changes. `required` returns the Angular
`{ required: true }` validation error while empty.

## Speech usage and API

Speech Recognition never requests microphone access during construction.
Starting requires a user-triggered call:

```html
<j-textarea jSpeechToText #speech="jSpeechToText" label="Customer note" />
<j-speech-to-text-button [target]="speech" showLabel />
```

The directive provides `start()`, `stop()`, `cancel()`, and `restart()`.
Configure language, continuous or single-result behavior, interim results,
append/replace insertion, separator, and disabled state. It emits listening,
interim, final, state, and typed error events. Append mode inserts at the native
caret and preserves surrounding multiline text; replace mode replaces the
editable value.

`JSpeechRecognitionService` exposes signals for support, state, interim and
final transcripts, and error. It maps permission denial, no-speech, network,
audio-device, aborted, and unknown failures. Inject
`J_SPEECH_RECOGNITION_FACTORY` in tests or specialized browser shells.

## Loading, empty, error, and asynchronous states

Signature is empty until a stroke ends; active strokes are discarded on pointer
cancellation. Export methods return an empty string or `null` in SSR.

Speech exposes idle, listening, stopping, permission-denied, unsupported, and
error states. Interim transcript is asynchronous and never committed to the
input. Only final results are inserted, preventing duplicate text. The button
shows listening state, announces interim text, disables itself when unsupported,
and surfaces permission or device errors through its live region.

## Responsive, mobile, RTL, and reduced motion

Signature uses normalized coordinates, ResizeObserver, device-pixel ratio, and
`touch-action: none` only on its canvas. It therefore preserves strokes across
resizing without blocking scrolling elsewhere. Logical layout works in RTL.
There is no required animation.

Speech uses the browser's recognition language rather than text direction.
Caret insertion follows the input's native RTL and multiline behavior. The
button uses standard JRNG responsive, high-contrast, focus, and reduced-motion
behavior.

## SSR, hydration, privacy, and browser support

Both entrypoints are safe to inject and render during SSR. Signature initializes
Canvas and ResizeObserver only after browser rendering and disconnects observers
on destroy. Speech's injectable factory returns an unsupported fallback outside
the browser and disposes recognition callbacks on stop, cancel, restart, and
destroy.

Browser speech recognition availability and language support vary. Treat
Speech To Text as progressive enhancement and always keep keyboard input
available. Explain microphone use before activation, avoid starting
automatically, and do not persist audio or transcripts without the application's
privacy consent.

## Theming

Signature uses JRNG semantic surface, border, text, focus, radius, spacing, and
disabled tokens. It supports Default, Material, and Nexus presets; light, dark,
system, high-contrast, and print output. Speech Button reuses JRNG Button
variants and danger semantics for errors.

## Testing guidance

For Signature, test forms write/disabled/required behavior, mouse/touch/stylus
pointer paths, pressure, cancellation, undo/redo, imports, every export format,
resize preservation, DPR rendering, read-only state, ARIA, and observer cleanup.

For Speech, inject a deterministic fake factory. Test no permission request
before `start`, option forwarding, interim/final ordering, append and replace
caret insertion, restart races, all error mappings, unsupported and denied
states, button keyboard activation/live announcements, SSR, and callback cleanup.

## FAQ

**Can Signature import a PNG?** Import the normalized `JSignatureValue` for an
editable signature. Display an external PNG as read-only application content.

**Does Speech To Text work in every browser?** No. The unsupported state is a
normal progressive-enhancement path.

**Can dictation start automatically?** No. Start only from explicit user action
so microphone permission and privacy expectations remain clear.

## Changelog

Introduced Signature and Speech To Text in the advanced input phase.
