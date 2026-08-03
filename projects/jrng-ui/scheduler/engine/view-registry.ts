import { JSchedulerView } from '../scheduler.models';

export type JSchedulerViewFamily = 'month' | 'timeGrid' | 'agenda' | 'year' | 'timeline';

export interface JSchedulerViewDefinition {
  readonly view: JSchedulerView;
  readonly label: string;
  readonly family: JSchedulerViewFamily;
  readonly supportsDrag: boolean;
  readonly supportsResize: boolean;
  readonly supportsResources: boolean;
  readonly timeline: boolean;
}

const STANDARD: readonly JSchedulerViewDefinition[] = [
  {
    view: 'month',
    label: 'Month',
    family: 'month',
    supportsDrag: true,
    supportsResize: false,
    supportsResources: false,
    timeline: false,
  },
  {
    view: 'week',
    label: 'Week',
    family: 'timeGrid',
    supportsDrag: true,
    supportsResize: true,
    supportsResources: false,
    timeline: false,
  },
  {
    view: 'day',
    label: 'Day',
    family: 'timeGrid',
    supportsDrag: true,
    supportsResize: true,
    supportsResources: false,
    timeline: false,
  },
  {
    view: 'agenda',
    label: 'Agenda',
    family: 'agenda',
    supportsDrag: false,
    supportsResize: false,
    supportsResources: false,
    timeline: false,
  },
  {
    view: 'year',
    label: 'Year',
    family: 'year',
    supportsDrag: false,
    supportsResize: false,
    supportsResources: false,
    timeline: false,
  },
];

const VIEW_NAMES: readonly JSchedulerView[] = [
  'timelineDay',
  'timelineWeek',
  'timelineMonth',
  'timelineYear',
  'resourceDay',
  'resourceWeek',
  'resourceMonth',
  'resourceTimelineDay',
  'resourceTimelineWeek',
  'resourceTimelineMonth',
  'dateDay',
  'dateWeek',
  'dateMonth',
];

export const J_SCHEDULER_VIEW_REGISTRY: ReadonlyMap<JSchedulerView, JSchedulerViewDefinition> =
  new Map([
    ...STANDARD.map((definition) => [definition.view, definition] as const),
    ...VIEW_NAMES.map((view) => {
      const timeline = view.includes('Timeline') || view.startsWith('timeline');
      const resource = view.startsWith('resource');
      const month = view.endsWith('Month');
      const definition: JSchedulerViewDefinition = {
        view,
        label: view.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase()),
        family: timeline ? 'timeline' : month ? 'month' : 'timeGrid',
        supportsDrag: true,
        supportsResize: !month,
        supportsResources: resource,
        timeline,
      };
      return [view, definition] as const;
    }),
  ]);

export function jSchedulerViewDefinition(view: JSchedulerView): JSchedulerViewDefinition {
  return J_SCHEDULER_VIEW_REGISTRY.get(view) ?? J_SCHEDULER_VIEW_REGISTRY.get('month')!;
}
