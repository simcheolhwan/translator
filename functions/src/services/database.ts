import { getFirebaseDatabase } from "./firebase.js"
import type { Session, SessionWithMessages, Message } from "../types/session.js"

// Session operations
export async function createSession(userId: string, title: string): Promise<Session> {
  const db = getFirebaseDatabase()
  const sessionsRef = db.ref(`users/${userId}/sessions`)
  const newSessionRef = sessionsRef.push()

  const now = Date.now()
  const session: Session = {
    id: newSessionRef.key!,
    title,
    createdAt: now,
    updatedAt: now,
  }

  await newSessionRef.set({
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  })

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
    title: data.title,
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
      title: data.title,
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

  await newMessageRef.set({
    type: fullMessage.type,
    content: fullMessage.content,
    model: fullMessage.model,
    tone: fullMessage.tone,
    parentId: fullMessage.parentId,
    createdAt: fullMessage.createdAt,
  })

  await updateSessionTimestamp(userId, sessionId)

  return fullMessage
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
