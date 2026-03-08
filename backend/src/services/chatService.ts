/**
 * Chat Service
 * Handles AI tutor conversations with course context
 */

import { bedrockClient } from './aiService';
import { database } from '../database/database';

/**
 * Chat Service class
 * Handles business logic for AI tutor interactions
 */
class ChatService {
  /**
   * Send a message to the AI tutor for a specific course
   * @param message - The user's question (1-1000 characters)
   * @param courseId - The course ID (UUID v4 format)
   * @returns AI-generated tutor response
   * @throws Error with "Course not found" if courseId doesn't exist
   * @throws Error with "Chat service failed" if AI service fails
   */
  async sendMessage(message: string, courseId: string): Promise<string> {
    try {
      // Retrieve course context from database
      const course = await database.getCourseById(courseId);
      
      // Handle course not found error
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Call AI service with context
      const reply = await bedrockClient.generateTutorResponse(message, course);
      
      return reply;
    } catch (error) {
      // Re-throw "Course not found" errors as-is
      if (error instanceof Error && error.message === 'Course not found') {
        throw error;
      }
      
      // Log and wrap other errors
      console.error('Chat service failed:', error);
      throw new Error('Chat service failed');
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export { ChatService };
