# AI Vidya for Bharat - Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │   PWA        │  │  Mobile Web  │      │
│  │  (Desktop)   │  │  (Offline)   │  │  (Touch UI)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware (Auth, i18n, Rate Limiting)              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Server       │  │ API Routes   │  │ Client       │    │
│  │ Components   │  │              │  │ Components   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Clerk      │  │  Neon DB     │  │  External    │
│   Auth       │  │  (Postgres)  │  │  APIs        │
└──────────────┘  └──────────────┘  └──────────────┘
                                            │
                    ┌───────────────────────┼───────────────────┐
                    ▼                       ▼                   ▼
            ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
            │   Gemini     │      │  Bhashini    │    │  YouTube     │
            │   AI API     │      │  Speech API  │    │  Data API    │
            └──────────────┘      └──────────────┘    └──────────────┘
```

### 1.2 Technology Stack Rationale

**Next.js 15 (App Router)**
- Server-side rendering for SEO and initial load performance
- React Server Components reduce client-side JavaScript
- Built-in API routes for backend logic
- Edge runtime support for global low-latency

**Clerk Authentication**
- Native mobile OTP support for Indian users
- Pre-built UI components for faster development
- Session management and middleware integration
- Multi-factor authentication ready

**Neon PostgreSQL + Drizzle ORM**
- Serverless scaling without connection pooling issues
- Type-safe queries with TypeScript
- Automatic branching for development environments
- Cost-effective for variable workloads

**Gemini 1.5 Pro**
- Strong multilingual capabilities
- Large context window (1M tokens) for course generation
- Competitive pricing for Indian market
- Fallback to BharatGen for Indic language optimization

## 2. Database Schema Design

### 2.1 Core Tables

```typescript
// users table
{
  id: uuid (PK)
  clerk_id: string (unique)
  email: string (nullable)
  phone: string (unique)
  preferred_language: string (default: 'hi')
  subscription_tier: enum ('free', 'pro')
  created_at: timestamp
  updated_at: timestamp
}

// courses table
{
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  title: string
  description: text
  language: string
  difficulty: enum ('beginner', 'intermediate', 'advanced')
  estimated_hours: integer
  is_public: boolean (default: false)
  is_pinned: boolean (default: false)
  created_at: timestamp
  updated_at: timestamp
}

// chapters table
{
  id: uuid (PK)
  course_id: uuid (FK -> courses.id)
  title: string
  content: text
  order: integer
  learning_objectives: json
  estimated_minutes: integer
  created_at: timestamp
}

// videos table
{
  id: uuid (PK)
  chapter_id: uuid (FK -> chapters.id)
  youtube_id: string
  title: string
  duration: integer
  thumbnail_url: string
  is_helpful: boolean (nullable)
  created_at: timestamp
}

// progress table
{
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  chapter_id: uuid (FK -> chapters.id)
  is_completed: boolean (default: false)
  time_spent_seconds: integer (default: 0)
  last_accessed: timestamp
  completed_at: timestamp (nullable)
}

// chat_conversations table
{
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  course_id: uuid (FK -> courses.id)
  created_at: timestamp
}

// chat_messages table
{
  id: uuid (PK)
  conversation_id: uuid (FK -> chat_conversations.id)
  role: enum ('user', 'assistant')
  content: text
  language: string
  input_method: enum ('text', 'voice')
  created_at: timestamp
}

// user_preferences table
{
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  voice_enabled: boolean (default: true)
  auto_play_videos: boolean (default: false)
  data_saver_mode: boolean (default: false)
  theme: enum ('light', 'dark', 'auto')
}
```

### 2.2 Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_language ON courses(language);
CREATE INDEX idx_chapters_course_id ON chapters(course_id);
CREATE INDEX idx_videos_chapter_id ON videos(chapter_id);
CREATE INDEX idx_progress_user_chapter ON progress(user_id, chapter_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
```

## 3. API Design

### 3.1 RESTful Endpoints

#### Course Management

```
POST   /api/courses/generate
Body: { topic: string, language: string, difficulty: string, inputMethod: 'text' | 'voice' }
Response: { courseId: string, status: 'processing' | 'completed' }

GET    /api/courses
Query: ?language=hi&page=1&limit=10
Response: { courses: Course[], total: number, page: number }

GET    /api/courses/[id]
Response: { course: Course, chapters: Chapter[], progress: Progress }

PATCH  /api/courses/[id]
Body: { title?: string, description?: string, isPublic?: boolean }
Response: { course: Course }

DELETE /api/courses/[id]
Response: { success: boolean }

POST   /api/courses/[id]/pin
Response: { isPinned: boolean }
```

#### Chapter & Progress

```
GET    /api/chapters/[id]
Response: { chapter: Chapter, videos: Video[] }

POST   /api/chapters/[id]/complete
Response: { progress: Progress }

PATCH  /api/chapters/[id]/progress
Body: { timeSpentSeconds: number }
Response: { progress: Progress }
```

#### AI Services

```
POST   /api/ai/generate-course
Body: { topic: string, language: string, difficulty: string }
Response: { course: CourseStructure }

POST   /api/ai/chat
Body: { conversationId: string, message: string, language: string }
Response: { response: string, conversationId: string }

POST   /api/speech/transcribe
Body: { audio: base64, language: string }
Response: { text: string, confidence: number }

POST   /api/speech/synthesize
Body: { text: string, language: string }
Response: { audio: base64 }
```

#### Video Integration

```
GET    /api/youtube/search
Query: ?topic=ReactJS&language=hi&maxResults=5
Response: { videos: YouTubeVideo[] }
```

### 3.2 API Rate Limiting

```typescript
// Rate limits per tier
const RATE_LIMITS = {
  free: {
    courseGeneration: 5, // per day
    chatMessages: 50,    // per hour
    voiceTranscription: 20 // per hour
  },
  pro: {
    courseGeneration: 50,
    chatMessages: 500,
    voiceTranscription: 200
  }
};
```

## 4. Component Architecture

### 4.1 Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   ├── Providers (Clerk, Theme, Language)
│   └── Navigation
│
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
│
├── (dashboard)/
│   ├── layout.tsx (Dashboard Layout)
│   │   ├── Sidebar
│   │   └── Header
│   │
│   ├── page.tsx (Dashboard Home)
│   │   ├── CourseGrid
│   │   ├── QuickActions
│   │   └── RecentActivity
│   │
│   ├── create/page.tsx (Course Creation)
│   │   ├── TopicInput (Client)
│   │   ├── VoiceRecorder (Client)
│   │   ├── LanguageSelector (Client)
│   │   └── GenerationProgress (Client)
│   │
│   ├── courses/
│   │   ├── page.tsx (Course List)
│   │   │   ├── CourseCard
│   │   │   ├── FilterBar (Client)
│   │   │   └── SearchInput (Client)
│   │   │
│   │   └── [id]/
│   │       ├── page.tsx (Course Detail)
│   │       │   ├── CourseHeader
│   │       │   ├── ChapterList
│   │       │   └── ProgressBar
│   │       │
│   │       └── chapters/[chapterId]/page.tsx
│   │           ├── ChapterContent
│   │           ├── VideoPlayer (Client)
│   │           ├── AIGuru (Client)
│   │           └── NavigationButtons
│   │
│   └── profile/page.tsx
│       ├── ProfileForm (Client)
│       ├── LanguagePreferences (Client)
│       └── SubscriptionCard
```

### 4.2 Key Component Specifications

#### VoiceRecorder Component (Client)

```typescript
interface VoiceRecorderProps {
  language: string;
  onTranscript: (text: string) => void;
  onError: (error: Error) => void;
}

// Features:
// - Visual feedback during recording
// - Automatic silence detection
// - Fallback to text input
// - Support for all Phase 1 languages
```

#### CourseGenerator Component (Server)

```typescript
interface CourseGeneratorProps {
  topic: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userId: string;
}

// Process:
// 1. Validate input and check rate limits
// 2. Call Gemini API with language-specific prompt
// 3. Parse and structure response
// 4. Fetch YouTube videos for each chapter
// 5. Save to database
// 6. Return course ID
```

#### AIGuru Chatbot (Client)

```typescript
interface AIGuruProps {
  courseId: string;
  chapterId: string;
  language: string;
  conversationId?: string;
}

// Features:
// - Context-aware responses
// - Voice input/output toggle
// - Code-switching detection
// - Conversation history
// - Typing indicators
```

## 5. AI Integration Design

### 5.1 Course Generation Prompt Template

```typescript
const COURSE_GENERATION_PROMPT = `
You are an expert educator creating a comprehensive course in ${language}.

Topic: ${topic}
Difficulty: ${difficulty}
Target Audience: Indian learners in Tier 2/3 cities

Generate a structured course with:
1. Course title and description (2-3 sentences)
2. 5-8 chapters with:
   - Chapter title
   - Learning objectives (3-5 points)
   - Detailed content (500-800 words)
   - Estimated time to complete

Important:
- Use culturally relevant examples from Indian context
- Write entirely in ${language} script
- Use simple, clear language appropriate for ${difficulty} level
- Include practical applications and real-world scenarios
- For technical topics, explain English terms in ${language}

Output format: JSON
`;
```

### 5.2 AI Guru Chatbot Prompt

```typescript
const CHATBOT_PROMPT = `
You are an AI Guru (teacher) helping a student learn about: ${chapterTitle}

Current chapter content summary:
${chapterSummary}

Student's preferred language: ${language}
Support code-switching (mixing ${language} with English)

Guidelines:
- Answer questions clearly and concisely
- Use examples from Indian daily life
- If student uses English words, acknowledge and explain in ${language}
- Encourage further questions
- Break down complex concepts into simple steps
- Be patient and supportive

Previous conversation:
${conversationHistory}

Student's question: ${userMessage}
`;
```

### 5.3 YouTube Search Strategy

```typescript
async function searchYouTubeVideos(
  topic: string,
  language: string,
  maxResults: number = 5
) {
  const languageNames = {
    hi: 'Hindi',
    ta: 'Tamil',
    mr: 'Marathi',
    // ... other languages
  };

  const searchQuery = `${topic} tutorial in ${languageNames[language]}`;
  
  const params = {
    part: 'snippet',
    q: searchQuery,
    type: 'video',
    relevanceLanguage: language,
    maxResults,
    videoCaption: 'closedCaption', // Prefer videos with subtitles
    videoDuration: 'medium', // 4-20 minutes
    order: 'relevance'
  };

  // Filter results by:
  // 1. Video language matches target
  // 2. Has subtitles in target language
  // 3. View count > 1000
  // 4. Published within last 2 years
}
```

## 6. Offline & PWA Strategy

### 6.1 Service Worker Configuration

```typescript
// Cache strategies
const CACHE_STRATEGIES = {
  static: 'cache-first',      // CSS, JS, fonts
  images: 'cache-first',       // Thumbnails, icons
  api: 'network-first',        // API calls
  courses: 'stale-while-revalidate' // Course content
};

// Offline page
const OFFLINE_FALLBACK = '/offline';

// Pinned courses storage
const PINNED_COURSES_STORE = 'pinned-courses';
```

### 6.2 IndexedDB Schema

```typescript
// Store for offline course data
const DB_SCHEMA = {
  name: 'ai-vidya-db',
  version: 1,
  stores: {
    pinnedCourses: {
      keyPath: 'id',
      indexes: ['userId', 'language']
    },
    chapters: {
      keyPath: 'id',
      indexes: ['courseId']
    },
    progress: {
      keyPath: 'id',
      indexes: ['userId', 'chapterId']
    }
  }
};
```

### 6.3 Data Sync Strategy

```typescript
// Sync when online
async function syncOfflineData() {
  // 1. Upload progress updates
  const pendingProgress = await getUnsyncedProgress();
  await batchUpdateProgress(pendingProgress);
  
  // 2. Download course updates
  const pinnedCourses = await getPinnedCourses();
  for (const course of pinnedCourses) {
    await updateCourseCache(course.id);
  }
  
  // 3. Clear old cache
  await pruneOldCache();
}
```

## 7. Performance Optimization

### 7.1 Code Splitting Strategy

```typescript
// Dynamic imports for heavy components
const VoiceRecorder = dynamic(() => import('@/components/voice-recorder'), {
  loading: () => <RecorderSkeleton />,
  ssr: false
});

const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <VideoSkeleton />
});

const AIGuru = dynamic(() => import('@/components/ai-guru'), {
  loading: () => <ChatSkeleton />,
  ssr: false
});
```

### 7.2 Image Optimization

```typescript
// Next.js Image component with optimization
<Image
  src={thumbnailUrl}
  alt={title}
  width={320}
  height={180}
  quality={75}
  placeholder="blur"
  blurDataURL={lowResPlaceholder}
  loading="lazy"
/>

// Responsive images for different network speeds
const imageQuality = dataSaverMode ? 50 : 75;
```

### 7.3 API Response Caching

```typescript
// Cache course list for 5 minutes
export const revalidate = 300;

// Cache individual course for 1 hour
export const dynamic = 'force-static';
export const revalidate = 3600;

// Real-time data (progress, chat)
export const dynamic = 'force-dynamic';
```

## 8. Security Design

### 8.1 Authentication Flow

```
1. User enters mobile number
2. Clerk sends OTP via SMS
3. User enters OTP
4. Clerk validates and creates session
5. Session token stored in httpOnly cookie
6. Middleware validates token on each request
```

### 8.2 API Security

```typescript
// Rate limiting middleware
export async function rateLimit(req: Request, userId: string, action: string) {
  const key = `${userId}:${action}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour window
  }
  
  const limit = RATE_LIMITS[userTier][action];
  if (count > limit) {
    throw new Error('Rate limit exceeded');
  }
}

// Input validation
export function validateCourseInput(data: unknown) {
  const schema = z.object({
    topic: z.string().min(3).max(200),
    language: z.enum(SUPPORTED_LANGUAGES),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
  });
  
  return schema.parse(data);
}
```

### 8.3 Data Privacy

```typescript
// PII handling
// - Phone numbers hashed in logs
// - User data encrypted at rest (Neon default)
// - HTTPS only for all communications
// - No third-party analytics without consent
// - Course content not shared without user permission
```

## 9. Monitoring & Analytics

### 9.1 Key Metrics to Track

```typescript
// Performance metrics
- Page load time (p50, p95, p99)
- API response time
- Course generation time
- Voice transcription latency

// User engagement
- Daily/Monthly active users
- Course creation rate
- Course completion rate
- Voice vs text input ratio
- Language distribution

// Business metrics
- Free to Pro conversion rate
- Churn rate
- Average courses per user
- User retention (7-day, 30-day)
```

### 9.2 Error Tracking

```typescript
// Sentry integration for error monitoring
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Scrub PII from error reports
    if (event.user) {
      delete event.user.phone;
      delete event.user.email;
    }
    return event;
  }
});
```

## 10. Deployment Architecture

### 10.1 Vercel Deployment

```
Production: main branch → Vercel Production
Staging: develop branch → Vercel Preview
Feature: feature/* → Vercel Preview (ephemeral)
```

### 10.2 Environment Variables

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# AI Services
GEMINI_API_KEY=
BHASHINI_API_KEY=
BHASHINI_USER_ID=

# External APIs
YOUTUBE_API_KEY=

# Monitoring
SENTRY_DSN=

# Feature Flags
ENABLE_VOICE_INPUT=true
ENABLE_OFFLINE_MODE=true
```

### 10.3 CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  test:
    - Run TypeScript type check
    - Run ESLint
    - Run unit tests
    - Run integration tests
  
  deploy:
    - Deploy to Vercel
    - Run smoke tests
    - Notify team on Slack
```

## 11. Accessibility Considerations

### 11.1 WCAG 2.1 AA Compliance

```typescript
// Color contrast ratios
const COLORS = {
  text: '#1a1a1a',      // 16:1 contrast on white
  textSecondary: '#4a4a4a', // 9:1 contrast
  primary: '#0066cc',   // 4.5:1 contrast
  error: '#cc0000'      // 5:1 contrast
};

// Focus indicators
.focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

// Touch targets
.button {
  min-height: 44px;
  min-width: 44px;
}
```

### 11.2 Screen Reader Support

```typescript
// Semantic HTML
<main aria-label="Course content">
  <h1>{courseTitle}</h1>
  <nav aria-label="Chapter navigation">
    {/* Chapter list */}
  </nav>
</main>

// ARIA labels for interactive elements
<button
  aria-label={`Record voice input in ${language}`}
  aria-pressed={isRecording}
>
  <MicIcon />
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {generationStatus}
</div>
```

## 12. Testing Strategy

### 12.1 Test Coverage

```typescript
// Unit tests (70% coverage target)
- Utility functions
- API route handlers
- Database queries
- AI prompt generation

// Integration tests
- Course generation flow
- Authentication flow
- Video search integration
- Chat conversation flow

// E2E tests (Playwright)
- User signup and login
- Create course via text input
- Create course via voice input
- Complete chapter and track progress
- Pin course for offline access
```

### 12.2 Test Data

```typescript
// Mock data for testing
const MOCK_USERS = {
  freeUser: { tier: 'free', language: 'hi' },
  proUser: { tier: 'pro', language: 'ta' }
};

const MOCK_COURSES = {
  hindiCourse: { language: 'hi', chapters: 5 },
  tamilCourse: { language: 'ta', chapters: 7 }
};
```

## 13. Migration & Rollout Plan

### Phase 1: MVP (Weeks 1-4)
- Next.js setup with basic routing
- Clerk authentication (mobile OTP)
- Database schema and Drizzle setup
- Course generation (Hindi, English only)
- Basic UI with Shadcn components

### Phase 2: Core Features (Weeks 5-8)
- YouTube video integration
- Progress tracking
- Language expansion (Tamil, Marathi)
- Voice input integration (Bhashini)
- AI Guru chatbot

### Phase 3: Advanced Features (Weeks 9-12)
- PWA and offline mode
- Course pinning
- PDF export
- Performance optimization
- Mobile responsiveness refinement

### Phase 4: Scale & Polish (Weeks 13-16)
- Additional languages (Phase 2 languages)
- Quiz generation
- Certification system
- Analytics dashboard
- User feedback system
