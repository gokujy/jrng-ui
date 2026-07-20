# Select-family architecture

Select owns single known-option selection; Multiselect owns multiple known-option selection; Autocomplete owns text with suggestions; Combobox owns editable selection; Listbox owns always-visible options. Tree and cascade controls retain their hierarchical behavior.

The family shares normalized option identity and async request types from core. Values are compared without mutating option sources. Select closes on selection by default; Multiselect remains open by default and closes on outside click, Escape, focus-out, route/context destruction, or an explicit completion action.

Trigger, listbox, active option, selected state, keyboard navigation, accessible naming, and disabled/readonly semantics follow the same contract.

