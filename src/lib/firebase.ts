import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, setDoc, onSnapshot, Firestore, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase safely
let app;
let firestoreDb: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  // Get/initialize Firestore instance with specific databaseId
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
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

/**
 * Converts a Blob to a Base64 Data URL.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a Base64 Data URL back to a Blob.
 */
export function base64ToBlob(base64DataUrl: string): Blob {
  const arr = base64DataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads a local image or video file to Firestore under /media/{key} as a base64-encoded document.
 */
export async function uploadMediaToFirestore(key: string, blob: Blob): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized. Skipping cloud media upload.");
    return;
  }
  try {
    const base64 = await blobToBase64(blob);
    const docRef = doc(db, 'media', key);
    await setDoc(docRef, {
      id: key,
      mimeType: blob.type,
      base64: base64
    });
    console.log(`Successfully uploaded media [${key}] to Firestore cloud database.`);
  } catch (error) {
    console.error(`Failed to upload media [${key}] to Firestore:`, error);
  }
}

/**
 * Downloads a media document from Firestore under /media/{key} and returns a Blob.
 */
export async function downloadMediaFromFirestore(key: string): Promise<Blob | null> {
  if (!db) {
    console.warn("Firestore not initialized. Cannot download cloud media.");
    return null;
  }
  try {
    const docRef = doc(db, 'media', key);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.base64) {
        return base64ToBlob(data.base64);
      }
    }
    return null;
  } catch (error) {
    console.warn(`Failed to download cloud media [${key}] from Firestore:`, error);
    return null;
  }
}
