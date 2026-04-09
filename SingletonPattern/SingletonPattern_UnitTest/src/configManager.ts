export interface AppConfig {
  apiUrl:    string;
  timeout:   number;
  debugMode: boolean;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    // default configuration
    this.config = {
      apiUrl:    'https://api.example.com',
      timeout:   3000,
      debugMode: false,
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  static resetInstance(): void {
    (ConfigManager as any).instance = undefined;
  }

  // Generic getter – type-safe nhờ keyof
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  // Generic setter – type-safe
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
  }

  // Return a snapshot to prevent direct modification of the config
  getAll(): AppConfig {
    return { ...this.config };
  }
}
