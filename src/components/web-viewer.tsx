'use client';

import { X, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { fetchUrlContent } from '@/app/actions';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
};

export function WebViewer({ tab, onClose }: WebViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(tab?.url || '');
  const [viewKey, setViewKey] = useState(Date.now()); // to force re-render

  useEffect(() => {
    if (!tab) return;
    
    const loadContent = async () => {
        setIsLoading(true);
        setError(null);
        setCurrentUrl(tab.url);

        const result = await fetchUrlContent(tab.url);
        
        if ('error' in result) {
            setError(result.error);
        } else {
            const iframe = iframeRef.current;
            if (iframe) {
                iframe.srcdoc = result.content;
                setCurrentUrl(result.finalUrl);
            }
        }
        setIsLoading(false);
    };

    loadContent();
  }, [tab, viewKey]);

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
          <Button variant="ghost" size="icon" onClick={reload} disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex-1 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground truncate">
          {currentUrl}
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.open(currentUrl, '_blank')}>
          <ExternalLink className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-grow relative">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        )}
        {error && !isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-8 text-center">
                <ExternalLink className="h-16 w-16 text-destructive/50 mb-4"/>
                <h3 className="text-xl font-semibold">Could not load page</h3>
                <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
                <Button className="mt-6" onClick={() => window.open(tab.url, '_blank')}>Open in New Tab</Button>
            </div>
        )}
        <iframe
          ref={iframeRef}
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading || error ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
