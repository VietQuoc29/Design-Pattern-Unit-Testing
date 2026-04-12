import { LegacyLoggerAdapter, LegacyLogger, Logger } from './loggerAdapter';

describe('Legacy Logger Adapter', () => {

  let mockLegacy: jest.Mocked<LegacyLogger>;
  let adapter: Logger;

  beforeEach(() => {
    mockLegacy = { write: jest.fn() } as any;
    adapter    = new LegacyLoggerAdapter(mockLegacy);
  });

  it('log() calls legacy.write() with level "INFO"', () => {
    adapter.log('Server started');
    expect(mockLegacy.write).toHaveBeenCalledWith('INFO', 'Server started');
  });

  it('warn() calls legacy.write() with level "WARNING"', () => {
    adapter.warn('High memory usage');
    expect(mockLegacy.write).toHaveBeenCalledWith('WARNING', 'High memory usage');
  });

  it('error() calls legacy.write() with level "ERROR"', () => {
    adapter.error('Database unreachable');
    expect(mockLegacy.write).toHaveBeenCalledWith('ERROR', 'Database unreachable');
  });

  it('each adapter method maps to exactly one write() call', () => {
    adapter.log('log');
    adapter.warn('warn');
    adapter.error('error');
    expect(mockLegacy.write).toHaveBeenCalledTimes(3);
  });

  it('passes the message string unchanged to the legacy write() call', () => {
    const msg = 'Error in line 20';
    adapter.error(msg);
    expect(mockLegacy.write).toHaveBeenCalledWith('ERROR', msg);
  });

  it('adapter is a drop-in replacement for the Logger interface', () => {
    function logStartup(logger: Logger) {
      logger.log('App booting');
      logger.warn('Running in development mode');
    }
    expect(() => logStartup(adapter)).not.toThrow();
    expect(mockLegacy.write).toHaveBeenCalledTimes(2);
  });

  it('does not mix up level strings across methods', () => {
    adapter.log('info msg');
    adapter.error('error msg');
    const calls = mockLegacy.write.mock.calls;
    expect(calls[0][0]).toBe('INFO');
    expect(calls[1][0]).toBe('ERROR');
  });

});
