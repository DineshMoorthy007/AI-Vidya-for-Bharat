/**
 * Validation utilities for input validation
 * Implements Security.1, Security.2, Security.3 requirements
 */

/**
 * Allowed language codes for course generation and content
 */
export const ALLOWED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn'] as const;
export type Language = typeof ALLOWED_LANGUAGES[number];

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a topic string
 * Requirements: Security.1 - Topic must be 3-200 characters
 * 
 * @param topic - The topic string to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateTopic(topic: string): ValidationResult {
  if (typeof topic !== 'string') {
    return { valid: false, error: 'Topic must be a string' };
  }

  const trimmedTopic = topic.trim();
  
  if (trimmedTopic.length < 3) {
    return { valid: false, error: 'Topic must be at least 3 characters' };
  }
  
  if (trimmedTopic.length > 200) {
    return { valid: false, error: 'Topic must not exceed 200 characters' };
  }
  
  return { valid: true };
}

/**
 * Validates a language code
 * Requirements: Security.2 - Language must be in allowed set
 * 
 * @param language - The language code to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateLanguage(language: string): ValidationResult {
  if (typeof language !== 'string') {
    return { valid: false, error: 'Language must be a string' };
  }

  if (!ALLOWED_LANGUAGES.includes(language as Language)) {
    return { 
      valid: false, 
      error: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}` 
    };
  }
  
  return { valid: true };
}

/**
 * Validates a UUID v4 format
 * Requirements: Security.3 - UUID format validation
 * 
 * @param uuid - The UUID string to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateUUID(uuid: string): ValidationResult {
  if (typeof uuid !== 'string') {
    return { valid: false, error: 'UUID must be a string' };
  }

  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // where x is any hexadecimal digit and y is one of 8, 9, A, or B
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidV4Regex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID v4 format' };
  }
  
  return { valid: true };
}

/**
 * Validates a chat message
 * Requirements: Security.3 - Chat message must be 1-1000 characters
 * 
 * @param message - The chat message to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateChatMessage(message: string): ValidationResult {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }

  const trimmedMessage = message.trim();
  
  if (trimmedMessage.length < 1) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmedMessage.length > 1000) {
    return { valid: false, error: 'Message must not exceed 1000 characters' };
  }
  
  return { valid: true };
}

/**
 * Validates course generation request
 * Combines topic and language validation
 * 
 * @param topic - The topic string to validate
 * @param language - The language code to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateCourseRequest(topic: string, language: string): ValidationResult {
  const topicResult = validateTopic(topic);
  if (!topicResult.valid) {
    return topicResult;
  }
  
  const languageResult = validateLanguage(language);
  if (!languageResult.valid) {
    return languageResult;
  }
  
  return { valid: true };
}

/**
 * Validates chat request
 * Combines message and courseId validation
 * 
 * @param message - The chat message to validate
 * @param courseId - The course ID to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateChatRequest(message: string, courseId: string): ValidationResult {
  const messageResult = validateChatMessage(message);
  if (!messageResult.valid) {
    return messageResult;
  }
  
  const uuidResult = validateUUID(courseId);
  if (!uuidResult.valid) {
    return uuidResult;
  }
  
  return { valid: true };
}
