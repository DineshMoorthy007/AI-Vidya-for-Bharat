---
inclusion: always
---

# Project Structure

## Directory Organization

```
/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/              # Authentication routes (login, signup)
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── create/          # Course creation interface
│   │   ├── courses/         # Course listing and management
│   │   └── profile/         # User profile and settings
│   ├── api/                 # API routes
│   │   ├── ai/              # AI content generation endpoints
│   │   ├── youtube/         # YouTube video search
│   │   └── speech/          # Voice-to-text processing
│   └── layout.tsx           # Root layout with providers
├── components/              # Reusable React components
│   ├── ui/                  # Shadcn UI components
│   ├── course/              # Course-specific components
│   ├── chat/                # AI Guru chatbot components
│   └── language/            # Language selector and utilities
├── lib/                     # Utility functions and configurations
│   ├── db/                  # Database schema and queries
│   │   ├── schema.ts        # Drizzle schema definitions
│   │   └── queries.ts       # Reusable database queries
│   ├── ai/                  # AI service integrations
│   │   ├── gemini.ts        # Gemini API wrapper
│   │   └── bhashini.ts      # Bhashini API wrapper
│   ├── youtube.ts           # YouTube API integration
│   └── utils.ts             # General utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
│   ├── locales/             # Translation files (i18n)
│   └── icons/               # Language-specific icons
└── middleware.ts            # Next.js middleware (auth, i18n)
```

## Key Architectural Patterns

### Route Organization
- Use route groups `(auth)`, `(dashboard)` for logical separation without URL nesting
- API routes follow RESTful conventions where applicable
- Server Components by default, Client Components only when needed

### Component Structure
- Atomic design: ui/ contains base components, feature folders contain composed components
- Co-locate component-specific utilities and types
- Separate presentational and container components

### Data Flow
- Server Components fetch data directly from database
- Client Components use React Query for API calls
- Optimistic updates for better UX on slow networks

### Language Handling
- Store user language preference in database and session
- Pass language context through React Context or URL params
- All AI prompts must include target language parameter

### Offline Support
- Service Worker for PWA functionality
- IndexedDB for caching course content
- Implement "Pin Course" feature for offline access

## Naming Conventions
- Files: kebab-case (e.g., `course-generator.tsx`)
- Components: PascalCase (e.g., `CourseGenerator`)
- Functions/variables: camelCase (e.g., `generateCourse`)
- Constants: UPPER_SNAKE_CASE (e.g., `SUPPORTED_LANGUAGES`)
- Database tables: snake_case (e.g., `user_courses`)

## Code Organization Rules
- Keep components under 200 lines; extract sub-components if larger
- API routes should handle one resource/action
- Separate business logic from UI components
- Use barrel exports (index.ts) for cleaner imports
