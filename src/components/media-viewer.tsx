'use client';

import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { MediaViewerItem } from '@/lib/types';
import Image from 'next/image';

type MediaViewerProps = {
  item: MediaViewerItem | null;
  onClose: () => void;
};

export function MediaViewer({ item, onClose }: MediaViewerProps) {
  if (!item) return null;

  // Use a proxy for downloading to avoid CORS issues if possible
  const handleDownload = async () => {
    if (!item.mediaUrl) return;
    try {
      // For cross-origin images, we can't read the blob directly without server-side help (proxy)
      // So, the simplest reliable method is to open it in a new tab and let the browser handle it.
      // The user can then right-click and "Save As...".
      window.open(item.mediaUrl, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
      // As a fallback, open the media in a new tab
      window.open(item.mediaUrl, '_blank');
    }
  };
  
  const getEmbedUrl = (item: MediaViewerItem) => {
    if (item.type !== 'video') return undefined;
    if (item.embedUrl) return item.embedUrl;
    
    // Create embed URLs for common video platforms
    const url = new URL(item.sourceUrl);
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    return item.sourceUrl; // Fallback to source URL for other cases
  }

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col p-4 animate-in fade-in-0"
        onClick={onClose}
    >
      <header className="flex-shrink-0 flex items-center justify-between text-white mb-4" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col overflow-hidden">
            <h3 className="font-semibold truncate">{item.title}</h3>
            <a 
                href={item.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-300 hover:underline truncate"
            >
                {new URL(item.sourceUrl).hostname}
            </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {item.mediaUrl && (
                <Button variant="ghost" size="icon" onClick={handleDownload} title="İndir">
                    <Download className="h-5 w-5 text-white" />
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => window.open(item.sourceUrl, '_blank')} title="Siteye Git">
                <ExternalLink className="h-5 w-5 text-white" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} title="Kapat">
                <X className="h-6 w-6 text-white" />
            </Button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {item.type === 'video' && (
            item.mediaUrl ? (
                <video src={item.mediaUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            ) : (
                <iframe src={getEmbedUrl(item)} title={item.title} className="w-full h-full bg-black border-0 rounded-lg aspect-video" allow="autoplay; encrypted-media" allowFullScreen />
            )
        )}
        {item.type === 'image' && item.mediaUrl && (
            <div className="relative w-full h-full">
                <Image src={item.mediaUrl} alt={item.title} layout="fill" objectFit="contain" unoptimized />
            </div>
        )}
      </main>
    </div>
  );
}
