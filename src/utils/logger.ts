export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

// No-op logger that does nothing
class NoOpLogger {
  setDevMode(_devMode: boolean): void {}
  debug(_message: string, ..._args: unknown[]): void {}
  info(_message: string, ..._args: unknown[]): void {}
  warn(_message: string, ..._args: unknown[]): void {}
  error(_message: string, _error?: unknown): void {}
  time(_label: string): void {}
  timeEnd(_label: string): void {}
  group(_title: string): void {}
  groupEnd(): void {}
  table(_data: unknown, _title?: string): void {}
  logPluginLoad(): void {}
  logPluginUnload(): void {}
  logCommandExecution(_commandId: string): void {}
  logSettingsChange(_setting: string, _oldValue: unknown, _newValue: unknown): void {}
}

export class Logger {
  private name: string;
  private devMode: boolean;
  private logLevel: LogLevel;

  constructor(name: string, devMode: boolean = false, logLevel: LogLevel = LogLevel.INFO) {
    this.name = name;
    this.devMode = devMode;
    this.logLevel = logLevel;
  }

  setDevMode(devMode: boolean): void {
    this.devMode = devMode;
  }

  setLogLevel(logLevel: LogLevel): void {
    this.logLevel = logLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toTimeString().slice(0, 12);
    return `[${timestamp}] [${this.name}] [${level}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // Log if the message level is equal to or higher than configured level
    return level >= this.logLevel;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args); // eslint-disable-line no-console
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);  // eslint-disable-line no-console
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);  // eslint-disable-line no-console
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (error) {
        console.error(this.formatMessage('ERROR', message), error);  // eslint-disable-line no-console
      } else {
        console.error(this.formatMessage('ERROR', message));  // eslint-disable-line no-console
      }
    }
  }

  // Performance timing utilities
  time(foo: string): void {
    if (this.devMode) {
      console.time(this.formatMessage('TIMER', `${foo} - start`));  // eslint-disable-line no-console
    }
  }

  timeEnd(label: string): void {
    if (this.devMode) {
      console.timeEnd(this.formatMessage('TIMER', `${label} - start`)); // eslint-disable-line no-console
    }
  }

  // Log grouping for organizing related logs
  group(title: string): void {
    if (this.devMode) {
      console.group(this.formatMessage('GROUP', title)); // eslint-disable-line no-console
    }
  }

  groupEnd(): void {
    if (this.devMode) {
      console.groupEnd(); // eslint-disable-line no-console
    }
  }

  // Table logging for structured data
  table(data: unknown, title?: string): void {
    if (this.devMode) {
      if (title) {
        this.debug(title);
      }
      console.table(data); // eslint-disable-line no-console
    }
  }

  // Lifecycle logging helpers
  logPluginLoad(): void {
    this.info('Plugin loaded successfully');
  }

  logPluginUnload(): void {
    this.info('Plugin unloaded');
  }

  logCommandExecution(commandId: string): void {
    this.debug(`Executing command: ${commandId}`);
  }

  logSettingsChange(setting: string, oldValue: unknown, newValue: unknown): void {
    this.debug(`Setting changed: ${setting}`, { from: oldValue, to: newValue });
  }
}

// Factory function to create either real logger or no-op logger
export function createLogger(name: string, devMode: boolean = false, logLevel: LogLevel = LogLevel.ERROR): Logger | NoOpLogger {
  return devMode ? new Logger(name, devMode, logLevel) : new NoOpLogger();
}
