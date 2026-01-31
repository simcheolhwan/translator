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
- pnpm 9+
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
# Root level
cp .env.example .env
# Fill in Firebase config (VITE_FIREBASE_*)

# Functions
cp functions/.env.example functions/.env.local
# Add OPENAI_API_KEY and ALLOWED_EMAILS
```

### 4. Run Development

```bash
# Terminal 1: Frontend
pnpm --filter web dev

# Terminal 2: Backend (Functions emulator)
pnpm --filter functions dev
```

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

Access in code:

```typescript
import { defineSecret } from "firebase-functions/params"

const openaiApiKey = defineSecret("OPENAI_API_KEY")

export const translate = onRequest({ secrets: [openaiApiKey] }, async (req, res) => {
  const client = new OpenAI({ apiKey: openaiApiKey.value() })
  // ...
})
```

## Deployment

### Deploy Backend (Cloud Functions)

```bash
# Build
pnpm --filter functions build

# Deploy
firebase deploy --only functions
```

### Deploy Frontend

Configure your preferred hosting (Firebase Hosting, Vercel, etc.) to serve from `web/dist`:

```bash
# Build frontend
pnpm --filter web build

# Deploy (example with Firebase Hosting)
firebase deploy --only hosting
```

## Access Control

Only pre-approved email addresses can use the translation service. Configure the allowed list:

### Local Development

Edit `functions/.env.local`:

```
ALLOWED_EMAILS=user1@example.com,user2@example.com
```

### Production

```bash
firebase functions:config:set app.allowed_emails="user1@example.com,user2@example.com"
```

## Project Structure

```
translator/
├── web/                  # Frontend (React)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── queries/      # TanStack Query
│   │   ├── routes/       # TanStack Router
│   │   ├── stores/       # Zustand stores
│   │   └── types/        # TypeScript types
│   └── public/
├── functions/            # Backend (Cloud Functions)
│   └── src/
│       ├── functions/    # Endpoint handlers
│       ├── middleware/   # Auth, CORS
│       ├── prompts/      # LLM prompts
│       └── services/     # OpenAI, Firebase
└── docs/
    └── spec.md           # Product specification
```

## License

Private
