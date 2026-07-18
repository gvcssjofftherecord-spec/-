import { useState, useEffect } from 'react';
import { getVideoFromIndexedDB } from '../lib/videoStorage';

/**
 * Custom hook to resolve local image/video keys (local-image:*, local-video:*) 
 * stored in IndexedDB, or directly return the web URLs.
 * Handles automatic object URL revocation to prevent memory leaks.
 */
export function useResolveImageUrl(url?: string, fallback = ''): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(fallback);

  useEffect(() => {
    if (!url) {
      setResolvedUrl(fallback);
      return;
    }

    // Handles both local-image: and local-video: prefix since they are both stored in the same store as Blobs
    if (url.startsWith('local-image:') || url.startsWith('local-video:')) {
      const key = url.substring(url.indexOf(':') + 1);
      let active = true;
      let objectUrl = '';

      getVideoFromIndexedDB(key)
        .then(async (blob) => {
          if (!active) return;
          if (blob) {
            try {
              objectUrl = URL.createObjectURL(blob);
              setResolvedUrl(objectUrl);
            } catch (e) {
              console.error('Failed to resolve image blob:', e);
              setResolvedUrl(fallback);
            }
          } else {
            // Fallback: Try fetching from Firestore cloud database
            try {
              const { downloadMediaFromFirestore } = await import('../lib/firebase');
              const remoteBlob = await downloadMediaFromFirestore(key);
              if (remoteBlob && active) {
                const { saveVideoToIndexedDB } = await import('../lib/videoStorage');
                await saveVideoToIndexedDB(key, remoteBlob);
                objectUrl = URL.createObjectURL(remoteBlob);
                setResolvedUrl(objectUrl);
              } else {
                setResolvedUrl(fallback);
              }
            } catch (cloudErr) {
              console.warn('Failed to fetch from cloud:', cloudErr);
              setResolvedUrl(fallback);
            }
          }
        })
        .catch((err) => {
          console.error('IndexedDB retrieve error:', err);
          setResolvedUrl(fallback);
        });

      return () => {
        active = false;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    } else {
      setResolvedUrl(url);
    }
  }, [url, fallback]);

  return resolvedUrl;
}
