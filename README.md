# 🔥 AI Vidya for Bharat

> **Multilingual AI-powered education for every Indian learner — voice-first, offline-ready, and built for Bharat.**

![AI Vidya Banner](https://placehold.co/1200x400/FF6B00/FDF6EC?text=AI+Vidya+for+Bharat+%F0%9F%87%AE%F0%9F%87%B3)

---

## 📖 Table of Contents

- [Vision](#-vision)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Design & Requirements Docs](#-design--requirements-docs)
- [Pages & Routes](#-pages--routes)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Components](#-components)
- [Mock Data (MVP)](#-mock-data-mvp)
- [Roadmap](#-roadmap)
- [Competitive Advantage](#-competitive-advantage)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Vision

To **democratize education in India** by enabling AI-powered course generation in regional languages with voice-first accessibility and offline support — bringing quality learning to every corner of Bharat.

---

## ❗ Problem Statement

India has **22+ official languages**, a majority of non-English speakers, and limited regional edtech platforms. Most existing platforms are English-first and text-heavy — making them inaccessible to hundreds of millions of learners.

**AI Vidya solves this by:**

- Generating full structured courses in Indian languages
- Supporting voice-based interaction (speak to learn)
- Enabling offline learning via PWA caching
- Providing a vernacular AI tutor (AI Guru) with code-switching support

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 **Multilingual Course Generator** | Enter any topic and get a full structured course in Hindi, Tamil, Telugu, Bengali, Marathi, or Kannada |
| 🎙️ **Voice-to-Course Creation** | Speak your topic — speech is transcribed and a course is generated |
| 🤖 **AI Guru (Vernacular Chatbot)** | Ask doubts in your native language; supports Hinglish, Tanglish, and code-switching |
| 📹 **Localized Video Integration** | Curated YouTube videos fetched in the selected language |
| 📝 **AI-Generated Quizzes** | 5 MCQs per module, auto-evaluated with score display |
| 📶 **Offline Mode (PWA)** | Pin any course to access it without internet |
| 📄 **PDF Download** *(Pro)* | Download full course in regional script as a PDF |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, ShadCN UI |
| **Authentication** | Clerk (Mobile OTP) |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **AI Generation** | Google Gemini 1.5 Pro |
| **Speech APIs** | AI4Bharat / Bhashini |
| **Video** | YouTube Data API v3 |
| **Offline** | PWA (Service Workers) |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
ai-vidya-for-bharat/
├── app/
│   ├── layout.tsx              # Global layout (Navbar + Footer)
│   ├── page.tsx                # Landing page (/)
│   ├── globals.css             # Design system & CSS variables
│   ├── dashboard/
│   │   └── page.tsx            # /dashboard
│   ├── generate/
│   │   └── page.tsx            # /generate
│   ├── course/
│   │   └── [id]/
│   │       └── page.tsx        # /course/[id]
│   ├── ai-guru/
│   │   └── page.tsx            # /ai-guru
│   ├── sign-in/
│   │   └── page.tsx            # /sign-in
│   └── sign-up/
│       └── page.tsx            # /sign-up
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LanguageSelector.tsx
│   ├── VoiceInputButton.tsx
│   ├── CourseCard.tsx
│   ├── ModuleAccordion.tsx
│   ├── QuizCard.tsx
│   ├── VideoCard.tsx
│   ├── AIChatBubble.tsx
│   ├── LoadingSpinner.tsx
│   ├── OfflineBadge.tsx
│   ├── ProBadge.tsx
│   └── StatsCard.tsx
├── lib/
│   ├── mockData.ts             # MVP mock content
│   ├── gemini.ts               # Gemini AI integration
│   ├── youtube.ts              # YouTube API helpers
│   └── db/
│       ├── schema.ts           # Drizzle schema
│       └── index.ts            # DB connection
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── tailwind.config.ts
├── drizzle.config.ts
└── .env.local
```

---

## 📚 Design & Requirements Docs

For detailed product planning and UI/UX decisions, refer to:

- [Design Document](./.kiro/specs/ai-vidya-for-bharat/design.md)
- [Requirements Document](./.kiro/specs/ai-vidya-for-bharat/requirements.md)

---

## 📄 Pages & Routes

### `/` — Landing Page
Full marketing page with hero, problem statement, features, how-it-works, persona use cases, comparison table, and CTA. Fully animated on scroll.

### `/sign-up` & `/sign-in` — Authentication
Clerk-powered OTP mobile authentication. Clean centered card layout with saffron theme.

### `/dashboard` — User Dashboard
Sidebar navigation, course input with voice support, generated courses grid, offline courses section, and recent activity timeline.

### `/generate` — Course Generator
The core feature. Topic input + voice button + language selector + advanced options. Shows a live loading state and rendered course preview after generation.

### `/course/[id]` — Course Detail
Full course view with module accordions, localized YouTube videos, per-module quizzes, offline pin toggle, PDF download (Pro), and floating AI Guru button.

### `/ai-guru` — AI Guru Chat
Full-screen vernacular chatbot. Supports voice input, language switching mid-chat, suggested question chips, and Hinglish/Tanglish code-switching responses.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Neon PostgreSQL database
- Clerk account
- Google Gemini API key
- YouTube Data API v3 key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-vidya-for-bharat.git
cd ai-vidya-for-bharat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# (Fill in your keys — see Environment Variables section)

# Push database schema
npx drizzle-kit push

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root with the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon PostgreSQL
DATABASE_URL=postgresql://...

# Google Gemini AI
GEMINI_API_KEY=AIza...

# YouTube Data API
YOUTUBE_API_KEY=AIza...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧩 Components

| Component | Description |
|---|---|
| `<Navbar />` | Sticky top bar with logo, nav links, language selector, auth button |
| `<Footer />` | Links, socials, tagline, "Made for Bharat" |
| `<LanguageSelector />` | Dropdown: Hindi, Tamil, Telugu, Bengali, Marathi, Kannada |
| `<VoiceInputButton />` | Mic button with pulsing animation; uses Web Speech API |
| `<CourseCard />` | Course title, language badge, module count, pin icon, open button |
| `<ModuleAccordion />` | Expandable module → lesson list with completion states |
| `<QuizCard />` | MCQ component with auto-evaluation and score display |
| `<VideoCard />` | YouTube video card with language tag |
| `<AIChatBubble />` | Chat bubbles for user and AI Guru messages |
| `<LoadingSpinner />` | Saffron spinner with optional label |
| `<OfflineBadge />` | "Saved Offline" indicator badge |
| `<ProBadge />` | Lock overlay for Pro-only features |
| `<StatsCard />` | Icon + value + label card for dashboard stats |

---

## 🗃️ Mock Data (MVP)

For the hackathon MVP, all AI content is mocked via `/lib/mockData.ts`. This includes:

- 5 sample courses (Hindi, Tamil, Telugu, Bengali, Marathi)
- Full module + lesson structure in Hindi (Devanagari script)
- 5 MCQ quiz questions per module
- 4 YouTube-style video cards
- 6-message AI Guru conversation showing Hinglish code-switching
- Sample user profile (Ramesh Kumar)

To switch to real AI generation, replace mock calls with the Gemini API integration in `/lib/gemini.ts`.

---

## 🗺️ Roadmap

### ✅ MVP (Hackathon Phase)
- [x] Multilingual course generation UI
- [x] Mock AI content
- [x] Language selection
- [x] AI Guru chat UI
- [x] Video placeholders
- [x] Quiz section

### 🔄 Phase 2 — Post MVP
- [ ] Real Gemini AI integration
- [ ] Real speech-to-text (Bhashini / AI4Bharat)
- [ ] Offline PWA caching
- [ ] PDF export (Pro feature)
- [ ] Teacher marketplace
- [ ] Government school partnerships
- [ ] Skill certification

### 🚀 Phase 3 — Scale
- [ ] AI video summarization
- [ ] Voice-based quizzes
- [ ] WhatsApp integration
- [ ] 12+ regional languages
- [ ] BharatGen AI model integration

---

## ⚔️ Competitive Advantage

| Feature | Traditional Edtech | AI Vidya for Bharat |
|---|---|---|
| English-first | ✅ Yes | ❌ No |
| Auto AI course generation | ❌ No | ✅ Yes |
| Voice-first input | 🔶 Rare | ✅ Yes |
| Code-switching AI (Hinglish) | ❌ No | ✅ Yes |
| Offline Bharat-focused | 🔶 Limited | ✅ Yes |
| Regional script rendering | 🔶 Partial | ✅ Full Unicode |

---

## 🎯 Demo Script (For Judges)

1. Type **"Basic Digital Literacy"** → Select **Hindi** → Click **Generate**
2. Show Hindi modules, Hindi YouTube videos, Hindi quiz
3. Open **AI Guru** → Ask a doubt in Hindi → See Hinglish response
4. Switch to **Tamil** → Type **"Modern Organic Farming"** → Generate
5. Show Tamil content, demonstrating full multilingual switching

This proves: Multilingual AI ✅ | Voice-first Bharat approach ✅ | Structured AI learning ✅

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

MIT © 2024 AI Vidya for Bharat

---

<div align="center">

**Made with ❤️ for Bharat 🇮🇳**

*AI Vidya for Bharat is not just an edtech platform.*
*It is a multilingual AI learning infrastructure designed for India-first digital empowerment.*

</div>
