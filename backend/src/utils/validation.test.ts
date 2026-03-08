/**
 * Unit tests for validation utilities
 */

import {
  validateTopic,
  validateLanguage,
  validateUUID,
  validateChatMessage,
  validateCourseRequest,
  validateChatRequest,
  ALLOWED_LANGUAGES,
} from './validation';

describe('Validation Utilities', () => {
  describe('validateTopic', () => {
    it('should accept valid topics', () => {
      expect(validateTopic('JavaScript')).toEqual({ valid: true });
      expect(validateTopic('Machine Learning')).toEqual({ valid: true });
      expect(validateTopic('ABC')).toEqual({ valid: true }); // Minimum length
      expect(validateTopic('A'.repeat(200))).toEqual({ valid: true }); // Maximum length
    });

    it('should reject topics that are too short', () => {
      expect(validateTopic('')).toEqual({ 
        valid: false, 
        error: 'Topic must be at least 3 characters' 
      });
      expect(validateTopic('AB')).toEqual({ 
        valid: false, 
        error: 'Topic must be at least 3 characters' 
      });
      expect(validateTopic('  ')).toEqual({ 
        valid: false, 
        error: 'Topic must be at least 3 characters' 
      });
    });

    it('should reject topics that are too long', () => {
      expect(validateTopic('A'.repeat(201))).toEqual({ 
        valid: false, 
        error: 'Topic must not exceed 200 characters' 
      });
    });

    it('should reject non-string topics', () => {
      expect(validateTopic(123 as any)).toEqual({ 
        valid: false, 
        error: 'Topic must be a string' 
      });
      expect(validateTopic(null as any)).toEqual({ 
        valid: false, 
        error: 'Topic must be a string' 
      });
    });

    it('should trim whitespace before validation', () => {
      expect(validateTopic('  JavaScript  ')).toEqual({ valid: true });
      expect(validateTopic('  AB  ')).toEqual({ 
        valid: false, 
        error: 'Topic must be at least 3 characters' 
      });
    });
  });

  describe('validateLanguage', () => {
    it('should accept valid language codes', () => {
      ALLOWED_LANGUAGES.forEach(lang => {
        expect(validateLanguage(lang)).toEqual({ valid: true });
      });
    });

    it('should reject invalid language codes', () => {
      expect(validateLanguage('fr')).toEqual({ 
        valid: false, 
        error: 'Language must be one of: en, hi, ta, te, bn' 
      });
      expect(validateLanguage('es')).toEqual({ 
        valid: false, 
        error: 'Language must be one of: en, hi, ta, te, bn' 
      });
      expect(validateLanguage('invalid')).toEqual({ 
        valid: false, 
        error: 'Language must be one of: en, hi, ta, te, bn' 
      });
    });

    it('should reject non-string languages', () => {
      expect(validateLanguage(123 as any)).toEqual({ 
        valid: false, 
        error: 'Language must be a string' 
      });
      expect(validateLanguage(null as any)).toEqual({ 
        valid: false, 
        error: 'Language must be a string' 
      });
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUID v4 format', () => {
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toEqual({ valid: true });
      expect(validateUUID('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toEqual({ valid: true });
      expect(validateUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toEqual({ valid: true });
    });

    it('should reject invalid UUID formats', () => {
      expect(validateUUID('not-a-uuid')).toEqual({ 
        valid: false, 
        error: 'Invalid UUID v4 format' 
      });
      expect(validateUUID('550e8400-e29b-11d4-a716-446655440000')).toEqual({ 
        valid: false, 
        error: 'Invalid UUID v4 format' 
      }); // Not v4 (wrong version digit)
      expect(validateUUID('550e8400e29b41d4a716446655440000')).toEqual({ 
        valid: false, 
        error: 'Invalid UUID v4 format' 
      }); // Missing hyphens
      expect(validateUUID('')).toEqual({ 
        valid: false, 
        error: 'Invalid UUID v4 format' 
      });
    });

    it('should reject non-string UUIDs', () => {
      expect(validateUUID(123 as any)).toEqual({ 
        valid: false, 
        error: 'UUID must be a string' 
      });
      expect(validateUUID(null as any)).toEqual({ 
        valid: false, 
        error: 'UUID must be a string' 
      });
    });

    it('should be case-insensitive', () => {
      expect(validateUUID('550E8400-E29B-41D4-A716-446655440000')).toEqual({ valid: true });
      expect(validateUUID('550e8400-E29B-41d4-A716-446655440000')).toEqual({ valid: true });
    });
  });

  describe('validateChatMessage', () => {
    it('should accept valid chat messages', () => {
      expect(validateChatMessage('Hello')).toEqual({ valid: true });
      expect(validateChatMessage('What is machine learning?')).toEqual({ valid: true });
      expect(validateChatMessage('A')).toEqual({ valid: true }); // Minimum length
      expect(validateChatMessage('A'.repeat(1000))).toEqual({ valid: true }); // Maximum length
    });

    it('should reject empty messages', () => {
      expect(validateChatMessage('')).toEqual({ 
        valid: false, 
        error: 'Message cannot be empty' 
      });
      expect(validateChatMessage('   ')).toEqual({ 
        valid: false, 
        error: 'Message cannot be empty' 
      });
    });

    it('should reject messages that are too long', () => {
      expect(validateChatMessage('A'.repeat(1001))).toEqual({ 
        valid: false, 
        error: 'Message must not exceed 1000 characters' 
      });
    });

    it('should reject non-string messages', () => {
      expect(validateChatMessage(123 as any)).toEqual({ 
        valid: false, 
        error: 'Message must be a string' 
      });
      expect(validateChatMessage(null as any)).toEqual({ 
        valid: false, 
        error: 'Message must be a string' 
      });
    });

    it('should trim whitespace before validation', () => {
      expect(validateChatMessage('  Hello  ')).toEqual({ valid: true });
      expect(validateChatMessage('  ')).toEqual({ 
        valid: false, 
        error: 'Message cannot be empty' 
      });
    });
  });

  describe('validateCourseRequest', () => {
    it('should accept valid course requests', () => {
      expect(validateCourseRequest('JavaScript', 'en')).toEqual({ valid: true });
      expect(validateCourseRequest('Machine Learning', 'hi')).toEqual({ valid: true });
    });

    it('should reject invalid topics', () => {
      expect(validateCourseRequest('AB', 'en')).toEqual({ 
        valid: false, 
        error: 'Topic must be at least 3 characters' 
      });
    });

    it('should reject invalid languages', () => {
      expect(validateCourseRequest('JavaScript', 'fr')).toEqual({ 
        valid: false, 
        error: 'Language must be one of: en, hi, ta, te, bn' 
      });
    });
  });

  describe('validateChatRequest', () => {
    it('should accept valid chat requests', () => {
      expect(validateChatRequest('Hello', '550e8400-e29b-41d4-a716-446655440000')).toEqual({ valid: true });
    });

    it('should reject invalid messages', () => {
      expect(validateChatRequest('', '550e8400-e29b-41d4-a716-446655440000')).toEqual({ 
        valid: false, 
        error: 'Message cannot be empty' 
      });
    });

    it('should reject invalid course IDs', () => {
      expect(validateChatRequest('Hello', 'not-a-uuid')).toEqual({ 
        valid: false, 
        error: 'Invalid UUID v4 format' 
      });
    });
  });
});
