# SpeakEasy English

English-learning PWA with voice conversations through Groq, independent username/password accounts, CEFR placement, vocabulary games, progression and a Sparks shop.

The supported deployment is **Next.js on Vercel + Turso**. See [VERCEL.md](./VERCEL.md) for database setup, environment variables and deployment.

## Local development

Use Node.js 24. Run npm ci, copy .env.example to .env.local (without overwriting an existing file), set GROQ_API_KEY, then npm run dev. Open http://127.0.0.1:5173. Migrations initialize local SQLite in ignored .data/.

## Commands

- npm run dev: migrate and start development server
- npm run build: production Next.js build
- npm run vercel-build: migrate and build (Vercel default)
- npm start: local production server
- npm run db:generate: generate a new schema migration
- npm run db:migrate: apply pending migrations
- npm run test:auth: integration checks against a local server on port 5174

Cloudflare/Sites configuration and helper files remain for historical reference; they are not used by the Vercel build. Never commit env files, keys or local databases.
