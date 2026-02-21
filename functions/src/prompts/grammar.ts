export { GRAMMAR_CHECK_SYSTEM_PROMPT } from "../shared/prompts/index.js"

export function buildGrammarCheckPrompt(text: string): string {
  return `Check and correct the grammar of the following English text:\n\n${text}`
}
