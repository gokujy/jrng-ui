import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import {
  jSchedulerParseRecurrenceRule,
  jSchedulerRecurrenceSummary,
  jSchedulerSerializeRecurrenceRule,
} from './engine/recurrence-engine';
import { JSchedulerRecurrenceFrequency, JSchedulerRecurrenceRule } from './scheduler.models';

@Component({
  selector: 'j-recurrence-editor',
  template: `
    <fieldset class="j-recurrence-editor" [disabled]="disabled()" data-j-slot="recurrence-editor">
      <legend>{{ ariaLabel() }}</legend>
      <label>
        Repeats
        <select [value]="value()?.frequency ?? 'never'" (change)="setFrequency($event)">
          <option value="never">Never</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      @if (value(); as rule) {
        <label>
          Repeat every
          <input
            type="number"
            min="1"
            max="999"
            [value]="rule.interval ?? 1"
            [readonly]="readonly()"
            (input)="setInterval($event)"
          />
          {{ unitLabel(rule.frequency) }}
        </label>
        @if (rule.frequency === 'weekly') {
          <div class="j-recurrence-editor__weekdays" role="group" aria-label="Repeat on weekdays">
            @for (day of weekdays(); track day.value) {
              <label>
                <input
                  type="checkbox"
                  [checked]="rule.weekdays?.includes(day.value)"
                  [disabled]="readonly()"
                  (change)="toggleWeekday(day.value)"
                />
                {{ day.label }}
              </label>
            }
          </div>
        }
        @if (rule.frequency === 'monthly' || rule.frequency === 'yearly') {
          <label>
            Day of month
            <input
              type="number"
              min="1"
              max="31"
              [value]="rule.monthDay ?? startDate().getDate()"
              [readonly]="readonly()"
              (input)="setMonthDay($event)"
            />
          </label>
        }
        @if (rule.frequency === 'yearly') {
          <label>
            Month
            <input
              type="number"
              min="1"
              max="12"
              [value]="rule.month ?? startDate().getMonth() + 1"
              [readonly]="readonly()"
              (input)="setMonth($event)"
            />
          </label>
        }
        <label>
          Ends
          <select [value]="endMode()" [disabled]="readonly()" (change)="setEndMode($event)">
            <option value="never">Never</option>
            <option value="count">After a number of occurrences</option>
            <option value="until">On a date</option>
          </select>
        </label>
        @if (endMode() === 'count') {
          <label>
            Occurrences
            <input
              type="number"
              min="1"
              [value]="rule.count ?? 1"
              [readonly]="readonly()"
              (input)="setCount($event)"
            />
          </label>
        }
        @if (endMode() === 'until') {
          <label>
            End date
            <input
              type="date"
              [min]="dateInput(startDate())"
              [value]="dateInput(rule.until ?? startDate())"
              [readonly]="readonly()"
              (input)="setUntil($event)"
            />
          </label>
        }
      }
      <p class="j-recurrence-editor__summary" aria-live="polite">{{ summary() }}</p>
      @if (!valid()) {
        <p class="j-recurrence-editor__error" role="alert">Choose at least one weekday.</p>
      }
    </fieldset>
  `,
  styleUrl: './recurrence-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JRecurrenceEditorComponent {
  readonly value = model<JSchedulerRecurrenceRule | null>(null);
  readonly startDate = input(new Date());
  readonly locale = input('en-US');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly ariaLabel = input('Recurrence');
  readonly validityChange = output<boolean>();
  readonly endMode = computed<'never' | 'count' | 'until'>(() =>
    this.value()?.count ? 'count' : this.value()?.until ? 'until' : 'never',
  );
  readonly weekdays = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, value) => ({
      value,
      label: formatter.format(new Date(2026, 7, 2 + value)),
    }));
  });
  readonly valid = computed(() => {
    const rule = this.value();
    return !rule || rule.frequency !== 'weekly' || !!rule.weekdays?.length;
  });
  readonly summary = computed(() =>
    this.value() ? jSchedulerRecurrenceSummary(this.value()!, this.locale()) : 'Does not repeat',
  );

  parse(value: string): boolean {
    const rule = jSchedulerParseRecurrenceRule(value);
    if (!rule) return false;
    this.commit(rule);
    return true;
  }

  toRRule(): string | null {
    return this.value() ? jSchedulerSerializeRecurrenceRule(this.value()!) : null;
  }

  setFrequency(event: Event): void {
    if (this.readonly()) return;
    const frequency = (event.target as HTMLSelectElement).value;
    this.commit(
      frequency === 'never'
        ? null
        : {
            frequency: frequency as JSchedulerRecurrenceFrequency,
            interval: 1,
            weekdays: frequency === 'weekly' ? [this.startDate().getDay()] : undefined,
          },
    );
  }

  setInterval(event: Event): void {
    this.patch({ interval: positiveInput(event, 1) });
  }
  setMonthDay(event: Event): void {
    this.patch({ monthDay: Math.min(31, positiveInput(event, 1)) });
  }
  setMonth(event: Event): void {
    this.patch({ month: Math.min(12, positiveInput(event, 1)) });
  }
  setCount(event: Event): void {
    this.patch({ count: positiveInput(event, 1), until: undefined });
  }
  setUntil(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsDate;
    if (value) this.patch({ until: value, count: undefined });
  }
  setEndMode(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value;
    this.patch(
      mode === 'count'
        ? { count: 1, until: undefined }
        : mode === 'until'
          ? { count: undefined, until: new Date(this.startDate()) }
          : { count: undefined, until: undefined },
    );
  }
  toggleWeekday(day: number): void {
    if (this.readonly()) return;
    const current = this.value()?.weekdays ?? [];
    this.patch({
      weekdays: current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort(),
    });
  }
  unitLabel(frequency: JSchedulerRecurrenceFrequency): string {
    return { daily: 'day(s)', weekly: 'week(s)', monthly: 'month(s)', yearly: 'year(s)' }[
      frequency
    ];
  }
  dateInput(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  private patch(changes: Partial<JSchedulerRecurrenceRule>): void {
    if (this.readonly() || !this.value()) return;
    this.commit({ ...this.value()!, ...changes });
  }
  private commit(value: JSchedulerRecurrenceRule | null): void {
    this.value.set(value);
    queueMicrotask(() => this.validityChange.emit(this.valid()));
  }
}

function positiveInput(event: Event, fallback: number): number {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}
