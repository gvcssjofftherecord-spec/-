import { useState, useEffect } from 'react';
import { getVideoFromIndexedDB } from '../lib/videoStorage';

export function useResolveVideoUrl(url?: string, fallbackUrl: string = 'https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-a-camera-man-operating-a-camera-40679-large.mp4'): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setResolvedUrl(fallbackUrl);
      return;
    }

    if (url.startsWith('local-video:')) {
      const key = url.substring('local-video:'.length);
      let active = true;
      let objectUrl = '';

      getVideoFromIndexedDB(key).then(async (blob) => {
        if (!active) return;
        if (blob) {
          try {
            objectUrl = URL.createObjectURL(blob);
            setResolvedUrl(objectUrl);
          } catch (e) {
            console.error('Failed to create object URL from blob:', e);
            setResolvedUrl(fallbackUrl);
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
              setResolvedUrl(fallbackUrl);
            }
          } catch (cloudErr) {
            console.warn('Failed to fetch video from cloud:', cloudErr);
            setResolvedUrl(fallbackUrl);
          }
        }
      }).catch((err) => {
        console.error('Failed to retrieve video from IndexedDB:', err);
        setResolvedUrl(fallbackUrl);
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
  }, [url]);

  return resolvedUrl;
}
