import { getFirebaseDatabase } from "./firebase.js"
import type { Session, Message, MessageStatus, UserSettings } from "shared/types"
import type { SessionMetadata } from "./openai.js"

export async function createSession(userId: string, metadata: SessionMetadata): Promise<Session> {
  const db = getFirebaseDatabase()
  const sessionsRef = db.ref(`users/${userId}/sessions`)
  const newSessionRef = sessionsRef.push()

  const now = Date.now()
  const session: Session = {
    id: newSessionRef.key!,
    username: metadata.username,
    description: metadata.description,
    createdAt: now,
    updatedAt: now,
  }

  const sessionData: Record<string, unknown> = {
    description: session.description,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }

  if (session.username) {
    sessionData.username = session.username
  }

  await newSessionRef.set(sessionData)

  return session
}

export async function updateSessionTimestamp(userId: string, sessionId: string): Promise<void> {
  const db = getFirebaseDatabase()
  await db.ref(`users/${userId}/sessions/${sessionId}/updatedAt`).set(Date.now())
}

export async function updateSessionMetadata(
  userId: string,
  sessionId: string,
  metadata: Partial<SessionMetadata>,
): Promise<void> {
  const db = getFirebaseDatabase()
  const sessionRef = db.ref(`users/${userId}/sessions/${sessionId}`)

  const updates: Record<string, unknown> = {}
  if (metadata.description !== undefined) updates.description = metadata.description
  if (metadata.username !== undefined) updates.username = metadata.username

  await sessionRef.update(updates)
}

// Message operations
export async function addMessage(
  userId: string,
  sessionId: string,
  message: Omit<Message, "id">,
): Promise<Message> {
  const db = getFirebaseDatabase()
  const messagesRef = db.ref(`users/${userId}/sessions/${sessionId}/messages`)
  const newMessageRef = messagesRef.push()

  const fullMessage: Message = {
    ...message,
    id: newMessageRef.key!,
  }

  const messageData: Record<string, unknown> = {
    type: fullMessage.type,
    content: fullMessage.content,
    createdAt: fullMessage.createdAt,
  }

  if (fullMessage.model !== undefined) messageData.model = fullMessage.model
  if (fullMessage.tone !== undefined) messageData.tone = fullMessage.tone
  if (fullMessage.parentId !== undefined) messageData.parentId = fullMessage.parentId
  if (fullMessage.status !== undefined) messageData.status = fullMessage.status
  if (fullMessage.errorMessage !== undefined) messageData.errorMessage = fullMessage.errorMessage

  await newMessageRef.set(messageData)

  await updateSessionTimestamp(userId, sessionId)

  return fullMessage
}

export interface UpdateMessageData {
  content?: string
  status?: MessageStatus
  errorMessage?: string
}

export async function updateMessage(
  userId: string,
  sessionId: string,
  messageId: string,
  data: UpdateMessageData,
): Promise<void> {
  const db = getFirebaseDatabase()
  const messageRef = db.ref(`users/${userId}/sessions/${sessionId}/messages/${messageId}`)

  const updates: Record<string, unknown> = {}
  if (data.content !== undefined) updates.content = data.content
  if (data.status !== undefined) updates.status = data.status
  if (data.errorMessage !== undefined) updates.errorMessage = data.errorMessage

  await messageRef.update(updates)
  await updateSessionTimestamp(userId, sessionId)
}

export interface TranslationPair {
  source: string
  translation: string
}

export async function getTranslationContext(
  userId: string,
  sessionId: string,
): Promise<TranslationPair[]> {
  const db = getFirebaseDatabase()
  const messagesRef = db.ref(`users/${userId}/sessions/${sessionId}/messages`)
  const snapshot = await messagesRef.orderByChild("createdAt").get()

  if (!snapshot.exists()) return []

  const messages: Array<{ type: string; content: string; parentId?: string }> = []
  snapshot.forEach((child) => {
    const data = child.val()
    messages.push({ type: data.type, content: data.content, parentId: data.parentId })
  })

  const pairs: TranslationPair[] = []
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    // Skip retranslations (translations with parentId)
    if (msg.type === "translation" && !msg.parentId) {
      // Find the preceding source message
      const source = i > 0 && messages[i - 1].type === "source" ? messages[i - 1].content : ""
      if (source) {
        pairs.push({ source, translation: msg.content })
      }
    }
  }

  return pairs
}

export async function getMessageContent(
  userId: string,
  sessionId: string,
  messageId: string,
): Promise<string> {
  const db = getFirebaseDatabase()
  const messageRef = db.ref(`users/${userId}/sessions/${sessionId}/messages/${messageId}`)
  const snapshot = await messageRef.get()

  if (!snapshot.exists()) return ""
  return snapshot.val().content || ""
}

// Settings operations
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const db = getFirebaseDatabase()
  const settingsRef = db.ref(`users/${userId}/settings`)
  const snapshot = await settingsRef.get()

  if (!snapshot.exists()) return null
  return snapshot.val()
}
