# 한영 번역기

LLM 기반 채팅형 한영 번역 앱.

## 기술 스택

### 프론트엔드 (web)

- React 19 + TypeScript + Vite
- TanStack Query / Router
- Zustand (상태 관리)
- Base UI + CSS Modules
- Firebase Auth (Google 로그인)
- Vercel 배포

### 백엔드 (functions)

- Google Cloud Functions (2세대)
- OpenAI SDK
- Firebase Realtime Database

### 공유 패키지 (shared)

- 타입, Zod 스키마, 상수, 시스템 프롬프트
- `workspace:*`로 web, functions에서 참조

## 사전 요구사항

- Node.js 24 (프론트엔드)
- Node.js 22 (백엔드/Cloud Functions)
- pnpm 10+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud CLI (배포용)

## 시작하기

### 1. 클론 및 설치

```bash
git clone <repo>
cd translator
pnpm install
```

### 2. Firebase 설정

```bash
firebase login
firebase use --add
```

### 3. 환경 변수

#### 프론트엔드

```bash
cp web/.env.example web/.env
# Firebase 설정값 입력 (VITE_FIREBASE_*)
```

#### Functions (로컬 개발)

```bash
cp functions/.env.example functions/.env.local
# OPENAI_API_KEY=sk-...
# ALLOWED_EMAILS=your-email@gmail.com (비워두면 모든 사용자 허용)
```

### 4. 개발 서버 실행

```bash
# 터미널 1: 프론트엔드 개발 서버
pnpm --filter web dev

# 터미널 2: Firebase 에뮬레이터 (Functions + Database + Auth)
pnpm --filter functions dev
```

에뮬레이터 UI: http://localhost:4000

## 스크립트

| 스크립트                        | 설명                             |
| ------------------------------- | -------------------------------- |
| `pnpm --filter web dev`         | 프론트엔드 개발 서버 실행        |
| `pnpm --filter web build`       | 프론트엔드 빌드 (shared → vite)  |
| `pnpm --filter functions dev`   | Firebase 에뮬레이터 빌드 및 실행 |
| `pnpm --filter functions build` | Cloud Functions 빌드             |
| `pnpm --filter shared build`    | 공유 패키지 빌드                 |
| `pnpm typecheck`                | TypeScript 타입 검사 (전체)      |
| `pnpm lint`                     | ESLint 실행 (전체)               |

## 배포

### 초기 설정 (1회)

```bash
# OpenAI API Key를 시크릿으로 등록
firebase functions:secrets:set OPENAI_API_KEY
```

### 배포 실행

```bash
# Functions 배포
firebase deploy --only functions

# 프론트엔드 (Vercel)
# Vercel Git 연동으로 자동 배포됨.
# 수동 배포: `pnpm --filter web build` 후 Vercel CLI로 배포.
```

### 접근 제어 (ALLOWED_EMAILS)

`firebase.json`에서 허용 이메일 설정:

```json
{
  "functions": {
    "env": {
      "ALLOWED_EMAILS": "user1@example.com,user2@example.com"
    }
  }
}
```

또는 배포 시 지정:

```bash
firebase deploy --only functions --set-env ALLOWED_EMAILS="user1@example.com,user2@example.com"
```

## 프로젝트 구조

```
translator/
├── shared/               # 공유 라이브러리 (workspace:*)
│   └── src/
│       ├── types/        # TypeScript 타입
│       ├── schemas/      # Zod 스키마
│       ├── prompts/      # 시스템 프롬프트
│       └── constants.ts  # 모델, 어조, 임계값
├── web/                  # 프론트엔드 (React 19, Vercel)
│   ├── src/
│   │   ├── api/          # API 클라이언트 (ky)
│   │   ├── components/   # UI 컴포넌트
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── lib/          # 유틸리티
│   │   ├── queries/      # TanStack Query
│   │   ├── routes/       # TanStack Router
│   │   ├── stores/       # Zustand 스토어
│   │   ├── styles/       # 글로벌 스타일
│   │   └── types/        # TypeScript 타입
│   └── public/
│       └── locales/      # 다국어 (en.json, ko.json)
├── functions/            # 백엔드 (Cloud Functions)
│   └── src/
│       ├── functions/    # 엔드포인트 핸들러
│       ├── middleware/   # 인증, CORS, 이메일 화이트리스트
│       ├── services/     # OpenAI, Firebase, Database
│       └── types/        # TypeScript 타입
├── docs/
│   └── spec.md           # 제품 명세서
├── firebase.json         # Firebase 설정
└── pnpm-workspace.yaml   # 모노레포 워크스페이스 (shared, web, functions)
```
