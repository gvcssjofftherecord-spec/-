import React from 'react';
import { useResolveImageUrl } from '../hooks/useResolveImageUrl';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
}

/**
 * An intelligent image component that supports both traditional HTTP URLs/Base64
 * and local asset URLs (local-image:*, local-video:*) stored securely in IndexedDB.
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallback = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80', 
  alt = 'Image Asset',
  className = '',
  ...props 
}) => {
  const resolvedUrl = useResolveImageUrl(src, fallback);

  return (
    <img 
      src={resolvedUrl} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer"
      {...props} 
    />
  );
};
