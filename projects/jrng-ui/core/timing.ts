export interface JCancelableCallback {
  cancel(): void;
}

export interface JDebouncedFunction<TArgs extends readonly unknown[]>
  extends JCancelableCallback {
  (...args: TArgs): void;
  flush(): void;
}

export interface JThrottledFunction<TArgs extends readonly unknown[]>
  extends JCancelableCallback {
  (...args: TArgs): void;
}

export function jDebounce<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): JDebouncedFunction<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = ((...args: TArgs): void => {
    lastArgs = args;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      const argsToUse = lastArgs;
      lastArgs = null;
      if (argsToUse) {
        callback(...argsToUse);
      }
    }, delayMs);
  }) as JDebouncedFunction<TArgs>;

  debounced.cancel = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  debounced.flush = (): void => {
    if (!timer || !lastArgs) {
      return;
    }
    clearTimeout(timer);
    timer = null;
    const argsToUse = lastArgs;
    lastArgs = null;
    callback(...argsToUse);
  };

  return debounced;
}

export function jThrottle<TArgs extends readonly unknown[]>(
  callback: (...args: TArgs) => void,
  intervalMs: number,
): JThrottledFunction<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastRun = 0;
  let trailingArgs: TArgs | null = null;

  const throttled = ((...args: TArgs): void => {
    const now = Date.now();
    const remaining = intervalMs - (now - lastRun);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastRun = now;
      callback(...args);
      return;
    }

    trailingArgs = args;
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        lastRun = Date.now();
        const argsToUse = trailingArgs;
        trailingArgs = null;
        if (argsToUse) {
          callback(...argsToUse);
        }
      }, remaining);
    }
  }) as JThrottledFunction<TArgs>;

  throttled.cancel = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    trailingArgs = null;
  };

  return throttled;
}
