/**
 * Configuration Manager
 * Loads and validates environment variables at server startup
 */

interface Config {
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_BEDROCK_MODEL_ID: string;
  DATABASE_PATH: string;
  PORT: number;
  NODE_ENV: string;
}

class ConfigManager {
  private config: Map<string, string | number>;

  constructor() {
    this.config = new Map();
    this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): void {
    // Load env-driven configuration without throwing during module import.
    this.config.set('AWS_REGION', process.env.AWS_REGION || 'us-east-1');

    if (process.env.AWS_ACCESS_KEY_ID) {
      this.config.set('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID);
    }

    if (process.env.AWS_SECRET_ACCESS_KEY) {
      this.config.set('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY);
    }

    if (process.env.AWS_BEDROCK_MODEL_ID) {
      this.config.set('AWS_BEDROCK_MODEL_ID', process.env.AWS_BEDROCK_MODEL_ID);
    }

    if (process.env.DATABASE_PATH) {
      this.config.set('DATABASE_PATH', process.env.DATABASE_PATH);
    }

    // Load optional keys with defaults
    this.config.set('PORT', process.env.PORT ? parseInt(process.env.PORT, 10) : 5000);
    this.config.set('NODE_ENV', process.env.NODE_ENV || 'development');
  }

  /**
   * Get a configuration value by key
   * @param key - Configuration key
   * @returns Configuration value or undefined if not found
   */
  get(key: string): string | number | undefined {
    return this.config.get(key);
  }

  /**
   * Get a required configuration value by key
   * Throws an error if the key is not found
   * @param key - Configuration key
   * @returns Configuration value
   * @throws Error if key is not found
   */
  getRequired(key: string): string | number {
    const value = this.config.get(key);
    if (value === undefined) {
      throw new Error(`Configuration key not found: ${key}`);
    }
    return value;
  }

  /**
   * Validate that all required configuration is present
   * This is called during initialization
   */
  validate(): void {
    const requiredKeys = [
      'AWS_BEDROCK_MODEL_ID',
      'DATABASE_PATH'
    ];

    for (const key of requiredKeys) {
      if (!this.config.has(key)) {
        throw new Error(`Missing required configuration: ${key}`);
      }
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export type { Config };
