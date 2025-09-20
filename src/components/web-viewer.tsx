'use client';

import { X, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
};

export function WebViewer({ tab, onClose }: WebViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(tab?.url || '');
  const [viewKey, setViewKey] = useState(Date.now());

  useEffect(() => {
    if (tab) {
      setIsLoading(true);
      setCurrentUrl(tab.url);
    }
  }, [tab, viewKey]);

  const handleLoad = () => {
    setIsLoading(false);
    try {
        const iframeUrl = iframeRef.current?.contentWindow?.location.href;
        if (iframeUrl && iframeUrl !== 'about:blank') {
            setCurrentUrl(iframeUrl);
        }
    } catch (e) {
        console.warn('Could not access iframe URL due to cross-origin restrictions.');
    }
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
        <iframe
          key={viewKey}
          ref={iframeRef}
          src={tab.url}
          onLoad={handleLoad}
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
