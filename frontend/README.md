# AI Vidya for Bharat Frontend

AI-powered multilingual learning MVP for hackathon demos.

## Demo Flow

1. Enter topic on landing page
2. Select language
3. Generate course
4. View generated chapters
5. Ask doubts in AI Guru chat

No authentication is required (demo mode).

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

For production:

```bash
npm run build
npm run start
```

## API Contract

Frontend expects these endpoints:

- `POST /api/generate-course`
- `GET /api/course/:id`
- `POST /api/chat`

All client API calls are centralized in `src/lib/api.ts`.

## Project Structure

```text
src/
	app/
		layout.tsx
		page.tsx
		dashboard/page.tsx
		generate/page.tsx
		course/
			[id]/page.tsx
		chat/page.tsx
		settings/page.tsx
	components/
		AppShell.tsx
		LanguageSelector.tsx
		ChapterList.tsx
		ChatBox.tsx
		VoiceButton.tsx
	lib/
		api.ts
		constants.ts
	styles/
		globals.css
```
