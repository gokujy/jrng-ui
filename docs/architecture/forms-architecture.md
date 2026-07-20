# Forms architecture

JRNG form controls implement the Angular ControlValueAccessor contract with a single value transition per user action. `writeValue` normalizes null without emitting, `setDisabledState` updates explicit component state, blur propagates touched, and reset restores the empty value appropriate to the control.

Values and collections are copied before mutation. Readonly permits focus and selection while preventing edits; disabled removes activation and is controlled by both the input and Forms API. Controls expose typed `valueChange` only for intentional user changes and integrate with Form Field and Validation Message through IDs, described-by relationships, invalid state, and projected messages.

Focus work is browser-guarded. No CVA requires Zone.js or mutates caller-owned arrays or objects.

