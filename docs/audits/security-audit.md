# Security audit

Verdict: **PASS**

Critical: 0. High: 0.

- Editor always applies the JRNG baseline sanitizer after custom sanitizer adapters.
- Preview defaults to an empty iframe sandbox, strips scripts/event handlers, blocks remote sources unless explicitly enabled, and never opens windows itself.
- Highlight renders text nodes and mark elements without HTML concatenation.
- Print sanitizes scripts, event handlers and remote sources.
- Download filenames are sanitized; package validation scans forbidden/private content and exact packed files.
- Optional adapters do not add cloud, export, screenshot, or editor-engine dependencies.
- Package allowlist excludes tests, source maps, apps, audits, prompts, caches and local paths.

SVG/icon registration and file preview remain medium-risk review areas for every future change; no Critical or High exploit was verified in this audit.
