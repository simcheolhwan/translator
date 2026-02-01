import { getFirebaseDatabase } from "./firebase.js"
import type { Session, SessionWithMessages, Message, MessageStatus } from "../types/session.js"

// Session operations
export interface SessionMetadata {
  username?: string
  description: string
}

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

export async function getSession(
  userId: string,
  sessionId: string,
): Promise<SessionWithMessages | null> {
  const db = getFirebaseDatabase()
  const sessionRef = db.ref(`users/${userId}/sessions/${sessionId}`)
  const snapshot = await sessionRef.get()

  if (!snapshot.exists()) return null

  const data = snapshot.val()
  return {
    id: sessionId,
    username: data.username,
    description: data.description || "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    messages: data.messages || {},
  }
}

export async function listSessions(userId: string): Promise<Session[]> {
  const db = getFirebaseDatabase()
  const sessionsRef = db.ref(`users/${userId}/sessions`)
  const snapshot = await sessionsRef.orderByChild("updatedAt").get()

  if (!snapshot.exists()) return []

  const sessions: Session[] = []
  snapshot.forEach((child) => {
    const data = child.val()
    sessions.push({
      id: child.key!,
      username: data.username,
      description: data.description || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  })

  // Reverse to get most recent first
  return sessions.reverse()
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  const db = getFirebaseDatabase()
  await db.ref(`users/${userId}/sessions/${sessionId}`).remove()
}

export async function clearAllSessions(userId: string): Promise<void> {
  const db = getFirebaseDatabase()
  await db.ref(`users/${userId}/sessions`).remove()
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

export async function getTranslationContext(userId: string, sessionId: string): Promise<string[]> {
  const db = getFirebaseDatabase()
  const messagesRef = db.ref(`users/${userId}/sessions/${sessionId}/messages`)
  const snapshot = await messagesRef.orderByChild("createdAt").get()

  if (!snapshot.exists()) return []

  const translations: string[] = []
  snapshot.forEach((child) => {
    const data = child.val()
    if (data.type === "translation") {
      translations.push(data.content)
    }
  })

  return translations
}

// Settings operations
export interface UserSettings {
  globalInstruction: string
  createdAt: number
  updatedAt: number
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const db = getFirebaseDatabase()
  const settingsRef = db.ref(`users/${userId}/settings`)
  const snapshot = await settingsRef.get()

  if (!snapshot.exists()) return null
  return snapshot.val()
}

export async function updateUserSettings(
  userId: string,
  globalInstruction: string,
): Promise<UserSettings> {
  const db = getFirebaseDatabase()
  const settingsRef = db.ref(`users/${userId}/settings`)
  const existing = await getUserSettings(userId)

  const now = Date.now()
  const settings: UserSettings = {
    globalInstruction,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await settingsRef.set(settings)
  return settings
}
