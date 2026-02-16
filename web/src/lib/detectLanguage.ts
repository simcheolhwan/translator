const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g
const ALPHA_REGEX = /[a-zA-Z]/g

export function isKorean(text: string): boolean {
  const koreanCount = (text.match(KOREAN_REGEX) ?? []).length
  if (koreanCount === 0) return false

  const alphaCount = (text.match(ALPHA_REGEX) ?? []).length
  const total = koreanCount + alphaCount
  if (total === 0) return false

  return koreanCount / total >= 0.3
}
