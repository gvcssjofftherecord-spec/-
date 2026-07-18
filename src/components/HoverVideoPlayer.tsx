import React from 'react';
import { useResolveVideoUrl } from '../hooks/useResolveVideoUrl';
import { isYouTubeUrl, getHoverEmbedUrl } from '../lib/videoUtils';

interface HoverVideoPlayerProps {
  hoverVideoUrl: string;
  title: string;
}

export const HoverVideoPlayer: React.FC<HoverVideoPlayerProps> = ({ hoverVideoUrl, title }) => {
  const resolved = useResolveVideoUrl(hoverVideoUrl);

  if (isYouTubeUrl(hoverVideoUrl)) {
    return (
      <iframe
        src={getHoverEmbedUrl(hoverVideoUrl)}
        title={title}
        className="absolute inset-0 w-full h-full pointer-events-none scale-105"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        frameBorder="0"
      />
    );
  }

  return (
    <video
      src={resolved}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};
