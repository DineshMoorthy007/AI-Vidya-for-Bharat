/**
 * Unit tests for Database Layer
 */

// Set environment variables BEFORE importing modules
process.env.DATABASE_PATH = './test-data/test-courses.db';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BEDROCK_MODEL_ID = 'test-model';

import { database } from './database';
import { Course } from '../types/index';
import * as fs from 'fs';
import * as path from 'path';

// Test database path
const TEST_DB_PATH = './test-data/test-courses.db';

describe('Database Layer', () => {
  beforeAll(async () => {
    // Initialize database
    await database.initialize();
  });

  afterAll(async () => {
    // Close database connection
    await database.close();
    
    // Clean up test database file
    const dbDir = path.dirname(TEST_DB_PATH);
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (fs.existsSync(dbDir)) {
      fs.rmdirSync(dbDir);
    }
  });

  beforeEach(async () => {
    // Clear all courses before each test
    await database.deleteAllCourses();
  });

  describe('Schema Creation', () => {
    it('should create courses table on initialization', async () => {
      // Database is already initialized in beforeAll
      // If we got here without errors, the table was created successfully
      const courses = await database.getAllCourses();
      expect(Array.isArray(courses)).toBe(true);
    });
  });

  describe('saveCourse', () => {
    it('should save a course to the database', async () => {
      const course: Course = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Introduction to TypeScript',
        topic: 'TypeScript',
        language: 'en',
        overview: 'Learn TypeScript basics',
        learning_outcomes: ['Understand types', 'Write type-safe code'],
        chapters: [
          { title: 'Chapter 1', content: 'Introduction to types' },
          { title: 'Chapter 2', content: 'Advanced types' }
        ],
        created_at: new Date().toISOString()
      };

      const courseId = await database.saveCourse(course);
      expect(courseId).toBe(course.id);
    });

    it('should serialize JSON fields correctly', async () => {
      const course: Course = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Test Course',
        topic: 'Testing',
        language: 'en',
        overview: 'Test overview',
        learning_outcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
        chapters: [
          { title: 'Chapter 1', content: 'Content 1' },
          { title: 'Chapter 2', content: 'Content 2' }
        ],
        created_at: new Date().toISOString()
      };

      await database.saveCourse(course);
      const retrieved = await database.getCourseById(course.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.learning_outcomes).toEqual(course.learning_outcomes);
      expect(retrieved!.chapters).toEqual(course.chapters);
    });
  });

  describe('getCourseById', () => {
    it('should retrieve a course by ID', async () => {
      const course: Course = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'JavaScript Fundamentals',
        topic: 'JavaScript',
        language: 'en',
        overview: 'Learn JavaScript',
        learning_outcomes: ['Understand JS basics'],
        chapters: [{ title: 'Intro', content: 'Introduction to JavaScript' }],
        created_at: new Date().toISOString()
      };

      await database.saveCourse(course);
      const retrieved = await database.getCourseById(course.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(course.id);
      expect(retrieved!.title).toBe(course.title);
      expect(retrieved!.topic).toBe(course.topic);
    });

    it('should return null for non-existent course', async () => {
      const retrieved = await database.getCourseById('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should deserialize JSON fields correctly', async () => {
      const course: Course = {
        id: '423e4567-e89b-12d3-a456-426614174000',
        title: 'Test Course',
        topic: 'Testing',
        language: 'hi',
        overview: 'Test overview',
        learning_outcomes: ['Learn A', 'Learn B'],
        chapters: [
          { title: 'Ch 1', content: 'Content A' },
          { title: 'Ch 2', content: 'Content B' }
        ],
        created_at: new Date().toISOString()
      };

      await database.saveCourse(course);
      const retrieved = await database.getCourseById(course.id);

      expect(retrieved!.learning_outcomes).toEqual(course.learning_outcomes);
      expect(retrieved!.chapters).toEqual(course.chapters);
      expect(Array.isArray(retrieved!.learning_outcomes)).toBe(true);
      expect(Array.isArray(retrieved!.chapters)).toBe(true);
    });
  });

  describe('getAllCourses', () => {
    it('should return empty array when no courses exist', async () => {
      const courses = await database.getAllCourses();
      expect(courses).toEqual([]);
    });

    it('should return all courses as summaries', async () => {
      const course1: Course = {
        id: '523e4567-e89b-12d3-a456-426614174000',
        title: 'Course 1',
        topic: 'Topic 1',
        language: 'en',
        overview: 'Overview 1',
        learning_outcomes: ['Outcome 1'],
        chapters: [{ title: 'Ch 1', content: 'Content 1' }],
        created_at: new Date().toISOString()
      };

      const course2: Course = {
        id: '623e4567-e89b-12d3-a456-426614174000',
        title: 'Course 2',
        topic: 'Topic 2',
        language: 'hi',
        overview: 'Overview 2',
        learning_outcomes: ['Outcome 2'],
        chapters: [{ title: 'Ch 2', content: 'Content 2' }],
        created_at: new Date().toISOString()
      };

      await database.saveCourse(course1);
      await database.saveCourse(course2);

      const courses = await database.getAllCourses();
      expect(courses).toHaveLength(2);
      expect(courses[0]).toHaveProperty('id');
      expect(courses[0]).toHaveProperty('title');
      expect(courses[0]).toHaveProperty('topic');
      expect(courses[0]).toHaveProperty('language');
      expect(courses[0]).toHaveProperty('created_at');
      expect(courses[0]).not.toHaveProperty('overview');
      expect(courses[0]).not.toHaveProperty('chapters');
    });

    it('should order courses by created_at DESC', async () => {
      const now = new Date();
      const course1: Course = {
        id: '723e4567-e89b-12d3-a456-426614174000',
        title: 'Older Course',
        topic: 'Topic',
        language: 'en',
        overview: 'Overview',
        learning_outcomes: ['Outcome'],
        chapters: [{ title: 'Ch', content: 'Content' }],
        created_at: new Date(now.getTime() - 1000).toISOString()
      };

      const course2: Course = {
        id: '823e4567-e89b-12d3-a456-426614174000',
        title: 'Newer Course',
        topic: 'Topic',
        language: 'en',
        overview: 'Overview',
        learning_outcomes: ['Outcome'],
        chapters: [{ title: 'Ch', content: 'Content' }],
        created_at: now.toISOString()
      };

      await database.saveCourse(course1);
      await database.saveCourse(course2);

      const courses = await database.getAllCourses();
      expect(courses[0].title).toBe('Newer Course');
      expect(courses[1].title).toBe('Older Course');
    });
  });

  describe('deleteAllCourses', () => {
    it('should delete all courses from database', async () => {
      const course1: Course = {
        id: '923e4567-e89b-12d3-a456-426614174000',
        title: 'Course 1',
        topic: 'Topic 1',
        language: 'en',
        overview: 'Overview',
        learning_outcomes: ['Outcome'],
        chapters: [{ title: 'Ch', content: 'Content' }],
        created_at: new Date().toISOString()
      };

      const course2: Course = {
        id: 'a23e4567-e89b-12d3-a456-426614174000',
        title: 'Course 2',
        topic: 'Topic 2',
        language: 'hi',
        overview: 'Overview',
        learning_outcomes: ['Outcome'],
        chapters: [{ title: 'Ch', content: 'Content' }],
        created_at: new Date().toISOString()
      };

      await database.saveCourse(course1);
      await database.saveCourse(course2);

      let courses = await database.getAllCourses();
      expect(courses).toHaveLength(2);

      await database.deleteAllCourses();

      courses = await database.getAllCourses();
      expect(courses).toHaveLength(0);
    });
  });

  describe('Connection Management', () => {
    it('should handle database initialization', async () => {
      // Database is already initialized in beforeAll
      // Verify it's working by performing a simple operation
      const courses = await database.getAllCourses();
      expect(Array.isArray(courses)).toBe(true);
    });
  });
});
