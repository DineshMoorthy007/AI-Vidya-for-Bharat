---
inclusion: always
---

# Technology Stack

## Core Framework
- Next.js 15 (App Router) - SEO optimization and mobile performance
- React 18+ with TypeScript for type safety

## Authentication & User Management
- Clerk - Mobile Number/OTP login (primary for rural users)
- Support email login as secondary option

## Database & ORM
- Neon (Serverless PostgreSQL) - Scalable cloud database
- Drizzle ORM - Type-safe database queries

## AI & Language Services
- Google Gemini 1.5 Pro or BharatGen API - Multilingual content generation
- AI4Bharat / Bhashini APIs - Speech-to-Text and Text-to-Speech
- IndicTrans2 / BharatGen - Cultural and linguistic nuance optimization

## External APIs
- YouTube Data API v3 - Language-filtered video integration

## UI & Styling
- Shadcn UI - Accessible component library
- Tailwind CSS - Mobile-first responsive design
- Progressive Web App (PWA) - Offline capability

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database
```bash
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
```

### Deployment
- Platform: Vercel (recommended for Next.js)
- Environment variables required: Database URL, API keys for Clerk, Gemini, Bhashini, YouTube

## Language Support Priority
1. Hindi, Tamil, Marathi (Phase 1)
2. Telugu, Bengali, Gujarati, Kannada (Phase 2)
3. Malayalam, Punjabi, Odia, Assamese, Urdu (Phase 3)

## Performance Considerations
- Optimize for 2G/3G networks
- Implement aggressive caching strategies
- Use image optimization for low-bandwidth scenarios
- Lazy load non-critical components
