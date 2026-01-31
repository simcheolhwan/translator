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

#### Frontend

```bash
cp web/.env.example web/.env
# Fill in Firebase config (VITE_FIREBASE_*)
```

#### Functions (Local Development)

```bash
cp functions/.env.example functions/.env.local
# Edit: OPENAI_API_KEY=sk-...
# Edit: ALLOWED_EMAILS=your-email@gmail.com (leave empty to allow all)
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

## Deployment

### Initial Setup (One-time)

```bash
# Set OpenAI API Key as secret
firebase functions:secrets:set OPENAI_API_KEY
```

### Deploy

```bash
# Functions only
pnpm --filter functions build
firebase deploy --only functions

# Hosting only
pnpm --filter web build
firebase deploy --only hosting

# Everything
firebase deploy
```

### Access Control (ALLOWED_EMAILS)

Configure allowed email addresses via `firebase.json`:

```json
{
  "functions": {
    "env": {
      "ALLOWED_EMAILS": "user1@example.com,user2@example.com"
    }
  }
}
```

Or set during deployment:

```bash
firebase deploy --only functions --set-env ALLOWED_EMAILS="user1@example.com,user2@example.com"
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
