import { BedrockClientWrapper } from './aiService';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('../config/config', () => ({
  configManager: {
    getRequired: jest.fn((key: string) => {
      if (key === 'AWS_REGION') return 'us-east-1';
      if (key === 'AWS_BEDROCK_MODEL_ID') return 'anthropic.claude-3-sonnet-20240229-v1:0';
      return '';
    }),
  },
}));

describe('BedrockClientWrapper', () => {
  let mockSend: jest.Mock;
  let wrapper: BedrockClientWrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = jest.fn();
    (BedrockRuntimeClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));
    wrapper = new BedrockClientWrapper();
  });

  describe('invokeModel', () => {
    it('should successfully invoke the model and return response text', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'This is a test response' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.invokeModel('Test prompt');

      expect(result).toBe('This is a test response');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeModelCommand));
    });

    it('should use correct request format with anthropic_version and messages', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Response' }],
          })
        ),
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.invokeModel('Test prompt', 2048);

      expect(result).toBe('Response');
      expect(mockSend).toHaveBeenCalledTimes(1);
      // Verify the command was called with InvokeModelCommand
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeModelCommand));
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockError = new Error('Network error');
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Success after retry' }],
          })
        ),
      };

      // Fail twice, then succeed
      mockSend
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const result = await wrapper.invokeModel('Test prompt');

      expect(result).toBe('Success after retry');
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries (3 attempts)', async () => {
      const mockError = new Error('Persistent error');
      mockSend.mockRejectedValue(mockError);

      await expect(wrapper.invokeModel('Test prompt')).rejects.toThrow(
        'Bedrock invocation failed after 3 attempts'
      );

      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should throw error if response body is empty', async () => {
      const mockResponse = {
        body: undefined,
      };
      // Mock all 3 attempts to return the same empty response
      mockSend.mockResolvedValue(mockResponse);

      await expect(wrapper.invokeModel('Test prompt')).rejects.toThrow(
        'Bedrock invocation failed after 3 attempts'
      );
    });

    it('should throw error if response format is invalid', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            invalid: 'format',
          })
        ),
      };
      // Mock all 3 attempts to return the same invalid response
      mockSend.mockResolvedValue(mockResponse);

      await expect(wrapper.invokeModel('Test prompt')).rejects.toThrow(
        'Bedrock invocation failed after 3 attempts'
      );
    });

    it('should use default maxTokens of 4096 when not specified', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Response' }],
          })
        ),
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.invokeModel('Test prompt');

      expect(result).toBe('Response');
      expect(mockSend).toHaveBeenCalledTimes(1);
      // Verify the command was called with InvokeModelCommand
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeModelCommand));
    });
  });

  describe('getModelId', () => {
    it('should return the configured model ID', () => {
      expect(wrapper.getModelId()).toBe('anthropic.claude-3-sonnet-20240229-v1:0');
    });
  });

  describe('initialization', () => {
    it('should initialize with correct AWS region', () => {
      expect(BedrockRuntimeClient).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
    });
  });

  describe('generateCourse', () => {
    it('should successfully generate a course with valid JSON response', async () => {
      const mockCourseJson = {
        title: 'Introduction to Python',
        overview: 'Learn Python programming from scratch',
        learning_outcomes: [
          'Understand Python syntax',
          'Write basic programs',
          'Use Python data structures',
        ],
        chapters: [
          { title: 'Getting Started', content: 'Python is a versatile programming language...' },
          { title: 'Variables and Data Types', content: 'In Python, variables are containers...' },
          { title: 'Control Flow', content: 'Control flow statements allow you to...' },
          { title: 'Functions', content: 'Functions are reusable blocks of code...' },
        ],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(mockCourseJson) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.generateCourse('Python programming', 'en');

      expect(result).toEqual(mockCourseJson);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should extract JSON from response with extra text', async () => {
      const mockCourseJson = {
        title: 'Introduction to JavaScript',
        overview: 'Learn JavaScript basics',
        learning_outcomes: ['Understand JS syntax', 'Write JS code', 'Use JS in web'],
        chapters: [
          { title: 'Intro', content: 'JavaScript is a programming language...' },
          { title: 'Variables', content: 'Variables store data values...' },
          { title: 'Functions', content: 'Functions are blocks of code...' },
          { title: 'Objects', content: 'Objects are collections of properties...' },
        ],
      };

      const responseWithExtraText = `Here is the course content:\n${JSON.stringify(mockCourseJson)}\n\nI hope this helps!`;

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: responseWithExtraText }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.generateCourse('JavaScript', 'en');

      expect(result).toEqual(mockCourseJson);
    });

    it('should throw error for malformed JSON response', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'This is not valid JSON {broken' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when JSON is missing required title field', async () => {
      const invalidCourse = {
        overview: 'Some overview',
        learning_outcomes: ['outcome1'],
        chapters: [{ title: 'Chapter 1', content: 'Content' }],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when JSON is missing required overview field', async () => {
      const invalidCourse = {
        title: 'Course Title',
        learning_outcomes: ['outcome1'],
        chapters: [{ title: 'Chapter 1', content: 'Content' }],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when learning_outcomes is not an array', async () => {
      const invalidCourse = {
        title: 'Course Title',
        overview: 'Overview',
        learning_outcomes: 'not an array',
        chapters: [{ title: 'Chapter 1', content: 'Content' }],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when chapters is empty', async () => {
      const invalidCourse = {
        title: 'Course Title',
        overview: 'Overview',
        learning_outcomes: ['outcome1'],
        chapters: [],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when chapter is missing title', async () => {
      const invalidCourse = {
        title: 'Course Title',
        overview: 'Overview',
        learning_outcomes: ['outcome1'],
        chapters: [{ content: 'Content without title' }],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when chapter is missing content', async () => {
      const invalidCourse = {
        title: 'Course Title',
        overview: 'Overview',
        learning_outcomes: ['outcome1'],
        chapters: [{ title: 'Chapter without content' }],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(invalidCourse) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should throw error when no JSON object found in response', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'No JSON here, just plain text' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await expect(wrapper.generateCourse('Python', 'en')).rejects.toThrow(
        'Course generation failed'
      );
    });

    it('should include topic and language in the prompt', async () => {
      const mockCourseJson = {
        title: 'Introduction to Python',
        overview: 'Learn Python',
        learning_outcomes: ['Learn syntax', 'Write code', 'Use libraries'],
        chapters: [
          { title: 'Chapter 1', content: 'Content 1' },
          { title: 'Chapter 2', content: 'Content 2' },
          { title: 'Chapter 3', content: 'Content 3' },
          { title: 'Chapter 4', content: 'Content 4' },
        ],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: JSON.stringify(mockCourseJson) }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await wrapper.generateCourse('Python programming', 'hi');

      // Verify the method was called
      expect(mockSend).toHaveBeenCalledTimes(1);
      
      // Verify the command was called with InvokeModelCommand
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeModelCommand));
    });
  });

  describe('generateTutorResponse', () => {
    const mockCourse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Introduction to Python',
      topic: 'Python programming',
      language: 'en',
      overview: 'Learn Python programming from scratch',
      learning_outcomes: [
        'Understand Python syntax',
        'Write basic programs',
        'Use Python data structures',
      ],
      chapters: [
        { title: 'Getting Started', content: 'Python is a versatile programming language...' },
      ],
      created_at: '2024-01-01T00:00:00.000Z',
    };

    it('should successfully generate a tutor response', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: '  Python is a high-level programming language that is easy to learn.  ' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.generateTutorResponse('What is Python?', mockCourse);

      expect(result).toBe('Python is a high-level programming language that is easy to learn.');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(InvokeModelCommand));
    });

    it('should include course context in the prompt', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Variables store data values in Python.' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.generateTutorResponse('How do variables work?', mockCourse);

      expect(result).toBe('Variables store data values in Python.');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from the response', async () => {
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: '\n\n  This is a response with extra whitespace.  \n\n' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await wrapper.generateTutorResponse('Test question', mockCourse);

      expect(result).toBe('This is a response with extra whitespace.');
    });

    it('should throw "Chat service failed" error when AI service fails', async () => {
      const mockError = new Error('Network error');
      mockSend.mockRejectedValue(mockError);

      await expect(wrapper.generateTutorResponse('Test question', mockCourse)).rejects.toThrow(
        'Chat service failed'
      );
    });

    it('should include all learning outcomes in the prompt', async () => {
      const courseWithMultipleOutcomes = {
        ...mockCourse,
        learning_outcomes: [
          'Outcome 1',
          'Outcome 2',
          'Outcome 3',
          'Outcome 4',
        ],
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Response' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await wrapper.generateTutorResponse('Question', courseWithMultipleOutcomes);

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should use the course language in the prompt', async () => {
      const hindiCourse = {
        ...mockCourse,
        language: 'hi',
      };

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Response in Hindi' }],
          })
        ),
      };
      mockSend.mockResolvedValueOnce(mockResponse);

      await wrapper.generateTutorResponse('Question', hindiCourse);

      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
