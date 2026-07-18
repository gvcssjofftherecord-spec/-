import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer, setDoc, onSnapshot, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase safely
let app;
let firestoreDb: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  // Initialize Firestore with specific databaseId
  firestoreDb = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');
  console.log("Firebase App and Firestore initialized successfully.");
} catch (error) {
  console.error("Firebase/Firestore initialization failed:", error);
}

export const db = firestoreDb;

// Test Connection (Critical Constraint from SKILL.md)
async function testConnection() {
  if (!db) {
    console.warn("Firestore database instance is not available. Skipping connection test.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'portfolio', 'main'));
    console.log("Firebase Connection Verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
      console.warn("Initial Firebase connect attempt warning (might be offline or unitialized):", error);
    }
  }
}

testConnection();

/**
 * Saves all portfolio data to Firestore.
 */
export async function savePortfolioToFirestore(data: any) {
  if (!db) {
    console.warn("Cannot save to Firestore: Database is not initialized.");
    return;
  }
  try {
    const mainDocRef = doc(db, 'portfolio', 'main');
    await setDoc(mainDocRef, data, { merge: true });
    console.log("Successfully synchronized portfolio data with Firebase Firestore.");
  } catch (error) {
    console.error("Failed to save portfolio data to Firestore:", error);
    throw error;
  }
}

/**
 * Subscribes to real-time changes in the Firestore portfolio document.
 * Calls the callback with the document data, or null if the document does not exist.
 */
export function subscribePortfolio(callback: (data: any) => void) {
  if (!db) {
    console.warn("Firestore is not initialized. Using local storage only.");
    // Call callback with null after a brief delay so the app knows to fall back to local storage
    setTimeout(() => callback(null), 100);
    return () => {};
  }

  try {
    const mainDocRef = doc(db, 'portfolio', 'main');
    return onSnapshot(mainDocRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Firestore subscription error:", error);
      // Fallback to local
      callback(null);
    });
  } catch (error) {
    console.error("Failed to create Firestore subscription:", error);
    callback(null);
    return () => {};
  }
}
