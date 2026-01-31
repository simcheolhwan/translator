# Korean-English Translator

A chat-based translation app for Korean and English powered by LLM.

## Tech Stack

### Frontend

- React 19 + TypeScript + Vite
- TanStack Query / Router
- Zustand (state management)
- Base UI + CSS Modules
- Firebase Auth (Google Sign-in)

### Backend

- Google Cloud Functions (2nd gen)
- OpenAI SDK
- Firebase Realtime Database

## Prerequisites

- Node.js 24 (frontend)
- Node.js 22 (backend/Cloud Functions)
- pnpm 10+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud CLI (for deployment)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo>
cd translator
pnpm install
```

### 2. Firebase Setup

```bash
firebase login
firebase use --add
```

### 3. Environment Variables

```bash
# Frontend
cp web/.env.example web/.env
# Fill in Firebase config (VITE_FIREBASE_*)

# Functions (create manually)
# Add OPENAI_API_KEY and ALLOWED_EMAILS to functions/.env.local
```

### 4. Run Development

```bash
# Terminal 1: Frontend dev server
pnpm --filter web dev

# Terminal 2: Backend with Firebase emulators (Functions + Database + Auth)
pnpm --filter functions dev
```

The emulator UI is available at http://localhost:4000

## Available Scripts

| Script                          | Description                        |
| ------------------------------- | ---------------------------------- |
| `pnpm --filter web dev`         | Start frontend dev server          |
| `pnpm --filter web build`       | Build frontend                     |
| `pnpm --filter functions dev`   | Build and start Firebase emulators |
| `pnpm --filter functions build` | Build Cloud Functions              |
| `pnpm typecheck`                | Run TypeScript type checking       |
| `pnpm lint`                     | Run ESLint on all packages         |

## OpenAI API Key Setup

### Local Development

Add to `functions/.env.local`:

```
OPENAI_API_KEY=sk-...
```

### Production

Use Firebase secrets:

```bash
firebase functions:secrets:set OPENAI_API_KEY
# Enter your API key when prompted
```

## Deployment

### Deploy Backend (Cloud Functions)

```bash
pnpm --filter functions build
firebase deploy --only functions
```

### Deploy Frontend

Build and deploy to your preferred hosting (Firebase Hosting, Vercel, etc.):

```bash
pnpm --filter web build
# Output is in web/dist

# Example with Firebase Hosting
firebase deploy --only hosting
```

## Access Control

Only pre-approved email addresses can use the translation service.

### Local Development

Edit `functions/.env.local`:

```
ALLOWED_EMAILS=user1@example.com,user2@example.com
```

Leave empty to allow all authenticated users (for development).

### Production

```bash
firebase functions:config:set app.allowed_emails="user1@example.com,user2@example.com"
```

## Project Structure

```
translator/
├── web/                  # Frontend (React 19)
│   ├── src/
│   │   ├── api/          # API client (ky)
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── queries/      # TanStack Query
│   │   ├── routes/       # TanStack Router
│   │   ├── schemas/      # Zod schemas
│   │   ├── stores/       # Zustand stores
│   │   ├── styles/       # Global styles
│   │   └── types/        # TypeScript types
│   └── public/
│       └── locales/      # i18n (en.json, ko.json)
├── functions/            # Backend (Cloud Functions)
│   └── src/
│       ├── functions/    # Endpoint handlers
│       ├── middleware/   # Auth, CORS, email whitelist
│       ├── prompts/      # LLM system prompts
│       ├── services/     # OpenAI, Firebase, Database
│       └── types/        # TypeScript types
├── docs/
│   └── spec.md           # Product specification
├── firebase.json         # Firebase configuration
└── pnpm-workspace.yaml   # Monorepo workspace
```

## License

Private
