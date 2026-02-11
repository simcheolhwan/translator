// Cloud Functions entry point

// Translation
export { translateFunction as translate } from "./functions/translate.js"

// Sessions
export { listSessionsFunction as listSessions } from "./functions/sessions/list.js"
export { getSessionFunction as getSession } from "./functions/sessions/get.js"
export { deleteSessionFunction as deleteSession } from "./functions/sessions/delete.js"
export { clearAllSessionsFunction as clearAllSessions } from "./functions/sessions/clearAll.js"

// Settings
export { getSettingsFunction as getSettings } from "./functions/settings/get.js"
export { updateSettingsFunction as updateSettings } from "./functions/settings/update.js"

// Export system prompt for disclosure
export { SYSTEM_PROMPT } from "shared/prompts"
