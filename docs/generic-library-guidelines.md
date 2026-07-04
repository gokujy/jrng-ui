# Generic Library Guidelines

JRNG UI is a generic, premium Angular UI component library. Code, docs, examples,
and showcase pages must stay reusable across applications and teams.

## No Project-Specific References

Do not include app names, company names, client names, internal project names,
private domain names, real people, or organization-specific workflows in code,
docs, comments, examples, route labels, screenshots, prompts, or component
descriptions.

Use neutral examples such as:

- User
- Product
- Customer
- Order
- Invoice
- Project
- Task
- Team

## Original Design Rule

JRNG UI must use original implementation and original styling. Modern dashboard
and application UI patterns are acceptable inspiration, but code, CSS, examples,
docs, naming, and visual design must be JRNG-owned.

## Selector Rule

Public component selectors must use the `j-` prefix:

- `j-button`
- `j-input`
- `j-card`
- `j-dialog`
- `j-toast`

Do not document or introduce `jr-*` selectors.

## CSS Class Rule

Component and global CSS classes must use the `.j-*` prefix. State classes such
as `.is-active`, `.is-disabled`, `.is-loading`, and `.is-invalid` are allowed.

Avoid unscoped generic global classes such as `.button`, `.card`, `.grid`, or
`.flex` in library code.

## Generic Examples Rule

Examples should use neutral entities and values. Prefer names like `User Alpha`,
`Product Beta`, `Order 1001`, `Invoice 1001`, `Project Alpha`, or `Task Beta`.

Use generic domains such as `example.com` for email examples.

## Event Naming Rule

Docs should prefer simple event names:

- `clicked`
- `valueChange`
- `selectionChange`
- `opened`
- `closed`
- `clear`
- `remove`
- `pageChange`
- `sortChange`

Do not document deprecated or unusual event names for new examples.

## No External Library Copying

Do not copy source code, CSS, docs, examples, branding, naming, or exact visual
design from any external UI library. Do not describe JRNG UI as a clone,
wrapper, or adapter layer for another component library.
