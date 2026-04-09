import { Logger } from './logger';

describe('Logger Singleton', () => {

  //reset before each test to avoid test pollution
  beforeEach(() => {
    Logger.resetInstance();
  });

  it('getInstance() always returns the same instance', () => {
    const a = Logger.getInstance();
    const b = Logger.getInstance();
    expect(a).toBe(b); // toBe check same references (===)
  });

  it('log() adds to the logs list with the prefix [LOG]', () => {
    const logger = Logger.getInstance();
    logger.log('Server started');
    logger.log('Request received');
    expect(logger.getLogs()).toContain('[LOG] Server started');
    expect(logger.getLogs()).toContain('[LOG] Request received');
    expect(logger.getLogs()).toHaveLength(2);
  });

  it('warn() correctly records the prefix [WARN]', () => {
    const logger = Logger.getInstance();
    logger.warn('Low memory');
    expect(logger.getLogs()).toContain('[WARN] Low memory');
  });

  it('error() correctly records the prefix [ERROR]', () => {
    const logger = Logger.getInstance();
    logger.error('Database connection failed');
    expect(logger.getLogs()).toContain('[ERROR] Database connection failed');
  });

  it('State shared between two references – log in at a, read from at b.', () => {
    const loggerA = Logger.getInstance(); // module A
    const loggerB = Logger.getInstance(); // module B
    loggerA.log('Hello from module A');
    // loggerB see A's log because the same instance.
    expect(loggerB.getLogs()).toContain('[LOG] Hello from module A');
  });

  it('clearLogs() deletes all logs', () => {
    const logger = Logger.getInstance();
    logger.log('Temp log');
    logger.error('Temp error');
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });

  it('getLogs() return a copy – modifying the copy does not affect the original logs', () => {
    const logger = Logger.getInstance();
    logger.log('Original');
    const copy = logger.getLogs();
    copy.push('[LOG] Injected'); // modify the copy
    expect(logger.getLogs()).toHaveLength(1); // original logs are not affected
  });

  it('resetInstance() create new instance – old log is no longer available', () => {
    Logger.getInstance().log('Before reset');
    Logger.resetInstance();
    const fresh = Logger.getInstance();
    expect(fresh.getLogs()).toHaveLength(0);
  });

});
