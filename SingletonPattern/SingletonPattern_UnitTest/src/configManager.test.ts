import { ConfigManager } from './configManager';

describe('ConfigManager Singleton', () => {

  beforeEach(() => {
    ConfigManager.resetInstance();
  });

  it('getInstance() returns the same instance', () => {
    const c1 = ConfigManager.getInstance();
    const c2 = ConfigManager.getInstance();
    expect(c1).toBe(c2);
  });

  it('get() returns the correct default values after initialization', () => {
    const cfg = ConfigManager.getInstance();
    expect(cfg.get('apiUrl')).toBe('https://api.example.com');
    expect(cfg.get('timeout')).toBe(3000);
    expect(cfg.get('debugMode')).toBe(false);
  });

  it('set() updates the config, get() reads the updated value', () => {
    const cfg = ConfigManager.getInstance();
    cfg.set('timeout', 5000);
    cfg.set('debugMode', true);
    cfg.set('apiUrl', 'https://new-api.com');
    expect(cfg.get('timeout')).toBe(5000);
    expect(cfg.get('debugMode')).toBe(true);
    expect(cfg.get('apiUrl')).toBe('https://new-api.com');
  });

  it('changes to config via reference A are immediately visible to reference B', () => {
    const cfg1 = ConfigManager.getInstance();
    const cfg2 = ConfigManager.getInstance();
    cfg1.set('apiUrl', 'https://staging.api.com');
    expect(cfg2.get('apiUrl')).toBe('https://staging.api.com');
  });

  it('getAll() return a snapshot – modifying the snapshot does not affect the original config', () => {
    const cfg = ConfigManager.getInstance();
    const snapshot = cfg.getAll();
    snapshot.timeout = 99999;        // modify the snapshot
    expect(cfg.get('timeout')).toBe(3000); // default config not affected
  });

  it('resetInstance() creates a new instance with default config', () => {
    const cfg = ConfigManager.getInstance();
    cfg.set('timeout', 9999);
    ConfigManager.resetInstance();
    const fresh = ConfigManager.getInstance();
    expect(fresh.get('timeout')).toBe(3000); // reset to default value
  });

  it('type-safety: set() accepts the correct data types', () => {
    const cfg = ConfigManager.getInstance();
    // No TypeScript error when setting the correct types
    expect(() => cfg.set('timeout', 1000)).not.toThrow();
    expect(() => cfg.set('debugMode', true)).not.toThrow();
  });

});
