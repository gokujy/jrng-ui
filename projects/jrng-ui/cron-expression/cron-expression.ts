export type JCronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export interface JCronFieldDefinition {
  readonly name: JCronFieldName;
  readonly label: string;
  readonly minimum: number;
  readonly maximum: number;
}

export interface JCronParts {
  readonly minute: string;
  readonly hour: string;
  readonly dayOfMonth: string;
  readonly month: string;
  readonly dayOfWeek: string;
}

export interface JCronIssue {
  readonly field: JCronFieldName | 'expression';
  readonly token: string;
  readonly message: string;
}

export interface JCronParseResult {
  readonly valid: boolean;
  readonly expression: string;
  readonly parts: JCronParts | null;
  readonly issues: readonly JCronIssue[];
  readonly shortcut?: string;
}

export const J_CRON_FIELDS: readonly JCronFieldDefinition[] = [
  { name: 'minute', label: 'Minute', minimum: 0, maximum: 59 },
  { name: 'hour', label: 'Hour', minimum: 0, maximum: 23 },
  { name: 'dayOfMonth', label: 'Day of month', minimum: 1, maximum: 31 },
  { name: 'month', label: 'Month', minimum: 1, maximum: 12 },
  { name: 'dayOfWeek', label: 'Day of week', minimum: 0, maximum: 7 },
];

export const J_CRON_SHORTCUTS: Readonly<Record<string, string>> = {
  '@hourly': '0 * * * *',
  '@daily': '0 0 * * *',
  '@weekly': '0 0 * * 0',
  '@monthly': '0 0 1 * *',
};

export function jParseCronExpression(value: string): JCronParseResult {
  const raw = String(value ?? '').trim();
  const shortcutExpression = J_CRON_SHORTCUTS[raw];
  const expanded = shortcutExpression ?? raw.replace(/\s+/g, ' ');
  const tokens = expanded ? expanded.split(' ') : [];
  if (tokens.length !== 5) {
    return {
      valid: false,
      expression: raw,
      parts: null,
      issues: [
        {
          field: 'expression',
          token: raw,
          message: 'Use exactly five fields: minute hour day-of-month month day-of-week.',
        },
      ],
    };
  }

  const issues = J_CRON_FIELDS.flatMap((field, index) => validateField(tokens[index] ?? '', field));
  const parts: JCronParts = {
    minute: tokens[0] ?? '*',
    hour: tokens[1] ?? '*',
    dayOfMonth: tokens[2] ?? '*',
    month: tokens[3] ?? '*',
    dayOfWeek: tokens[4] ?? '*',
  };
  return {
    valid: issues.length === 0,
    expression: issues.length ? raw : jFormatCronExpression(parts),
    parts,
    issues,
    shortcut: shortcutExpression ? raw : undefined,
  };
}

export function jFormatCronExpression(parts: JCronParts): string {
  return [parts.minute, parts.hour, parts.dayOfMonth, parts.month, parts.dayOfWeek].join(' ');
}

export function jDescribeCronExpression(value: string): string {
  const result = jParseCronExpression(value);
  if (!result.valid || !result.parts) return 'Invalid cron expression.';
  const { minute, hour, dayOfMonth, month, dayOfWeek } = result.parts;
  if (result.shortcut) return `${shortcutLabel(result.shortcut)} (${result.expression}).`;
  if (
    minute.startsWith('*/') &&
    hour === '*' &&
    dayOfMonth === '*' &&
    month === '*' &&
    dayOfWeek === '*'
  ) {
    return `Every ${minute.slice(2)} minutes.`;
  }
  if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Every day at ${hour.padStart(2, '0')}:00.`;
  }
  if (dayOfWeek !== '*' && dayOfMonth === '*') {
    return `At minute ${minute} of hour ${hour}, on day-of-week ${dayOfWeek}.`;
  }
  if (dayOfMonth !== '*' && dayOfWeek === '*') {
    return `At minute ${minute} of hour ${hour}, on day ${dayOfMonth} of the month.`;
  }
  return `Minute ${minute}; hour ${hour}; day-of-month ${dayOfMonth}; month ${month}; day-of-week ${dayOfWeek}.`;
}

export function jNextCronRuns(
  value: string,
  from = new Date(),
  count = 3,
  maximumIterations = 527_040,
): readonly Date[] {
  const result = jParseCronExpression(value);
  if (!result.valid || !result.parts || count <= 0 || maximumIterations <= 0) return [];
  const runs: Date[] = [];
  const cursor = new Date(from);
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  for (let iteration = 0; iteration < maximumIterations && runs.length < count; iteration += 1) {
    if (matchesParts(cursor, result.parts)) runs.push(new Date(cursor));
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }
  return runs;
}

function validateField(token: string, field: JCronFieldDefinition): readonly JCronIssue[] {
  if (!token || /[A-Za-z?#LW]/.test(token)) {
    return [issue(field, token, 'Unsupported token. Use numbers, *, commas, ranges, and steps.')];
  }
  const items = token.split(',');
  if (items.some((item) => !item))
    return [issue(field, token, 'Lists cannot contain empty items.')];
  const issues: JCronIssue[] = [];
  for (const item of items) {
    const [base, stepText, extra] = item.split('/');
    if (extra !== undefined || (stepText !== undefined && !positiveInteger(stepText))) {
      issues.push(issue(field, item, 'Step values must be positive integers.'));
      continue;
    }
    if (base === '*') continue;
    const range = base.split('-');
    if (range.length > 2 || range.some((part) => !integer(part))) {
      issues.push(issue(field, item, 'Use a number, range, wildcard, list, or step.'));
      continue;
    }
    const start = Number(range[0]);
    const end = Number(range[1] ?? range[0]);
    if (
      start < field.minimum ||
      start > field.maximum ||
      end < field.minimum ||
      end > field.maximum
    ) {
      issues.push(issue(field, item, `${field.label} must be ${field.minimum}–${field.maximum}.`));
    } else if (start > end) {
      issues.push(issue(field, item, 'Range start must not exceed range end.'));
    }
  }
  return issues;
}

function matchesParts(date: Date, parts: JCronParts): boolean {
  const dayOfMonthMatches = matchesField(date.getUTCDate(), parts.dayOfMonth, 1, 31);
  const dayOfWeekMatches = matchesField(date.getUTCDay(), parts.dayOfWeek, 0, 7, true);
  const dayMatches =
    parts.dayOfMonth !== '*' && parts.dayOfWeek !== '*'
      ? dayOfMonthMatches || dayOfWeekMatches
      : dayOfMonthMatches && dayOfWeekMatches;
  return (
    matchesField(date.getUTCMinutes(), parts.minute, 0, 59) &&
    matchesField(date.getUTCHours(), parts.hour, 0, 23) &&
    dayMatches &&
    matchesField(date.getUTCMonth() + 1, parts.month, 1, 12)
  );
}

function matchesField(
  value: number,
  token: string,
  minimum: number,
  maximum: number,
  sundayAlias = false,
): boolean {
  return token.split(',').some((item) => {
    const [base, stepText] = item.split('/');
    const step = Number(stepText ?? 1);
    const normalizedValue = sundayAlias && value === 0 ? 0 : value;
    if (base === '*') return (normalizedValue - minimum) % step === 0;
    const [startText, endText] = base.split('-');
    let start = Number(startText);
    let end = Number(endText ?? startText);
    if (sundayAlias) {
      if (start === 7) start = 0;
      if (end === 7) end = 0;
    }
    if (start <= end)
      return (
        normalizedValue >= start && normalizedValue <= end && (normalizedValue - start) % step === 0
      );
    return (
      (normalizedValue >= start || normalizedValue <= end) &&
      (normalizedValue - start + (maximum - minimum + 1)) % step === 0
    );
  });
}

function issue(field: JCronFieldDefinition, token: string, message: string): JCronIssue {
  return { field: field.name, token, message };
}

function integer(value: string): boolean {
  return /^\d+$/.test(value);
}

function positiveInteger(value: string): boolean {
  return integer(value) && Number(value) > 0;
}

function shortcutLabel(shortcut: string): string {
  return shortcut.slice(1).replace(/^\w/, (letter) => letter.toUpperCase());
}
