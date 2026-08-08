import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JSelectComponent } from 'jrng-ui/select';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
import { JRecurrenceEditorComponent } from './recurrence-editor.component';
import { jSchedulerParseRecurrenceRule } from './engine/recurrence-engine';
import {
  JSchedulerCategory,
  JSchedulerEvent,
  JSchedulerId,
  JSchedulerRecurrenceRule,
  JSchedulerResource,
} from './scheduler.models';

export interface JSchedulerEventEditorSave {
  readonly event: JSchedulerEvent;
  readonly previousEvent: JSchedulerEvent | null;
}

@Component({
  selector: 'j-scheduler-event-editor',
  imports: [
    ReactiveFormsModule,
    JButtonComponent,
    JCheckboxComponent,
    JDatePickerComponent,
    JInputComponent,
    JSelectComponent,
    JTextareaComponent,
    JTimePickerComponent,
    JRecurrenceEditorComponent,
  ],
  template: `
    <form
      class="j-scheduler-event-editor"
      [formGroup]="form"
      [attr.aria-label]="ariaLabel()"
      (ngSubmit)="save()"
    >
      <j-input
        label="Title"
        formControlName="title"
        required
        width="full"
        [invalid]="form.controls.title.invalid && form.controls.title.touched"
        error="Title is required"
      />
      <div class="j-scheduler-event-editor__columns">
        <j-date-picker label="Start date" formControlName="startDate" required />
        <j-time-picker
          label="Start time"
          formControlName="startTime"
          [disabled]="form.controls.allDay.value"
        />
        <j-date-picker label="End date" formControlName="endDate" required />
        <j-time-picker
          label="End time"
          formControlName="endTime"
          [disabled]="form.controls.allDay.value"
        />
      </div>
      <j-checkbox label="All day" formControlName="allDay" />
      @if (resourceOptions().length) {
        <j-select
          label="Resource"
          [options]="resourceOptions()"
          optionLabel="label"
          optionValue="value"
          formControlName="resourceId"
          clearable
        />
      }
      @if (categoryOptions().length) {
        <j-select
          label="Category"
          [options]="categoryOptions()"
          optionLabel="label"
          optionValue="value"
          formControlName="categoryId"
          clearable
        />
      }
      <j-select
        label="Timezone"
        [options]="timezoneOptions()"
        optionLabel="label"
        optionValue="value"
        formControlName="timezone"
      />
      <div class="j-scheduler-event-editor__columns">
        <j-input label="Location" formControlName="location" width="full" />
        <j-input label="Status" formControlName="status" width="full" />
        <j-input label="Priority" formControlName="priority" width="full" />
        <j-input
          label="Attendee IDs"
          formControlName="attendees"
          hint="Comma-separated IDs"
          width="full"
        />
      </div>
      <j-textarea label="Description" formControlName="description" [rows]="4" />
      @if (showRecurrence()) {
        <j-recurrence-editor
          [value]="recurrence()"
          (valueChange)="recurrence.set($event)"
          [startDate]="form.controls.startDate.value ?? newEventStart()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          ariaLabel="Event recurrence"
        />
      }
      @if (formError()) {
        <p class="j-scheduler-event-editor__error" role="alert">{{ formError() }}</p>
      }
      <footer>
        <j-button label="Save" type="submit" [disabled]="disabled() || readonly()" />
        <j-button label="Cancel" type="button" variant="outlined" (onClick)="cancel.emit()" />
        @if (event() && event()?.deletable !== false && !readonly()) {
          <j-button
            label="Delete"
            type="button"
            severity="danger"
            variant="outlined"
            [disabled]="disabled()"
            (onClick)="deleteRequest.emit(event()!)"
          />
        }
      </footer>
    </form>
  `,
  styleUrl: './event-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerEventEditorComponent {
  readonly event = input<JSchedulerEvent | null>(null);
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly categories = input<readonly JSchedulerCategory[]>([]);
  readonly timezones = input<readonly string[]>(['local', 'UTC']);
  readonly newEventStart = input(new Date());
  readonly showRecurrence = input(true);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly ariaLabel = input('Event editor');
  readonly saveRequest = output<JSchedulerEventEditorSave>();
  readonly deleteRequest = output<JSchedulerEvent>();
  readonly cancel = output<void>();
  readonly recurrence = signal<JSchedulerRecurrenceRule | null>(null);
  readonly formError = signal('');

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    startDate: new FormControl<Date | null>(null, Validators.required),
    startTime: new FormControl('09:00', { nonNullable: true }),
    endDate: new FormControl<Date | null>(null, Validators.required),
    endTime: new FormControl('10:00', { nonNullable: true }),
    allDay: new FormControl(false, { nonNullable: true }),
    resourceId: new FormControl<JSchedulerId | null>(null),
    categoryId: new FormControl<JSchedulerId | null>(null),
    timezone: new FormControl('local', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    attendees: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
    priority: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => this.load(this.event()));
    effect(() => {
      if (this.disabled() || this.readonly()) this.form.disable({ emitEvent: false });
      else this.form.enable({ emitEvent: false });
    });
  }

  resourceOptions(): readonly { readonly label: string; readonly value: JSchedulerId }[] {
    const result: { label: string; value: JSchedulerId }[] = [];
    const visit = (items: readonly JSchedulerResource[], depth: number): void => {
      for (const resource of items) {
        if (!resource.disabled && !resource.hidden)
          result.push({ label: `${'-- '.repeat(depth)}${resource.name}`, value: resource.id });
        visit(resource.children ?? [], depth + 1);
      }
    };
    visit(this.resources(), 0);
    return result;
  }

  categoryOptions() {
    return this.categories()
      .filter((category) => !category.disabled)
      .map((category) => ({ label: category.label, value: category.id }));
  }

  timezoneOptions() {
    return this.timezones().map((timezone) => ({ label: timezone, value: timezone }));
  }

  save(): void {
    this.form.markAllAsTouched();
    this.formError.set('');
    if (this.disabled() || this.readonly() || this.form.invalid) return;
    const value = this.form.getRawValue();
    const start = combine(value.startDate!, value.startTime, value.allDay);
    const end = combine(value.endDate!, value.endTime, value.allDay, true);
    if (end <= start) {
      this.formError.set('End must be after start.');
      return;
    }
    const previous = this.event();
    const event: JSchedulerEvent = {
      ...(previous ?? {}),
      id: previous?.id ?? `event-${start.getTime()}`,
      title: value.title.trim(),
      start,
      end,
      allDay: value.allDay,
      resourceId: value.resourceId ?? undefined,
      categoryId: value.categoryId ?? undefined,
      timezone: value.timezone === 'local' ? undefined : value.timezone,
      location: clean(value.location),
      description: clean(value.description),
      status: clean(value.status),
      priority: clean(value.priority),
      attendees: value.attendees
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => ({ id })),
      recurrenceRule: this.recurrence() ?? undefined,
    };
    this.saveRequest.emit({ event, previousEvent: previous });
  }

  private load(event: JSchedulerEvent | null): void {
    const start = new Date(event?.start ?? this.newEventStart());
    const end = new Date(event?.end ?? start.getTime() + 3_600_000);
    this.form.reset(
      {
        title: event?.title ?? '',
        startDate: new Date(start),
        startTime: timeValue(start),
        endDate: new Date(end),
        endTime: timeValue(end),
        allDay: event?.allDay ?? false,
        resourceId: event?.resourceId ?? null,
        categoryId: event?.categoryId ?? null,
        timezone: event?.timezone ?? 'local',
        location: event?.location ?? '',
        description: event?.description ?? '',
        attendees: event?.attendees?.map((attendee) => attendee.id).join(', ') ?? '',
        status: event?.status ?? '',
        priority: event?.priority ?? '',
      },
      { emitEvent: false },
    );
    this.recurrence.set(
      event?.recurrenceRule ? jSchedulerParseRecurrenceRule(event.recurrenceRule) : null,
    );
    this.formError.set('');
  }
}

function combine(date: Date, time: string, allDay: boolean, end = false): Date {
  if (allDay) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (end ? 1 : 0));
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}
function timeValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
function clean(value: string): string | undefined {
  return value.trim() || undefined;
}
