# Popout window system

## Overview and import

The experimental `jrng-ui/popout` entrypoint moves Angular template, component,
or supported DOM portals into a standard browser window or Document
Picture-in-Picture window. It keeps the existing Angular application,
dependency-injection graph, component lifecycle, and change detection; it does
not bootstrap a second application.

Import `JPopoutService`, `JPopoutRef`, `JPopoutConfig`, `JPopoutComponent`, and
portal types from `jrng-ui/popout` and `jrng-ui/portal`.

## Basic and advanced usage

Open a component after explicit user activation:

```ts
const ref = await popout.open(new JComponentPortal(CustomerDetailComponent), {
  title: 'Customer detail',
  width: 720,
  height: 560,
});
```

Use `JTemplatePortal` for a template with its `ViewContainerRef`, context, and
injector. Use `JDomPortal` only for a real owned element; detaching or closing
restores that element to its original location. `J_POPOUT_REF` is injectable by
component and template portal content for communication and close controls.

`mode` accepts `window`, `picture-in-picture`, or `auto`. Configure size,
explicit left/top or logical corner/center position, title, reusable window
name, resizability, scrollbars, style copying, theme synchronization,
parent-unload cleanup, fallback, and accessible name. `reuse` uses the supplied
name; otherwise each open receives a unique target.

## Reference API and communication

`JPopoutRef` exposes its id, native window, portal instance, mode, state signal,
`closed`, `messageFromParent`, and `messageFromPopout`. Use `postMessage()` for
parent-to-popout messages, `sendToParent()` from portal content, `focus()`, and
`close()`. `JPopoutService.closeAll()` prevents orphan windows during
application-level teardown.

`JPopoutComponent` provides `attach`, `replace`, and `detach` for service
hosting and an `inline` surface for explicit popup-blocked fallbacks. Its
projected-content form is useful for demonstrating the fallback without opening
a window.

## Templates, state, async, and fallback behavior

Window acquisition is asynchronous because Document Picture-in-Picture returns
a promise. State progresses from opening to open, or to inline, blocked,
unsupported, and closed. A blocked popup may render the same portal inline.
With fallback `none`, consumers can render their own error state. Popup and
parent unload events close portal views exactly once.

This system is not a form control. Loading and application error UI belong to
the portal content. Empty content is supported, though a named useful region is
recommended.

## Focus, keyboard, and accessibility

Call `open()` from a named JRNG Button using `(onClick)`. The new window receives
focus after content is attached. Closing restores focus to the previously
focused parent control when it still exists. Window-level keyboard and assistive
technology behavior is browser/operating-system owned; content retains its
Angular keyboard interactions, focus rings, landmarks, and ARIA names. Always
provide a meaningful title and `ariaLabel`.

## Theme and stylesheet synchronization

By default, style and stylesheet nodes are cloned into the popout document.
The service synchronizes root classes, inline CSS variables, direction, and
JRNG theme data attributes. A MutationObserver follows live changes across
Default, Material, and Nexus presets and light, dark, and system modes.
High-contrast behavior follows copied JRNG forced-colors CSS. Disable
`copyStyles` or `syncTheme` only when the popout owns equivalent styling.

## Responsive, mobile, RTL, and reduced motion

Size is constrained to a usable minimum. Positions use logical configuration
but map to screen coordinates. Document direction is copied for RTL. Portal
content owns responsive/mobile behavior and reduced-motion rules. Standard
popup windows are often restricted on mobile, so provide an inline or in-page
Dialog fallback.

## SSR, hydration, and cleanup

The injectable window adapter returns an unsupported result during SSR.
Rendering `j-popout` is SSR-safe, and `open()` never reads a browser global
without a platform guard. Portal views stay attached to the original
ApplicationRef and are destroyed on close. Style observers, message listeners,
parent/popup unload listeners, dynamic hosts, and DOM placeholders are cleaned
up. Hydration should render the parent action first and open only after user
activation.

## Testing guidance

Inject `J_POPOUT_WINDOW_ADAPTER` with deterministic fake standard and
Picture-in-Picture windows. Test popup blocking, unsupported SSR, size/features,
reuse naming, every portal type, injector preservation, lifecycle destruction,
DOM restoration, bidirectional messages, focus restoration, theme mutations,
parent/popup unload, idempotent close, and `closeAll`. Run real-browser checks
for popup policies, stylesheet loading, Default/Material/Nexus theme changes,
RTL, and Document Picture-in-Picture capability.

## Browser limitations

Document Picture-in-Picture is capability-detected and is not available in all
browsers. Popup blockers may reject standard windows unless `open()` is reached
directly from a user gesture. Cross-origin stylesheet rules remain subject to
browser security policies, though linked stylesheets are cloned by URL.
Operating systems differ in window placement and focus behavior. For these
reasons the entrypoint is experimental.

## FAQ

**Does Popout create another Angular app?** No. It moves portal root nodes while
the original Angular view remains attached to the current application.

**What happens to DOM content on close?** `JDomPortal` restores it beside its
original placeholder.

**How should popup blocking be handled?** Prefer `fallback: 'inline'` or show a
Dialog with the same task.

## Changelog

Introduced the experimental Portal-based Popout window system in the advanced
overlay phase.
