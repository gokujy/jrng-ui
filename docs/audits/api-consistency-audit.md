# Public API consistency audit

Verdict: **PASS WITH DOCUMENTED LIMITATIONS**

The final shared vocabularies are JComponentSize, JSeverity, JDensity, JOrientation, JPosition, and JShape. Removed values and aliases are not accepted.

| Component/entrypoint | Current API | Final API  | Action                 |
| -------------------- | ----------- | ---------- | ---------------------- |
| autocomplete         | error (1)   | danger     | Normalize and document |
| calendar             | row (2)     | horizontal | Normalize and document |
| chart                | error (1)   | danger     | Normalize and document |
| checkbox             | error (1)   | danger     | Normalize and document |
| chips                | error (1)   | danger     | Normalize and document |
| color-picker         | error (1)   | danger     | Normalize and document |
| copy-button          | error (1)   | danger     | Normalize and document |
| core                 | error (1)   | danger     | Normalize and document |
| data-display         | error (1)   | danger     | Normalize and document |
| data-display         | medium (2)  | md         | Normalize and document |
| data-grid            | error (1)   | danger     | Normalize and document |
| date-picker          | error (1)   | danger     | Normalize and document |
| date-picker          | row (2)     | horizontal | Normalize and document |
| diff-viewer          | row (1)     | horizontal | Normalize and document |
| empty-state          | error (1)   | danger     | Normalize and document |
| error-page           | error (1)   | danger     | Normalize and document |
| file-browser         | medium (1)  | md         | Normalize and document |
| file-upload          | error (4)   | danger     | Normalize and document |
| form-field           | error (1)   | danger     | Normalize and document |
| formatting           | medium (2)  | md         | Normalize and document |
| html-preview         | error (1)   | danger     | Normalize and document |
| icon                 | error (1)   | danger     | Normalize and document |
| input                | error (1)   | danger     | Normalize and document |
| input-mask           | error (1)   | danger     | Normalize and document |
| input-number         | error (1)   | danger     | Normalize and document |
| input-otp            | error (1)   | danger     | Normalize and document |
| kanban               | column (1)  | vertical   | Normalize and document |
| label                | error (2)   | danger     | Normalize and document |
| listbox              | error (1)   | danger     | Normalize and document |
| multiselect          | error (1)   | danger     | Normalize and document |
| notification-center  | error (1)   | danger     | Normalize and document |
| notification-center  | medium (1)  | md         | Normalize and document |
| password             | error (1)   | danger     | Normalize and document |
| password             | medium (2)  | md         | Normalize and document |
| radio-group          | error (1)   | danger     | Normalize and document |
| select               | error (1)   | danger     | Normalize and document |
| skeleton             | row (1)     | horizontal | Normalize and document |
| slider               | error (1)   | danger     | Normalize and document |
| table                | error (1)   | danger     | Normalize and document |
| table                | error (8)   | danger     | Normalize and document |
| table                | error (1)   | danger     | Normalize and document |
| table                | row (1)     | horizontal | Normalize and document |
| table                | row (3)     | horizontal | Normalize and document |
| table                | row (2)     | horizontal | Normalize and document |
| table                | row (2)     | horizontal | Normalize and document |
| textarea             | error (1)   | danger     | Normalize and document |
| time-picker          | error (1)   | danger     | Normalize and document |
| toast                | error (4)   | danger     | Normalize and document |
| tour                 | error (3)   | danger     | Normalize and document |
| tour                 | error (2)   | danger     | Normalize and document |
| tree-table           | row (3)     | horizontal | Normalize and document |
| validation-message   | error (2)   | danger     | Normalize and document |

variant is presentation, mode is behavior, orientation is direction, and type is reserved for true content or control types. Any remaining inconsistency is release-blocking.
