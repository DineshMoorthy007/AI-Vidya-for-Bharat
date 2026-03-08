/**
 * Unit tests for Course Service
 */

import { courseService } from './courseService';
import { bedrockClient } from './aiService';
import { database } from '../database/database';
import { Course, CourseSummary } from '../types';

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

// Mock the dependencies
jest.mock('./aiService');
jest.mock('../database/database');

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCourse', () => {
    it('should generate a course with UUID v4 ID and store it in database', async () => {
      // Arrange
      const topic = 'JavaScript Basics';
      const language = 'en';
      const mockCourseContent = {
        title: 'Introduction to JavaScript',
        overview: 'Learn JavaScript fundamentals',
        learning_outcomes: ['Understand variables', 'Learn functions', 'Master arrays'],
        chapters: [
          { title: 'Chapter 1', content: 'Introduction to JavaScript programming' },
          { title: 'Chapter 2', content: 'Variables and data types' },
        ],
      };

      (bedrockClient.generateCourse as jest.Mock).mockResolvedValue(mockCourseContent);
      (database.saveCourse as jest.Mock).mockResolvedValue('mock-uuid');

      // Act
      const courseId = await courseService.generateCourse(topic, language);

      // Assert
      expect(courseId).toBeDefined();
      expect(typeof courseId).toBe('string');
      // UUID v4 format check (8-4-4-4-12 hex digits)
      expect(courseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      
      expect(bedrockClient.generateCourse).toHaveBeenCalledWith(topic, language);
      expect(database.saveCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          id: courseId,
          title: mockCourseContent.title,
          topic,
          language,
          overview: mockCourseContent.overview,
          learning_outcomes: mockCourseContent.learning_outcomes,
          chapters: mockCourseContent.chapters,
          created_at: expect.any(String),
        })
      );
    });

    it('should throw error when AI service fails', async () => {
      // Arrange
      (bedrockClient.generateCourse as jest.Mock).mockRejectedValue(new Error('AI service error'));

      // Act & Assert
      await expect(courseService.generateCourse('topic', 'en')).rejects.toThrow('Course generation failed');
    });

    it('should throw error when database save fails', async () => {
      // Arrange
      const mockCourseContent = {
        title: 'Test Course',
        overview: 'Test overview',
        learning_outcomes: ['outcome1'],
        chapters: [{ title: 'Chapter 1', content: 'Content' }],
      };
      (bedrockClient.generateCourse as jest.Mock).mockResolvedValue(mockCourseContent);
      (database.saveCourse as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(courseService.generateCourse('topic', 'en')).rejects.toThrow('Course generation failed');
    });
  });

  describe('getCourse', () => {
    it('should retrieve a course by ID from database', async () => {
      // Arrange
      const mockCourse: Course = {
        id: 'test-uuid',
        title: 'Test Course',
        topic: 'Testing',
        language: 'en',
        overview: 'Test overview',
        learning_outcomes: ['outcome1', 'outcome2'],
        chapters: [{ title: 'Chapter 1', content: 'Content' }],
        created_at: '2024-01-01T00:00:00.000Z',
      };
      (database.getCourseById as jest.Mock).mockResolvedValue(mockCourse);

      // Act
      const result = await courseService.getCourse('test-uuid');

      // Assert
      expect(result).toEqual(mockCourse);
      expect(database.getCourseById).toHaveBeenCalledWith('test-uuid');
    });

    it('should return null when course not found', async () => {
      // Arrange
      (database.getCourseById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await courseService.getCourse('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when database retrieval fails', async () => {
      // Arrange
      (database.getCourseById as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(courseService.getCourse('test-uuid')).rejects.toThrow('Failed to retrieve course');
    });
  });

  describe('listCourses', () => {
    it('should return array of course summaries', async () => {
      // Arrange
      const mockSummaries: CourseSummary[] = [
        {
          id: 'uuid-1',
          title: 'Course 1',
          topic: 'Topic 1',
          language: 'en',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'uuid-2',
          title: 'Course 2',
          topic: 'Topic 2',
          language: 'hi',
          created_at: '2024-01-02T00:00:00.000Z',
        },
      ];
      (database.getAllCourses as jest.Mock).mockResolvedValue(mockSummaries);

      // Act
      const result = await courseService.listCourses();

      // Assert
      expect(result).toEqual(mockSummaries);
      expect(result).toHaveLength(2);
      expect(database.getAllCourses).toHaveBeenCalled();
    });

    it('should return empty array when no courses exist', async () => {
      // Arrange
      (database.getAllCourses as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await courseService.listCourses();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      (database.getAllCourses as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(courseService.listCourses()).rejects.toThrow('Failed to list courses');
    });
  });

  describe('deleteAllCourses', () => {
    it('should delete all courses from database', async () => {
      // Arrange
      (database.deleteAllCourses as jest.Mock).mockResolvedValue(undefined);

      // Act
      await courseService.deleteAllCourses();

      // Assert
      expect(database.deleteAllCourses).toHaveBeenCalled();
    });

    it('should throw error when deletion fails', async () => {
      // Arrange
      (database.deleteAllCourses as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(courseService.deleteAllCourses()).rejects.toThrow('Failed to delete courses');
    });
  });
});
