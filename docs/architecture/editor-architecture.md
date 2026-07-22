# Editor architecture

Editor is an adapter-driven rich-text control. Toolbar groups, output format, upload, drafts, and future comments/mentions/collaboration hooks are typed configuration rather than mandatory cloud dependencies.

HTML input, paste, source view, and output pass through the same allowlist sanitizer. Scripts, inline event handlers, unsafe URLs, and unrestricted embeds are removed; source text is never trusted or executed automatically. No generic security bypass is used.

The editor implements the final forms contract, initializes only in a browser, emits typed ready/selection/save/upload/error events, and destroys command, selection, observer, and adapter resources with the component.
