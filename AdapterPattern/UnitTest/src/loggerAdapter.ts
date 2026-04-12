// Target Interface – modern logging contract used across the application
export interface Logger {
  log(message: string):   void;
  warn(message: string):  void;
  error(message: string): void;
}

// Adaptee – legacy library with a single write() method (incompatible interface)
export class LegacyLogger {
  write(level: 'INFO' | 'WARNING' | 'ERROR', message: string): void {
    // Simulated legacy output
    console.log(`[${level}] ${message}`);
  }
}

// Adapter – Object Adapter using composition
export class LegacyLoggerAdapter implements Logger {
  constructor(private legacy: LegacyLogger) {}

  log(message: string): void {
    this.legacy.write('INFO', message);
  }

  warn(message: string): void {
    this.legacy.write('WARNING', message);
  }

  error(message: string): void {
    this.legacy.write('ERROR', message);
  }
}
