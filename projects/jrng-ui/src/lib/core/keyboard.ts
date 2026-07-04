export const J_KEY = {
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  arrowUp: 'ArrowUp',
  backspace: 'Backspace',
  delete: 'Delete',
  end: 'End',
  enter: 'Enter',
  escape: 'Escape',
  home: 'Home',
  space: ' ',
  tab: 'Tab',
} as const;

export type JKeyboardKey = (typeof J_KEY)[keyof typeof J_KEY];
