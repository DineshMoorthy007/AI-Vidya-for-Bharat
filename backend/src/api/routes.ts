/**
 * API Routes
 * Defines all REST endpoints for the backend
 */

import { Router, Request, Response, NextFunction } from "express";
import { courseService } from "../services/courseService";
import { chatService } from "../services/chatService";
import {
  validateCourseRequest,
  validateChatRequest,
  validateUUID,
} from "../utils/validation";
import { searchEducationalVideos } from "../services/videoSearch";

/**
 * Get language-specific keywords for better video search
 * @param languageCode The language code
 * @returns Language-specific search keywords
 */
function getLanguageKeywords(languageCode: string): string {
  const languageKeywords: Record<string, string> = {
    en: "english",
    hi: "hindi",
    ta: "tamil தமிழ்",
    te: "telugu తెలుగు",
    kn: "kannada ಕನ್ನಡ",
    ml: "malayalam മലയാളം",
    bn: "bengali বাংলা",
    gu: "gujarati ગુજરાતી",
    mr: "marathi मराठी",
    pa: "punjabi ਪੰਜਾਬੀ",
    or: "odia ଓଡ଼ିଆ",
    as: "assamese অসমীয়া",
    ur: "urdu اردو",
  };

  return languageKeywords[languageCode] || "english";
}

/**
 * Creates and configures the API router
 * @returns Configured Express router with all API endpoints
 */
export function createRouter(): Router {
  const router = Router();

  /**
   * POST /api/generate-course
   * Generate a new AI-powered course
   *
   * Requirements: 1.1, 1.6
   */
  router.post(
    "/api/generate-course",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const topicRaw = req.body?.topic || req.query.topic;
        const languageRaw = req.body?.language || req.query.lang;

        const topic = typeof topicRaw === "string" ? topicRaw.trim() : "";
        const language =
          typeof languageRaw === "string" ? languageRaw.trim() : "";

        console.log("Generate course request:", topic, language);

        if (!topic) {
          res.status(400).json({ error: "Topic is required" });
          return;
        }

        // Validate topic and language constraints
        const validation = validateCourseRequest(topic, language);
        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }

        // Generate course using Course Service
        const courseId = await courseService.generateCourse(topic, language);

        // Return courseId in response
        res.status(200).json({ courseId });
      } catch (error) {
        console.error("Course generation failed:", error);
        res.status(500).json({ error: "Course generation failed" });
      }
    },
  );

  /**
   * GET /api/course/:id
   * Retrieve a previously generated course by ID
   *
   * Requirements: 2.1
   */
  router.get(
    "/api/course/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { id } = req.params;

        // Validate UUID format
        const validation = validateUUID(id);
        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }

        // Retrieve course from database
        const course = await courseService.getCourse(id);

        // Return 404 if course not found
        if (!course) {
          res.status(404).json({ error: "Course not found" });
          return;
        }

        // Return full course object
        res.status(200).json(course);
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * GET /api/courses
   * List all generated courses (summary view)
   *
   * Requirements: 3.1
   */
  router.get(
    "/api/courses",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Retrieve all courses from database
        const courses = await courseService.listCourses();

        // Return array of course summaries
        res.status(200).json(courses);
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * DELETE /api/courses
   * Delete all courses from the database
   *
   * Requirements: 4.1
   */
  router.delete(
    "/api/courses",
    async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Delete all courses
        await courseService.deleteAllCourses();

        // Return success message
        res.status(200).json({ message: "All courses deleted successfully" });
      } catch (error) {
        next(error);
      }
    },
  );

  /**
   * POST /api/chat
   * Send a message to the AI tutor for a specific course
   *
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  router.post(
    "/api/chat",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { message, courseId } = req.body;

        // Validate request body
        if (!message || !courseId) {
          res.status(400).json({
            error: "Missing required fields: message and courseId are required",
          });
          return;
        }

        // Validate message and courseId constraints
        const validation = validateChatRequest(message, courseId);
        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }

        // Send message to chat service
        const reply = await chatService.sendMessage(message, courseId);

        // Return tutor reply
        res.status(200).json({ reply });
      } catch (error) {
        // Check if error is "Course not found"
        if (error instanceof Error && error.message === "Course not found") {
          res.status(404).json({ error: "Course not found" });
          return;
        }
        next(error);
      }
    },
  );

  /**
   * GET /api/videos/search
   * Search for educational YouTube videos for a course topic
   *
   * Query Parameters:
   * - topic: (required) Course topic to search for
   * - language: (optional) Language preference for videos (default: en)
   * - limit: (optional) Maximum results (1-10, default: 3)
   */
  router.get(
    "/api/videos/search",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { topic, language } = req.query;
        const limit = parseInt((req.query.limit as string) || "3");

        // Validate input
        if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
          res.status(400).json({ error: "Course topic is required" });
          return;
        }

        if (limit < 1 || limit > 10) {
          res.status(400).json({ error: "Limit must be between 1 and 10" });
          return;
        }

        // Search for videos using topic and language
        const languageCode =
          typeof language === "string" ? language.trim() : "en";

        // Create language-specific search query
        const languageKeywords = getLanguageKeywords(languageCode);
        const searchQuery = `${topic.trim()} ${languageKeywords} educational tutorial`;

        const videos = await searchEducationalVideos(searchQuery, languageCode);

        // Return limited results
        res.status(200).json({
          success: true,
          topic: topic.trim(),
          language: language || "en",
          videos: videos.slice(0, limit),
          count: Math.min(videos.length, limit),
        });
      } catch (error) {
        console.error("Video search error:", error);
        next(error);
      }
    },
  );

  return router;
}
