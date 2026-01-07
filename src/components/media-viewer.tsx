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

  const handleDownload = async () => {
    if (!item.mediaUrl) return;
    try {
      // Use fetch to get the data as a blob
      const response = await fetch(item.mediaUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger the download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Get the filename from the URL
      const filename = item.mediaUrl.split('/').pop() || 'download';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Download failed:", error);
      // As a fallback for CORS or other issues, open the media in a new tab
      window.open(item.mediaUrl, '_blank');
    }
  };
  
  const getEmbedUrl = (item: MediaViewerItem) => {
    if (item.type !== 'video') return undefined;
    
    // If we have an embed URL from the API, prioritize it.
    if (item.embedUrl) {
        // Ensure the URL has a scheme.
        if (item.embedUrl.startsWith('//')) {
            return `https:${item.embedUrl}`;
        }
        return item.embedUrl;
    }
    
    // Otherwise, try to create embed URLs for common video platforms
    try {
        const url = new URL(item.sourceUrl);
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.hostname.includes('vimeo.com')) {
            const videoId = url.pathname.split('/').pop();
            if (videoId) return `https://player.vimeo.com/video/${videoId}`;
        }
    } catch(e) {
        console.error("Invalid source URL for embedding:", item.sourceUrl);
    }


    // Fallback to the direct media URL if it exists, otherwise source URL.
    return item.mediaUrl || item.sourceUrl; 
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
        {item.type === 'video' ? (
            item.mediaUrl ? (
                <video src={item.mediaUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
            ) : (
                <iframe src={getEmbedUrl(item)} title={item.title} className="w-full h-full bg-black border-0 rounded-lg aspect-video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            )
        ) : null}
        {item.type === 'image' && item.mediaUrl ? (
            <div className="relative w-full h-full">
                <Image src={item.mediaUrl} alt={item.title} layout="fill" objectFit="contain" unoptimized />
            </div>
        ) : null}
      </main>
    </div>
  );
}
