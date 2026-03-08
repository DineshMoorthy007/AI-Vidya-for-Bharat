# AI Vidya Backend Core

Backend API server for the AI Vidya for Bharat platform. This lightweight Express server provides AI-powered course generation and chat functionality using AWS Bedrock.

## Prerequisites

- Node.js 18+ and npm
- AWS account with Bedrock access
- AWS credentials configured (via AWS CLI or environment variables)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```env
AWS_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
DATABASE_PATH=./data/courses.db
PORT=3001
NODE_ENV=development
```

4. Configure AWS credentials (choose one method):
   - Run `aws configure` to set up credentials via AWS CLI
   - Set environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Use IAM role (if running on EC2/ECS)

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Course Generation

**POST /api/generate-course**

Generate a new course based on a topic and target audience.

Request body:
```json
{
  "topic": "Introduction to JavaScript",
  "targetAudience": "beginners"
}
```

Response:
```json
{
  "id": "uuid-v4",
  "topic": "Introduction to JavaScript",
  "targetAudience": "beginners",
  "modules": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Course by ID

**GET /api/course/:id**

Retrieve a specific course by its ID.

Response:
```json
{
  "id": "uuid-v4",
  "topic": "Introduction to JavaScript",
  "targetAudience": "beginners",
  "modules": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### List All Courses

**GET /api/courses**

Retrieve all courses (metadata only, without full module content).

Response:
```json
[
  {
    "id": "uuid-v4",
    "topic": "Introduction to JavaScript",
    "targetAudience": "beginners",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Delete All Courses

**DELETE /api/courses**

Delete all courses from the database.

Response:
```json
{
  "message": "All courses deleted successfully"
}
```

### Chat with Course Content

**POST /api/chat**

Ask questions about a specific course using AI.

Request body:
```json
{
  "courseId": "uuid-v4",
  "message": "What are the main topics covered?"
}
```

Response:
```json
{
  "response": "The course covers variables, functions, arrays..."
}
```

## Running Tests

Run all tests (unit + property-based):
```bash
npm test
```

Run only unit tests:
```bash
npm test:unit
```

Run only property-based tests:
```bash
npm test:property
```

Run tests in watch mode (for development):
```bash
npm test:watch
```

### Test Structure

- **Unit tests** (`*.test.ts`): Test specific functionality with concrete examples
- **Property-based tests** (`*.property.test.ts`): Test universal properties across many generated inputs using fast-check

## Project Structure

```
backend/
├── src/
│   ├── api/          # Express routes and middleware
│   ├── services/     # Business logic (course, chat, AI)
│   ├── database/     # SQLite database layer
│   ├── config/       # Configuration management
│   ├── types/        # TypeScript type definitions
│   └── index.ts      # Application entry point
├── dist/             # Compiled JavaScript (generated)
├── data/             # SQLite database files (generated)
├── .env              # Environment configuration (create from .env.example)
└── package.json      # Dependencies and scripts
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_REGION` | Yes | - | AWS region for Bedrock service (e.g., us-east-1) |
| `AWS_BEDROCK_MODEL_ID` | Yes | - | Bedrock model ID (e.g., anthropic.claude-3-sonnet-20240229-v1:0) |
| `DATABASE_PATH` | Yes | - | Path to SQLite database file (e.g., ./data/courses.db) |
| `PORT` | No | 3001 | Server port number |
| `NODE_ENV` | No | development | Environment mode (development/production/test) |

## Integration with Frontend

The backend is designed to integrate seamlessly with the AI Vidya frontend:

1. Ensure the backend is running on port 3001 (or update frontend API configuration)
2. The frontend expects the backend at `http://localhost:3001`
3. CORS is configured to allow requests from the frontend origin

## Troubleshooting

**AWS Credentials Error:**
- Verify AWS credentials are configured: `aws sts get-caller-identity`
- Check that your AWS account has Bedrock access enabled
- Ensure the specified region supports Bedrock

**Database Error:**
- Verify the `DATABASE_PATH` directory exists or can be created
- Check file permissions for the database directory

**Port Already in Use:**
- Change the `PORT` in `.env` to an available port
- Kill the process using the port: `lsof -ti:3001 | xargs kill` (macOS/Linux)

## License

MIT
