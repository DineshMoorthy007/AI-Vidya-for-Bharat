# Implementation Plan: Backend Core

## Overview

This plan implements a Node.js Express REST API server with AWS Bedrock AI integration and SQLite persistence. The implementation follows a modular architecture with clear separation between API, service, AI integration, and data layers. Tasks are organized to build incrementally, validating core functionality early through code and tests.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js project with TypeScript configuration
  - Install core dependencies: express, aws-sdk, sqlite3, uuid
  - Install dev dependencies: jest, fast-check, @types packages, ts-node
  - Create directory structure: src/api, src/services, src/database, src/config, src/types
  - Configure TypeScript with strict mode and ES modules
  - Set up Jest configuration for TypeScript
  - _Requirements: Non-Functional.1, Non-Functional.2_

- [x] 2. Implement configuration management
  - [x] 2.1 Create Config Manager module
    - Implement environment variable loading and validation
    - Add required config keys: AWS_REGION, AWS_BEDROCK_MODEL_ID, DATABASE_PATH
    - Add optional config keys: PORT, NODE_ENV with defaults
    - Implement getRequired() method that throws on missing vars
    - _Requirements: Config.1_
  
  - [ ]* 2.2 Write property test for Config Manager
    - **Property 13: Configuration Validation at Startup**
    - **Validates: Requirements Config.1**

- [x] 3. Implement data models and type definitions
  - [x] 3.1 Create TypeScript interfaces
    - Define Course, Chapter, CourseSummary interfaces
    - Define ChatMessage, ChatResponse interfaces
    - Define ErrorResponse interface
    - Add validation constraints as JSDoc comments
    - _Requirements: 1, 2, 3, 5_
  
  - [x] 3.2 Create validation utilities
    - Implement topic validation (3-200 chars)
    - Implement language validation (enum check)
    - Implement UUID format validation
    - Implement chat message validation (1-1000 chars)
    - _Requirements: Security.1, Security.2, Security.3_
  
  - [ ]* 3.3 Write property test for input validation
    - **Property 1: Input Validation Completeness**
    - **Validates: Requirements 1.1, Security.1, Security.2, Security.3**

- [x] 4. Implement Database Layer
  - [x] 4.1 Create SQLite database module
    - Implement database initialization with schema creation
    - Create courses table with indexes
    - Implement connection management
    - _Requirements: Database.1, Database.2_
  
  - [x] 4.2 Implement CRUD operations
    - Implement saveCourse() with JSON serialization
    - Implement getCourseById() with JSON deserialization
    - Implement getAllCourses() returning summaries
    - Implement deleteAllCourses()
    - _Requirements: 1.5, 2.1, 3.1, 4.1_
  
  - [ ]* 4.3 Write property test for database round-trip
    - **Property 4: Database Storage Round-Trip**
    - **Validates: Requirements 1.5**
  
  - [ ]* 4.4 Write unit tests for database operations
    - Test CRUD operations with sample data
    - Test JSON serialization/deserialization
    - Test empty database scenarios
    - _Requirements: Database.1, Database.2_

- [x] 5. Checkpoint - Ensure database layer works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement AI Service Layer
  - [x] 6.1 Create AWS Bedrock client wrapper
    - Initialize Bedrock Runtime client with config
    - Implement error handling and retry logic (3 attempts, exponential backoff)
    - _Requirements: AI.1, AI.2_
  
  - [x] 6.2 Implement course generation AI logic
    - Create prompt template for course generation
    - Implement generateCourse() method
    - Parse and validate JSON response from Bedrock
    - Handle malformed JSON responses
    - _Requirements: 1.2, 1.3, 1.4, AI.3_
  
  - [ ]* 6.3 Write property test for prompt construction
    - **Property 2: Course Generation Prompt Structure**
    - **Validates: Requirements 1.2**
  
  - [ ]* 6.4 Write property test for AI response parsing
    - **Property 3: AI Response Parsing Correctness**
    - **Validates: Requirements 1.4**
  
  - [x] 6.5 Implement AI tutor logic
    - Create prompt template for tutor responses
    - Implement generateTutorResponse() method
    - Include course context in prompt
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 6.6 Write property test for tutor prompt context
    - **Property 10: Tutor Prompt Context Inclusion**
    - **Validates: Requirements 5.2**
  
  - [ ]* 6.7 Write unit tests for AI service
    - Mock Bedrock responses
    - Test retry logic with simulated failures
    - Test JSON parsing edge cases
    - _Requirements: AI.1, AI.2, AI.3_

- [x] 7. Implement Service Layer
  - [x] 7.1 Create Course Service
    - Implement generateCourse() orchestrating AI and database
    - Generate UUID v4 for course IDs
    - Implement getCourse() retrieving from database
    - Implement listCourses() returning summaries
    - Implement deleteAllCourses()
    - _Requirements: 1, 2, 3, 4_
  
  - [ ]* 7.2 Write property test for course ID format
    - **Property 5: Course ID Format Validity**
    - **Validates: Requirements 1.6**
  
  - [ ]* 7.3 Write property test for retrieval idempotency
    - **Property 6: Retrieval Idempotency**
    - **Validates: Requirements 2.1**
  
  - [ ]* 7.4 Write property test for listing completeness
    - **Property 7: Course Listing Completeness**
    - **Validates: Requirements 3.1**
  
  - [ ]* 7.5 Write property test for deletion completeness
    - **Property 8: Course Deletion Completeness**
    - **Validates: Requirements 4.1**
  
  - [x] 7.6 Create Chat Service
    - Implement sendMessage() method
    - Retrieve course context from database
    - Call AI service with context
    - Handle course not found errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 7.7 Write property test for chat context retrieval
    - **Property 9: Chat Context Retrieval**
    - **Validates: Requirements 5.1**
  
  - [ ]* 7.8 Write property test for chat response format
    - **Property 11: Chat Response Format**
    - **Validates: Requirements 5.4**
  
  - [ ]* 7.9 Write property test for chat message validation
    - **Property 14: Chat Message Validation**
    - **Validates: Requirements 1.1 (applied to chat endpoint)**

- [x] 8. Checkpoint - Ensure service layer works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement API Layer
  - [x] 9.1 Create Express server setup
    - Initialize Express app
    - Configure JSON body parser
    - Configure CORS for frontend integration
    - Add request logging middleware
    - _Requirements: Non-Functional.1, Non-Functional.2_
  
  - [x] 9.2 Implement error handling middleware
    - Create global error handler
    - Format error responses consistently
    - Handle validation errors (400)
    - Handle not found errors (404)
    - Handle server errors (500)
    - Sanitize errors in production mode
    - _Requirements: Error.1, Error.3, Error.4_
  
  - [ ]* 9.3 Write property test for structured error handling
    - **Property 12: Structured Error Handling**
    - **Validates: Requirements Error.1, Error.3, Error.4**
  
  - [x] 9.4 Implement POST /api/generate-course endpoint
    - Add request validation middleware
    - Call Course Service generateCourse()
    - Return courseId in response
    - Handle errors with appropriate status codes
    - _Requirements: 1.1, 1.6_
  
  - [x] 9.5 Implement GET /api/course/:id endpoint
    - Validate course ID format
    - Call Course Service getCourse()
    - Return 404 if course not found
    - Return full course object
    - _Requirements: 2.1_
  
  - [ ]* 9.6 Write property test for course not found handling
    - **Property 15: Course Not Found Handling**
    - **Validates: Requirements Error.1**
  
  - [x] 9.7 Implement GET /api/courses endpoint
    - Call Course Service listCourses()
    - Return array of course summaries
    - _Requirements: 3.1_
  
  - [x] 9.8 Implement DELETE /api/courses endpoint
    - Call Course Service deleteAllCourses()
    - Return success message
    - Handle errors with 500 status
    - _Requirements: 4.1_
  
  - [x] 9.9 Implement POST /api/chat endpoint
    - Add request validation middleware
    - Call Chat Service sendMessage()
    - Return tutor reply
    - Handle course not found (404)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Create server entry point and startup
  - [x] 10.1 Create main server file
    - Initialize Config Manager and validate environment
    - Initialize Database Layer
    - Initialize services with dependencies
    - Start Express server on configured port
    - Add graceful shutdown handling
    - _Requirements: Config.1, Non-Functional.1, Non-Functional.2, Non-Functional.3_
  
  - [x] 10.2 Create npm scripts
    - Add "dev" script with ts-node and nodemon
    - Add "build" script for TypeScript compilation
    - Add "start" script for production
    - Add "test" script for Jest
    - Add "test:property" script for property tests only
    - _Requirements: Non-Functional.2_

- [x] 11. Integration testing and validation
  - [ ]* 11.1 Write end-to-end integration tests
    - Test complete course generation flow
    - Test complete chat flow
    - Test error propagation through layers
    - Use real SQLite database (in-memory or temp file)
    - Mock AWS Bedrock calls
    - _Requirements: 1, 2, 3, 4, 5_
  
  - [x] 11.2 Create environment configuration template
    - Create .env.example file with all required variables
    - Document each configuration option
    - _Requirements: Config.1_
  
  - [x] 11.3 Create README with setup instructions
    - Document installation steps
    - Document environment configuration
    - Document API endpoints
    - Document how to run tests
    - _Requirements: Non-Functional.3, Non-Functional.4_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with Express.js, AWS SDK, and SQLite
- AWS Bedrock integration requires valid AWS credentials and configuration
- Database file will be created automatically on first run
- All 15 correctness properties from the design are covered by property tests
