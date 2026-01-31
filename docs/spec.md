## 1. Overview

### 1.1 Purpose

- Translate user input between Korean and English.
- The UI is chat-based, and it stores history per chat room (session) so users can continue later.

### 1.2 Fixed tech stack

- Translation engine: OpenAI SDK based LLM
- Auth: Firebase (Google sign-in)
- Data store: Firebase Realtime Database (not Firestore)
- Backend runtime: Google Cloud Functions (2nd gen)

---

## 2. Core principle: What the app does vs what the LLM does

This app does not translate using rule-based logic. The items below are explicitly intended to be handled by the LLM, not by app-side rules.

### 2.1 Intended LLM responsibilities

1. Language detection
   - The LLM automatically detects whether the input is Korean or English.
   - It also handles mixed-language input appropriately.

2. Preserve source text
   - The LLM must keep code, URLs, emails, file paths, hashes, version strings, proper nouns, acronyms, etc. unchanged.
   - The app achieves this via LLM instructions (not app-side parsing rules).

3. Output format
   - The LLM follows instructions for formatting (keep layout, avoid unnecessary explanations, preserve Markdown, etc.).
   - The app only handles display actions like rendering and copy.

---

## 3. Scope

### 3.1 Languages

- Only Korean ↔ English.

### 3.2 Login required

- Users must sign in with a Google account.
- No sharing/collaboration features.

---

## 4. Screens and flow

### 4.1 Common layout

- Top: app header
- Left: session list (sidebar)
- Right: chat view (history + input area)

### 4.2 App header: UI language selection

- Provide a UI language selector in the header.
- Options:
  - English
  - Korean

- This only affects UI text (buttons/labels/menus). It is separate from translation direction.

### 4.3 Input area

- Multi-line input is supported.
- Users paste text and send it.

#### 4.3.1 LLM model selection

- Provide an LLM model selector immediately left of the input.
- Allowed models: `"gpt-5-nano" | "gpt-5-mini" | "gpt-5.2"`
- Default: `gpt-5-nano`
- The selected model is applied to that translation request.

---

## 5. Session (chat room) features

### 5.1 Meaning of a session

- A session is a chat room. Users can translate continuously within a session.
- Goal: improve quality/consistency by using prior translation context.

### 5.2 Session creation

- When the user sends the first message, create a new session automatically.

### 5.3 Meaning of “browse sessions” in the sidebar

- “Browsable sessions” means:
  - user selects any session in the sidebar,
  - that session’s chat history opens,
  - and the user can continue the conversation (more inputs/translations) in that session.

### 5.4 Session sorting and collapsing

- Sort sessions by most recent activity.
- Sessions whose last activity is older than 24 hours appear in a collapsed group.
- Users can expand to view them.
- Expanded/collapsed state is only in-memory UI state (not persisted).

### 5.5 Session deletion

- Support deleting an individual session.
- Support clearing all sessions at once.
- Deletion is permanent and irreversible.

---

## 6. Translation behavior

### 6.1 Basic translation

When the user submits input, the app:

1. Prepares prior translation results for that session.
2. Sends a request to the LLM with global settings (user instruction) included.
3. Displays and stores the translation result in the chat history.

### 6.2 Context policy (what prior content is sent)

- Only prior “translation outputs” in the session are sent as context.
- Prior user source inputs are NOT sent as context.

### 6.3 Markdown input/output

- User input can be Markdown.
- Translation output can be Markdown.
- The UI renders Markdown for display.

---

## 7. User actions on translation results

### 7.1 Copy

- Each translation result must have a copy action.
- Copy must copy the raw Markdown text, not the rendered view.

### 7.2 “Re-translate more concisely” button

- Each translation result area has exactly one button:
  - Re-translate more concisely

- Behavior:
  - when pressed on a specific result, generate a new translation that keeps meaning but is shorter.

- Do not delete the old result. Add the new result under the same group so users can compare.
- Keep the same tone/style settings as the current configuration.

---

## 8. Tone (style) settings

Users can toggle these per translation request:

- Paraphrase (default) / Literal
- Casual (default) / Formal
- General tone (default) / Technical documentation tone

---

## 9. Global setting (instruction)

- Provide a settings screen to view/edit a global instruction applied to translation.
- Only one global instruction exists per user.
- Apply immediately after saving.
- No versioning/rollback.

---

## 10. Failure handling

- If a translation request fails, show a clear failure state in that spot.
- No automatic retry.
- Allow the user to retry the same input manually.

---

## 11. Session length warning

- If a session gets too long, show a “session is too long” warning.
- The warning must not block translation.
- Include a button that encourages creating a new session.
- The “too long” threshold is based on cumulative size of prior translation outputs.

---

## 12. Non-functional requirements (ops/security direction)

- Do not call the LLM directly from the client. Only call it server-side.
- Deletions (delete session / clear all) must be permanent.

---

## 13. Runtime and additional implementation requirements

### 13.1 Runtime (Node.js)

- Frontend runs on Node.js 24.
- Backend (Cloud Functions) runs on Node.js 22.

### 13.2 Frontend requirements

- Use the Lucide `lang` icon for the favicon.
- In the settings menu:
  - Make it explicit that there are hardcoded system instructions that always apply in addition to user-editable instructions.
  - Disclose the full contents of the hardcoded instructions.

### 13.3 Backend (Cloud Functions) requirements

- For dev convenience, allow CORS for all origins.
- But restrict actual service access:
  - Only pre-approved emails (allowed email list) can use the system.

- `README.md` must include:
  1. How to set the OpenAI API key
     - local dev setup
     - production setup

  2. How to deploy the backend (Cloud Functions)
     - prerequisites
     - deployment commands and steps
