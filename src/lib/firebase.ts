import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');

// Test Connection (Critical Constraint from SKILL.md)
async function testConnection() {
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

// Main document reference in Firestore
const mainDocRef = doc(db, 'portfolio', 'main');

/**
 * Saves all portfolio data to Firestore.
 */
export async function savePortfolioToFirestore(data: any) {
  try {
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
  return onSnapshot(mainDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Firestore subscription error:", error);
  });
}
