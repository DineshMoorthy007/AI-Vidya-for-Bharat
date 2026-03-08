/**
 * API Routes Tests
 * Tests for all REST endpoints
 */

import request from 'supertest';

// Mock the config manager first before any other imports
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

// Mock the services
jest.mock('../services/courseService');
jest.mock('../services/chatService');

import { createServer, registerErrorHandlers } from './server';
import { createRouter } from './routes';
import { courseService } from '../services/courseService';
import { chatService } from '../services/chatService';

describe('API Routes', () => {
  let app: ReturnType<typeof createServer>;

  beforeEach(() => {
    app = createServer();
    app.use(createRouter());
    registerErrorHandlers(app);
    jest.clearAllMocks();
  });

  describe('POST /api/generate-course', () => {
    it('should generate a course with valid input', async () => {
      const mockCourseId = '550e8400-e29b-41d4-a716-446655440000';
      (courseService.generateCourse as jest.Mock).mockResolvedValue(mockCourseId);

      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: 'JavaScript Basics', language: 'en' })
        .expect(200);

      expect(response.body).toEqual({ courseId: mockCourseId });
      expect(courseService.generateCourse).toHaveBeenCalledWith('JavaScript Basics', 'en');
    });

    it('should reject request with missing topic', async () => {
      const response = await request(app)
        .post('/api/generate-course')
        .send({ language: 'en' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields: topic and language are required'
      });
      expect(courseService.generateCourse).not.toHaveBeenCalled();
    });

    it('should reject request with missing language', async () => {
      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: 'JavaScript Basics' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields: topic and language are required'
      });
      expect(courseService.generateCourse).not.toHaveBeenCalled();
    });

    it('should reject topic that is too short', async () => {
      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: 'JS', language: 'en' })
        .expect(400);

      expect(response.body.error).toBe('Topic must be at least 3 characters');
      expect(courseService.generateCourse).not.toHaveBeenCalled();
    });

    it('should reject topic that is too long', async () => {
      const longTopic = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: longTopic, language: 'en' })
        .expect(400);

      expect(response.body.error).toBe('Topic must not exceed 200 characters');
      expect(courseService.generateCourse).not.toHaveBeenCalled();
    });

    it('should reject invalid language', async () => {
      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: 'JavaScript Basics', language: 'fr' })
        .expect(400);

      expect(response.body.error).toBe('Language must be one of: en, hi, ta, te, bn');
      expect(courseService.generateCourse).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      (courseService.generateCourse as jest.Mock).mockRejectedValue(
        new Error('Course generation failed')
      );

      const response = await request(app)
        .post('/api/generate-course')
        .send({ topic: 'JavaScript Basics', language: 'en' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept all valid languages', async () => {
      const mockCourseId = '550e8400-e29b-41d4-a716-446655440000';
      (courseService.generateCourse as jest.Mock).mockResolvedValue(mockCourseId);

      const validLanguages = ['en', 'hi', 'ta', 'te', 'bn'];

      for (const language of validLanguages) {
        const response = await request(app)
          .post('/api/generate-course')
          .send({ topic: 'Test Topic', language })
          .expect(200);

        expect(response.body).toEqual({ courseId: mockCourseId });
      }
    });
  });

  describe('GET /api/course/:id', () => {
    it('should retrieve a course by valid ID', async () => {
      const mockCourse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'JavaScript Basics',
        topic: 'JavaScript',
        language: 'en',
        overview: 'Learn JavaScript fundamentals',
        learning_outcomes: ['Understand variables', 'Learn functions'],
        chapters: [{ title: 'Introduction', content: 'Welcome to JavaScript' }],
        created_at: '2024-01-01T00:00:00.000Z'
      };
      (courseService.getCourse as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app)
        .get('/api/course/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body).toEqual(mockCourse);
      expect(courseService.getCourse).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return 404 for non-existent course', async () => {
      (courseService.getCourse as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/course/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body).toEqual({ error: 'Course not found' });
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/course/invalid-uuid')
        .expect(400);

      expect(response.body.error).toBe('Invalid UUID v4 format');
      expect(courseService.getCourse).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/courses', () => {
    it('should list all courses', async () => {
      const mockCourses = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'JavaScript Basics',
          topic: 'JavaScript',
          language: 'en',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Python Basics',
          topic: 'Python',
          language: 'en',
          created_at: '2024-01-02T00:00:00.000Z'
        }
      ];
      (courseService.listCourses as jest.Mock).mockResolvedValue(mockCourses);

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body).toEqual(mockCourses);
      expect(courseService.listCourses).toHaveBeenCalled();
    });

    it('should return empty array when no courses exist', async () => {
      (courseService.listCourses as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/courses', () => {
    it('should delete all courses', async () => {
      (courseService.deleteAllCourses as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/courses')
        .expect(200);

      expect(response.body).toEqual({ message: 'All courses deleted successfully' });
      expect(courseService.deleteAllCourses).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      (courseService.deleteAllCourses as jest.Mock).mockRejectedValue(
        new Error('Failed to delete courses')
      );

      const response = await request(app)
        .delete('/api/courses')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/chat', () => {
    it('should send a chat message with valid input', async () => {
      const mockReply = 'This is a helpful response from the AI tutor.';
      (chatService.sendMessage as jest.Mock).mockResolvedValue(mockReply);

      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'What is a variable?',
          courseId: '550e8400-e29b-41d4-a716-446655440000'
        })
        .expect(200);

      expect(response.body).toEqual({ reply: mockReply });
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'What is a variable?',
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should reject request with missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ courseId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields: message and courseId are required'
      });
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject request with missing courseId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'What is a variable?' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields: message and courseId are required'
      });
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: '   ',
          courseId: '550e8400-e29b-41d4-a716-446655440000'
        })
        .expect(400);

      expect(response.body.error).toBe('Message cannot be empty');
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: longMessage,
          courseId: '550e8400-e29b-41d4-a716-446655440000'
        })
        .expect(400);

      expect(response.body.error).toBe('Message must not exceed 1000 characters');
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should reject invalid courseId format', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'What is a variable?',
          courseId: 'invalid-uuid'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid UUID v4 format');
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should return 404 when course not found', async () => {
      (chatService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Course not found')
      );

      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'What is a variable?',
          courseId: '550e8400-e29b-41d4-a716-446655440000'
        })
        .expect(404);

      expect(response.body).toEqual({ error: 'Course not found' });
    });

    it('should handle other service errors', async () => {
      (chatService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Chat service failed')
      );

      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'What is a variable?',
          courseId: '550e8400-e29b-41d4-a716-446655440000'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});

