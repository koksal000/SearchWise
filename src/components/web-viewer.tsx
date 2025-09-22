'use client';

import { X, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { Input } from './ui/input';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
  onNavigate: (query: string) => void;
};

export function WebViewer({ tab, onClose, onNavigate }: WebViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayUrl, setDisplayUrl] = useState(tab?.url || '');
  const [viewKey, setViewKey] = useState(Date.now());

  useEffect(() => {
    if (tab) {
      setIsLoading(true);
      setDisplayUrl(tab.url);
      setViewKey(Date.now()); // Force iframe to re-render
    }
  }, [tab]);

  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const reload = () => {
    if (iframeRef.current) {
        setIsLoading(true);
        iframeRef.current.src = tab?.url || '';
    }
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
          <Button variant="ghost" size="icon" onClick={reload} disabled={isLoading}>
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
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        )}
        <iframe
          key={viewKey}
          ref={iframeRef}
          src={tab.url}
          onLoad={handleLoad}
          onError={() => setIsLoading(false)} // Stop loading indicator on error too
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
