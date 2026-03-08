/**
 * Course Service
 * Orchestrates course generation, retrieval, listing, and deletion
 * Integrates AI service and database layer
 */

import { v4 as uuidv4 } from 'uuid';
import { bedrockClient } from './aiService';
import { database } from '../database/database';
import { Course, CourseSummary } from '../types';

/**
 * Course Service class
 * Handles business logic for course operations
 */
class CourseService {
  /**
   * Generate a new course using AI and store it in the database
   * @param topic - The course topic (3-200 characters)
   * @param language - The language for the course content
   * @returns The generated course ID (UUID v4)
   * @throws Error if course generation or storage fails
   */
  async generateCourse(topic: string, language: string): Promise<string> {
    try {
      // Generate UUID v4 for the course
      const courseId = uuidv4();
      
      // Generate course content using AI service
      const courseContent = await bedrockClient.generateCourse(topic, language);
      
      // Create the complete course object
      const course: Course = {
        id: courseId,
        title: courseContent.title,
        topic,
        language,
        overview: courseContent.overview,
        learning_outcomes: courseContent.learning_outcomes,
        chapters: courseContent.chapters,
        created_at: new Date().toISOString(),
      };
      
      // Store the course in the database
      await database.saveCourse(course);
      
      return courseId;
    } catch (error) {
      console.error('Course generation failed:', error);
      throw new Error('Course generation failed');
    }
  }

  /**
   * Retrieve a course by ID from the database
   * @param id - The course ID (UUID v4)
   * @returns The course object or null if not found
   * @throws Error if database retrieval fails
   */
  async getCourse(id: string): Promise<Course | null> {
    try {
      return await database.getCourseById(id);
    } catch (error) {
      console.error('Failed to retrieve course:', error);
      throw new Error('Failed to retrieve course');
    }
  }

  /**
   * List all courses (summary view)
   * @returns Array of course summaries
   * @throws Error if database query fails
   */
  async listCourses(): Promise<CourseSummary[]> {
    try {
      return await database.getAllCourses();
    } catch (error) {
      console.error('Failed to list courses:', error);
      throw new Error('Failed to list courses');
    }
  }

  /**
   * Delete all courses from the database
   * @throws Error if deletion fails
   */
  async deleteAllCourses(): Promise<void> {
    try {
      await database.deleteAllCourses();
    } catch (error) {
      console.error('Failed to delete courses:', error);
      throw new Error('Failed to delete courses');
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();
export { CourseService };
