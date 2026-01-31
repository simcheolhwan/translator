import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getDatabase, type Database } from "firebase-admin/database"

let app: App
let auth: Auth
let database: Database

export function initializeFirebase() {
  if (getApps().length === 0) {
    // In production, uses default credentials from environment
    // In development, uses GOOGLE_APPLICATION_CREDENTIALS or emulators
    app = initializeApp()
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)
  database = getDatabase(app)

  return { app, auth, database }
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase()
  return auth
}

export function getFirebaseDatabase(): Database {
  if (!database) initializeFirebase()
  return database
}
