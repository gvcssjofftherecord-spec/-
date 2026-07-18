/**
 * Helper to extract YouTube Video ID from various YouTube URL formats
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Handle embed URLs first: youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/\/embed\/([^#\&\?]+)/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // Handle standard watch URLs and short URLs: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  // Handle YouTube Shorts: youtube.com/shorts/VIDEO_ID
  const shortsRegExp = /\/shorts\/([^#\&\?]+)/;
  const shortsMatch = trimmed.match(shortsRegExp);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1].split('?')[0];
  }

  return null;
}

/**
 * Checks if a URL is a YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('youtube-nocookie.com')
  );
}

/**
 * Generates the correct embed URL for full video playback in ProjectDetail modal
 */
export function getFullEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  if (isYouTubeUrl(trimmed)) {
    const ytId = getYouTubeId(trimmed);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&enablejsapi=1`;
    }
  }
  
  return trimmed;
}

/**
 * Generates the correct embed URL for hover preview (muted, autoplay, looping, without controls)
 */
export function getHoverEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  if (isYouTubeUrl(trimmed)) {
    const ytId = getYouTubeId(trimmed);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1`;
    }
  }
  
  return trimmed;
}

/**
 * Helper to compress image data URL (Base64) to fit in localStorage.
 * Resizes the image so that max width/height is 1080px and reduces JPEG quality to 0.7.
 */
export function compressImageDataUrl(dataUrl: string, maxWidth = 1080, maxHeight = 1080): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Check if resizing is necessary
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as jpeg with 0.7 quality to dramatically reduce size
      try {
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      } catch (e) {
        console.error('Failed to compress canvas image', e);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

