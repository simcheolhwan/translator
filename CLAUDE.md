# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM 기반 채팅형 한영 번역 앱. pnpm 모노레포(shared, web, functions).

## Commands

```bash
# 개발
pnpm --filter web dev          # 프론트엔드 Vite 개발 서버
pnpm --filter functions dev    # Firebase 에뮬레이터 (Functions + Database)
pnpm --filter shared build     # shared 패키지 빌드 (web/functions에서 참조 전 필요)

# 빌드
pnpm --filter web build        # shared build → vite build
pnpm --filter functions build  # tsc

# 검증
pnpm typecheck                 # shared build → 전체 패키지 tsc --noEmit
pnpm lint                      # 전체 패키지 ESLint
pnpm --filter web test         # web vitest
pnpm --filter functions test   # functions vitest

# 배포
firebase deploy --only functions
```

## Architecture

### 번역 흐름 (핵심 데이터 플로우)

1. 클라이언트: 텍스트 입력 → `detectLanguage`로 한/영 판별 → `POST /translate` 호출
2. Cloud Function: 세션 생성(없으면) → 소스 메시지 저장 → 빈 번역 메시지(status: pending) 저장 → **즉시 응답** → 백그라운드에서 OpenAI 번역 수행 → 번역 메시지 업데이트(status: completed)
3. 클라이언트: Firebase Realtime Database `onValue` 리스너로 번역 결과 실시간 수신

### Realtime Database 구조

```
users/{uid}/
  sessions/{sessionId}/
    description, username, createdAt, updatedAt
    messages/{messageId}/
      type: "source" | "translation"
      content, status, model, tone, parentId, createdAt
  settings/
    globalInstruction, createdAt, updatedAt
```

### shared 패키지

web과 functions가 공유하는 코드. `workspace:*`로 참조.

- `shared/types` — Message, Session, UserSettings, TranslateRequest/Response
- `shared/schemas` — Zod 스키마 (toneSettingsSchema, translateRequestSchema)
- `shared/constants` — 모델(MODELS), 어조 옵션(TONE_OPTIONS), 세션 임계값
- `shared/prompts` — SYSTEM_PROMPT (번역 시스템 프롬프트)

**중요**: shared 코드 변경 후 `pnpm --filter shared build` 실행 필요.

### web 패키지

- TanStack Router: 파일 기반 라우팅 (`web/src/routes/`), `routeTree.gen.ts` 자동 생성
- TanStack Query: `@lukemorales/query-key-factory`로 쿼리 키 관리 (`web/src/queries/keys.ts`)
- Zustand: UI 상태(sidebar, locale) — `persist` 미들웨어로 localStorage 저장
- `useSyncExternalStore`: Firebase Realtime Database 구독을 React와 동기화 (`useRealtimeSession`, `useRealtimeSessions`)
- API 클라이언트: ky 기반, Firebase ID 토큰 자동 첨부 (`web/src/api/client.ts`)
- 경로 별칭: `@/` → `web/src/`
- Base UI + CSS Modules
- 개발 환경에서 자동으로 Database 에뮬레이터에 연결

### functions 패키지

- Cloud Functions v2 (`onRequest`), 리전: `asia-northeast3`
- 미들웨어 체인: auth → allowedEmails → handler
- OpenAI API 키: `defineSecret`으로 관리
- Node.js 22 필요

## Conventions

- ESLint: `@typescript-eslint/no-unused-vars` — `_` 접두사로 무시
- pre-commit: lint-staged → prettier
- shared의 export: `.js` 확장자 필수 (ESM)
