'use client';

import { X, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { canBeIframed } from '@/ai/flows/can-be-iframed';
import { Input } from './ui/input';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
  onNavigate: (query: string) => void;
};

export function WebViewer({ tab, onClose, onNavigate }: WebViewerProps) {
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

  useEffect(() => {
    if(tab) {
        setDisplayUrl(tab.url);
    }
  }, [tab]);

  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const reload = () => {
    setViewKey(Date.now());
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNavigate(displayUrl);
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
        <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={displayUrl}
                onChange={(e) => setDisplayUrl(e.target.value)}
                className="w-full rounded-full bg-muted pl-9 pr-4 h-9"
            />
        </form>
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
