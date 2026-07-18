import { useState, useEffect } from 'react';
import { getVideoFromIndexedDB } from '../lib/videoStorage';

export function useResolveVideoUrl(url?: string): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setResolvedUrl('');
      return;
    }

    if (url.startsWith('local-video:')) {
      const key = url.substring('local-video:'.length);
      let active = true;
      let objectUrl = '';

      getVideoFromIndexedDB(key).then((blob) => {
        if (!active) return;
        if (blob) {
          try {
            objectUrl = URL.createObjectURL(blob);
            setResolvedUrl(objectUrl);
          } catch (e) {
            console.error('Failed to create object URL from blob:', e);
            setResolvedUrl('');
          }
        } else {
          setResolvedUrl('');
        }
      }).catch((err) => {
        console.error('Failed to retrieve video from IndexedDB:', err);
        setResolvedUrl('');
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
