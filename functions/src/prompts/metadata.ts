export const SESSION_METADATA_PROMPT = `Analyze the text and respond in JSON format.
- description: A concise description of the text content in Korean (max 50 characters)
- username: Extract the author/speaker name if present, otherwise null

Example: {"description": "제품 출시 일정과 마케팅 전략 회의", "username": "김철수"}
Example: {"description": "최신 SF 영화에 대한 상세 리뷰", "username": null}`
