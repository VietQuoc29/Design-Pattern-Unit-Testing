export class Logger {
  private static instance: Logger;
  private logs: string[] = [];

  // Private constructor – Prevent creating instances using `new`.
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Used in testing to reset to the initial state.
  static resetInstance(): void {
    (Logger as any).instance = undefined;
  }

  log(message: string): void {
    this.logs.push(`[LOG] ${message}`);
  }

  warn(message: string): void {
    this.logs.push(`[WARN] ${message}`);
  }

  error(message: string): void {
    this.logs.push(`[ERROR] ${message}`);
  }

  getLogs(): string[] {
    return [...this.logs]; // return a copy to prevent external modification
  }

  clearLogs(): void {
    this.logs = [];
  }
}
