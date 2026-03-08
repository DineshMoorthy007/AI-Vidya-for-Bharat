/**
 * Chat Service Unit Tests
 * Tests for AI tutor conversation handling
 */

import { ChatService } from './chatService';
import { database } from '../database/database';
import { bedrockClient } from './aiService';
import { Course } from '../types';

// Mock the config manager first
jest.mock('../config/config', () => ({
  configManager: {
    getRequired: jest.fn((key: string) => {
      const mockConfig: Record<string, string> = {
        AWS_REGION: 'us-east-1',
        AWS_BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0',
        DATABASE_PATH: './data/test-courses.db',
      };
      return mockConfig[key];
    }),
  },
}));

// Mock dependencies
jest.mock('../database/database');
jest.mock('./aiService');

describe('ChatService', () => {
  let chatService: ChatService;
  const mockDatabase = database as jest.Mocked<typeof database>;
  const mockBedrockClient = bedrockClient as jest.Mocked<typeof bedrockClient>;

  beforeEach(() => {
    chatService = new ChatService();
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const mockCourse: Course = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Introduction to JavaScript',
      topic: 'JavaScript basics',
      language: 'en',
      overview: 'Learn the fundamentals of JavaScript programming',
      learning_outcomes: [
        'Understand variables and data types',
        'Write functions and control flow',
        'Work with arrays and objects'
      ],
      chapters: [
        {
          title: 'Getting Started',
          content: 'JavaScript is a versatile programming language...'
        }
      ],
      created_at: '2024-01-01T00:00:00.000Z'
    };

    it('should retrieve course context and generate tutor response', async () => {
      // Arrange
      const message = 'What are variables in JavaScript?';
      const courseId = mockCourse.id;
      const expectedReply = 'Variables in JavaScript are containers for storing data values...';

      mockDatabase.getCourseById.mockResolvedValue(mockCourse);
      mockBedrockClient.generateTutorResponse.mockResolvedValue(expectedReply);

      // Act
      const result = await chatService.sendMessage(message, courseId);

      // Assert
      expect(mockDatabase.getCourseById).toHaveBeenCalledWith(courseId);
      expect(mockBedrockClient.generateTutorResponse).toHaveBeenCalledWith(message, mockCourse);
      expect(result).toBe(expectedReply);
    });

    it('should throw "Course not found" error when course does not exist', async () => {
      // Arrange
      const message = 'What are variables?';
      const courseId = 'non-existent-id';

      mockDatabase.getCourseById.mockResolvedValue(null);

      // Act & Assert
      await expect(chatService.sendMessage(message, courseId)).rejects.toThrow('Course not found');
      expect(mockDatabase.getCourseById).toHaveBeenCalledWith(courseId);
      expect(mockBedrockClient.generateTutorResponse).not.toHaveBeenCalled();
    });

    it('should throw "Chat service failed" error when AI service fails', async () => {
      // Arrange
      const message = 'What are variables?';
      const courseId = mockCourse.id;

      mockDatabase.getCourseById.mockResolvedValue(mockCourse);
      mockBedrockClient.generateTutorResponse.mockRejectedValue(new Error('AI service error'));

      // Act & Assert
      await expect(chatService.sendMessage(message, courseId)).rejects.toThrow('Chat service failed');
      expect(mockDatabase.getCourseById).toHaveBeenCalledWith(courseId);
      expect(mockBedrockClient.generateTutorResponse).toHaveBeenCalledWith(message, mockCourse);
    });

    it('should throw "Chat service failed" error when database fails', async () => {
      // Arrange
      const message = 'What are variables?';
      const courseId = mockCourse.id;

      mockDatabase.getCourseById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(chatService.sendMessage(message, courseId)).rejects.toThrow('Chat service failed');
      expect(mockDatabase.getCourseById).toHaveBeenCalledWith(courseId);
      expect(mockBedrockClient.generateTutorResponse).not.toHaveBeenCalled();
    });

    it('should handle empty message', async () => {
      // Arrange
      const message = '';
      const courseId = mockCourse.id;
      const expectedReply = 'Please ask a specific question.';

      mockDatabase.getCourseById.mockResolvedValue(mockCourse);
      mockBedrockClient.generateTutorResponse.mockResolvedValue(expectedReply);

      // Act
      const result = await chatService.sendMessage(message, courseId);

      // Assert
      expect(result).toBe(expectedReply);
      expect(mockBedrockClient.generateTutorResponse).toHaveBeenCalledWith(message, mockCourse);
    });

    it('should handle long messages', async () => {
      // Arrange
      const message = 'A'.repeat(1000); // Max length message
      const courseId = mockCourse.id;
      const expectedReply = 'Here is a detailed response...';

      mockDatabase.getCourseById.mockResolvedValue(mockCourse);
      mockBedrockClient.generateTutorResponse.mockResolvedValue(expectedReply);

      // Act
      const result = await chatService.sendMessage(message, courseId);

      // Assert
      expect(result).toBe(expectedReply);
      expect(mockBedrockClient.generateTutorResponse).toHaveBeenCalledWith(message, mockCourse);
    });
  });
});
