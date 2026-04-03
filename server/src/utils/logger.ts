/**
 * Unified Logger for Life-OS
 * In a real production app, this would use a library like winston or pino
 * and potentially log to a service like Datadog or Sentry.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const Logger = {
  info: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
