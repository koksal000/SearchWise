'use client';

import { X, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { canBeIframed } from '@/ai/flows/can-be-iframed';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
};

export function WebViewer({ tab, onClose }: WebViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState(tab?.url || '');
  const [viewKey, setViewKey] = useState(Date.now());

  useEffect(() => {
    const determineSrc = async () => {
      if (!tab) return;
      
      setIsLoading(true);
      setDisplayUrl(tab.url);
      setIframeSrc(null); // Clear previous src

      try {
        const { canBeIframed: isDirectlyIframable } = await canBeIframed({ url: tab.url });
        
        if (isDirectlyIframable) {
          setIframeSrc(tab.url);
        } else {
          console.log(`Cannot be iframed directly, using proxy for: ${tab.url}`);
          setIframeSrc(`/api/proxy/${tab.url}`);
        }
      } catch (error) {
        console.error("Error checking iframability, falling back to proxy:", error);
        setIframeSrc(`/api/proxy/${tab.url}`);
      }
    };

    determineSrc();
  }, [tab, viewKey]);

  const handleLoad = () => {
    setIsLoading(false);
    // Note: Accessing contentWindow properties might fail due to cross-origin restrictions,
    // so we don't update the display URL from the iframe anymore. The proxy handles this.
  };
  
  const reload = () => {
    setViewKey(Date.now());
  };
  
  if (!tab) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex h-12 flex-shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={reload} disabled={isLoading && !iframeSrc}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex-1 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground truncate">
          {displayUrl}
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.open(tab.url, '_blank')}>
          <ExternalLink className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-grow relative">
        {(isLoading || !iframeSrc) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        )}
        {iframeSrc && (
          <iframe
            key={viewKey}
            ref={iframeRef}
            src={iframeSrc}
            onLoad={handleLoad}
            onError={() => setIsLoading(false)} // Stop loading indicator on error too
            title={tab.title}
            className="h-full w-full border-0"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
            style={{ visibility: (isLoading || !iframeSrc) ? 'hidden' : 'visible' }}
          />
        )}
      </div>
    </div>
  );
}
