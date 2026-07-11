export type JTourSide = 'top' | 'right' | 'bottom' | 'left' | 'over';
export type JTourAlign = 'start' | 'center' | 'end';
export type JTourButton = 'next' | 'previous' | 'close';
export type JTourEventType =
  | 'start'
  | 'next'
  | 'previous'
  | 'complete'
  | 'skip'
  | 'destroy'
  | 'highlightStarted'
  | 'deselected'
  | 'error';

export interface JTourStep {
  readonly id?: string;
  readonly element?: string | Element;
  readonly title?: string;
  readonly description?: string;
  readonly side?: JTourSide;
  readonly align?: JTourAlign;
  readonly popoverClass?: string;
  readonly disableButtons?: readonly JTourButton[];
  readonly nextText?: string;
  readonly previousText?: string;
  readonly doneText?: string;
  readonly closeText?: string;
}

export type JTourStepInput = string | JTourStep;

export interface JTourEvent {
  readonly type: JTourEventType;
  readonly tourId?: string;
  readonly step?: JTourStep;
  readonly index: number;
  readonly error?: string;
}

export interface JTourConfig {
  readonly id?: string;
  readonly steps: readonly JTourStepInput[];
  readonly animate?: boolean;
  readonly allowClose?: boolean;
  readonly smoothScroll?: boolean;
  readonly showProgress?: boolean;
  readonly overlayColor?: string;
  readonly stagePadding?: number;
  readonly stageRadius?: number;
  readonly popoverClass?: string;
  readonly nextText?: string;
  readonly previousText?: string;
  readonly doneText?: string;
  readonly closeText?: string;
  readonly onStart?: (event: JTourEvent) => void;
  readonly onNext?: (event: JTourEvent) => void;
  readonly onPrevious?: (event: JTourEvent) => void;
  readonly onComplete?: (event: JTourEvent) => void;
  readonly onSkip?: (event: JTourEvent) => void;
  readonly onDestroy?: (event: JTourEvent) => void;
  readonly onHighlightStarted?: (event: JTourEvent) => void;
  readonly onDeselected?: (event: JTourEvent) => void;
  readonly onError?: (event: JTourEvent) => void;
}

export type JTourDefaults = Omit<Partial<JTourConfig>, 'id' | 'steps'>;
