const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/

export function isKorean(text: string): boolean {
  return KOREAN_REGEX.test(text)
}
