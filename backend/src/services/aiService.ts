import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { configManager } from '../config/config';
import { Chapter, Course } from '../types';

/**
 * AWS Bedrock Client Wrapper
 * Handles initialization, error handling, and retry logic for AWS Bedrock Runtime
 */
class BedrockClientWrapper {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor() {
    const region = configManager.getRequired('AWS_REGION') as string;
    this.modelId = configManager.getRequired('AWS_BEDROCK_MODEL_ID') as string;

    // Initialize Bedrock Runtime client with config
    this.client = new BedrockRuntimeClient({
      region,
    });
  }

  /**
   * Invoke the Bedrock model with retry logic
   * @param prompt - The prompt to send to the model
   * @param maxTokens - Maximum tokens for the response (default: 4096)
   * @returns The model's response text
   * @throws Error if all retry attempts fail
   */
  async invokeModel(prompt: string, maxTokens: number = 4096): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const input: InvokeModelCommandInput = {
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: maxTokens,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        };

        const command = new InvokeModelCommand(input);
        const response = await this.client.send(command);

        // Parse the response
        if (!response.body) {
          throw new Error('Empty response from Bedrock');
        }

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Extract the text content from Claude's response format
        if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content.length > 0) {
          return responseBody.content[0].text;
        }

        throw new Error('Invalid response format from Bedrock');
      } catch (error) {
        lastError = error as Error;
        
        // Log the error
        console.error(`Bedrock invocation attempt ${attempt} failed:`, error);

        // If this is not the last attempt, wait before retrying with exponential backoff
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(`Bedrock invocation failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Sleep utility for retry delays
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the configured model ID
   */
  getModelId(): string {
    return this.modelId;
  }

  /**
   * Generate a course using AI based on topic and language
   * @param topic - The course topic
   * @param language - The language for the course content
   * @returns Course content (title, overview, learning_outcomes, chapters)
   * @throws Error if course generation fails or JSON is malformed
   */
  async generateCourse(topic: string, language: string): Promise<CourseContent> {
    const prompt = this.buildCoursePrompt(topic, language);
    
    try {
      const response = await this.invokeModel(prompt);
      return this.parseCourseResponse(response);
    } catch (error) {
      console.error('Bedrock course generation failed, using fallback template:', error);
      return this.buildFallbackCourseContent(topic, language);
    }
  }

  /**
   * Build a local fallback course template when Bedrock is unavailable.
   * This preserves the exact CourseContent response shape used by normal AI output.
   */
  private buildFallbackCourseContent(topic: string, language: string): CourseContent {
    const safeTopic = topic.trim() || 'General Topic';
    const chapterTitles = [
      `Introduction to ${safeTopic}`,
      `Core Concepts of ${safeTopic}`,
      'Practical Applications',
      'Common Mistakes',
      'Hands-on Exercises',
      'Advanced Concepts',
      'Mini Project',
      'Summary and Next Steps',
    ];

    return {
      title: `Course on ${safeTopic}`,
      overview: `This is an introductory course about ${safeTopic}.`,
      learning_outcomes: [
        `Understand the fundamentals of ${safeTopic}`,
        `Explain core concepts of ${safeTopic} with confidence`,
        `Apply ${safeTopic} concepts in practical scenarios`,
        `Build a small project and plan next learning steps`,
      ],
      chapters: chapterTitles.map((chapterTitle) => ({
        title: chapterTitle,
        content: `This chapter covers ${chapterTitle.toLowerCase()} for ${safeTopic}. It is provided as fallback content while the AI service is temporarily unavailable. Continue learning in ${language}.`,
      })),
    };
  }

  /**
   * Build the prompt template for course generation
   * @param topic - The course topic
   * @param language - The language for the course content
   * @returns Formatted prompt string
   */
  private buildCoursePrompt(topic: string, language: string): string {
    return `Generate a beginner-friendly course about "${topic}".

Language: ${language}

Return ONLY valid JSON in this exact format:
{
  "title": "Course title",
  "overview": "Brief course overview",
  "learning_outcomes": ["outcome1", "outcome2", "outcome3"],
  "chapters": [
    {
      "title": "Chapter title",
      "content": "Detailed chapter content"
    }
  ]
}

Requirements:
- Include 3-5 learning outcomes
- Create 4-6 chapters
- Each chapter should have substantial content (200-400 words)
- Content should be educational and beginner-friendly
- Use ${language} language for all content`;
  }

  /**
   * Parse and validate the JSON response from Bedrock
   * @param response - Raw response text from Bedrock
   * @returns Parsed and validated course content
   * @throws Error if JSON is malformed or missing required fields
   */
  private parseCourseResponse(response: string): CourseContent {
    try {
      // Try to extract JSON from the response
      // Sometimes the model may include extra text before/after the JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.title || typeof parsed.title !== 'string') {
        throw new Error('Missing or invalid "title" field');
      }
      if (!parsed.overview || typeof parsed.overview !== 'string') {
        throw new Error('Missing or invalid "overview" field');
      }
      if (!Array.isArray(parsed.learning_outcomes) || parsed.learning_outcomes.length === 0) {
        throw new Error('Missing or invalid "learning_outcomes" field');
      }
      if (!Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
        throw new Error('Missing or invalid "chapters" field');
      }

      // Validate chapters structure
      for (const chapter of parsed.chapters) {
        if (!chapter.title || typeof chapter.title !== 'string') {
          throw new Error('Chapter missing or invalid "title" field');
        }
        if (!chapter.content || typeof chapter.content !== 'string') {
          throw new Error('Chapter missing or invalid "content" field');
        }
      }

      return {
        title: parsed.title,
        overview: parsed.overview,
        learning_outcomes: parsed.learning_outcomes,
        chapters: parsed.chapters,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Malformed JSON response from AI service');
      }
      throw error;
    }
  }
    /**
     * Generate a tutor response using AI based on user message and course context
     * @param message - The user's question
     * @param courseContext - The course object containing context for the tutor
     * @returns AI-generated tutor response
     * @throws Error if tutor response generation fails
     */
    async generateTutorResponse(message: string, courseContext: Course): Promise<string> {
      const prompt = this.buildTutorPrompt(message, courseContext);

      try {
        const response = await this.invokeModel(prompt);
        return response.trim();
      } catch (error) {
        console.error('Tutor response generation failed:', error);
        throw new Error('Chat service failed');
      }
    }

    /**
     * Build the prompt template for tutor responses
     * @param message - The user's question
     * @param courseContext - The course object containing context
     * @returns Formatted prompt string
     */
    private buildTutorPrompt(message: string, courseContext: Course): string {
      const learningOutcomes = courseContext.learning_outcomes
        .map((outcome, index) => `${index + 1}. ${outcome}`)
        .join('\n');

      return `You are an AI tutor helping a student learn about: ${courseContext.title}

  Course Overview: ${courseContext.overview}

  Learning Outcomes:
  ${learningOutcomes}

  Student Question: ${message}

  Provide a helpful, educational response that:
  - Directly answers the question
  - Relates to the course content
  - Is encouraging and supportive
  - Uses ${courseContext.language} language`;
    }
}

/**
 * Course content structure returned by AI service
 */
export interface CourseContent {
  title: string;
  overview: string;
  learning_outcomes: string[];
  chapters: Chapter[];
}

// Export singleton instance
export const bedrockClient = new BedrockClientWrapper();
export { BedrockClientWrapper };
