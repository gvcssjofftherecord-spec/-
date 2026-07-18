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
        .then((blob) => {
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
            setResolvedUrl(fallback);
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
