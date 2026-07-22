# Select-family architecture

Select owns single known-option selection, including opt-in searchable, async,
and virtualized modes. Multiselect owns multiple known-option selection;
Autocomplete owns free text with suggestions; Listbox owns always-visible
options. Tree and cascade controls retain their hierarchical behavior. The old
Combobox entry point was consolidated into Select for the 0.1.0 release.

The family shares normalized option identity and async request types from core. Values are compared without mutating option sources. Select closes on selection by default; Multiselect remains open by default and closes on outside click, Escape, focus-out, route/context destruction, or an explicit completion action.

Trigger, listbox, active option, selected state, keyboard navigation, accessible naming, and disabled/readonly semantics follow the same contract.
