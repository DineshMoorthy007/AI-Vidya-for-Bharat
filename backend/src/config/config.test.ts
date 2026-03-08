/**
 * Unit tests for Config Manager
 */

describe('ConfigManager', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear environment
    delete process.env.AWS_REGION;
    delete process.env.AWS_BEDROCK_MODEL_ID;
    delete process.env.DATABASE_PATH;
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    
    // Clear module cache to get fresh instance
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('initialization', () => {
    it('should load all required environment variables', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.get('AWS_REGION')).toBe('us-east-1');
      expect(configManager.get('AWS_BEDROCK_MODEL_ID')).toBe('anthropic.claude-3-sonnet-20240229-v1:0');
      expect(configManager.get('DATABASE_PATH')).toBe('./data/courses.db');
    });

    it('should throw error when AWS_REGION is missing', () => {
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      expect(() => {
        require('./config');
      }).toThrow('Missing required environment variable: AWS_REGION');
    });

    it('should throw error when AWS_BEDROCK_MODEL_ID is missing', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.DATABASE_PATH = './data/courses.db';

      expect(() => {
        require('./config');
      }).toThrow('Missing required environment variable: AWS_BEDROCK_MODEL_ID');
    });

    it('should throw error when DATABASE_PATH is missing', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

      expect(() => {
        require('./config');
      }).toThrow('Missing required environment variable: DATABASE_PATH');
    });

    it('should use default PORT when not provided', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.get('PORT')).toBe(3001);
    });

    it('should use custom PORT when provided', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';
      process.env.PORT = '8080';

      const { configManager } = require('./config');

      expect(configManager.get('PORT')).toBe(8080);
    });

    it('should use default NODE_ENV when not provided', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.get('NODE_ENV')).toBe('development');
    });

    it('should use custom NODE_ENV when provided', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';
      process.env.NODE_ENV = 'production';

      const { configManager } = require('./config');

      expect(configManager.get('NODE_ENV')).toBe('production');
    });
  });

  describe('get method', () => {
    it('should return value for existing key', () => {
      process.env.AWS_REGION = 'us-west-2';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.get('AWS_REGION')).toBe('us-west-2');
    });

    it('should return undefined for non-existent key', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.get('NON_EXISTENT_KEY')).toBeUndefined();
    });
  });

  describe('getRequired method', () => {
    it('should return value for existing key', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(configManager.getRequired('AWS_REGION')).toBe('us-east-1');
    });

    it('should throw error for non-existent key', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(() => {
        configManager.getRequired('NON_EXISTENT_KEY');
      }).toThrow('Configuration key not found: NON_EXISTENT_KEY');
    });
  });

  describe('validate method', () => {
    it('should not throw when all required keys are present', () => {
      process.env.AWS_REGION = 'us-east-1';
      process.env.AWS_BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
      process.env.DATABASE_PATH = './data/courses.db';

      const { configManager } = require('./config');

      expect(() => {
        configManager.validate();
      }).not.toThrow();
    });
  });
});
