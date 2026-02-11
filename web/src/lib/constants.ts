// UI Languages
export const UI_LANGUAGES = ["en", "ko"] as const
export type UILanguage = (typeof UI_LANGUAGES)[number]
export const DEFAULT_UI_LANGUAGE: UILanguage = "en"
