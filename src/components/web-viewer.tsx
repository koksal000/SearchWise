'use client';

import { X, ArrowLeft, ArrowRight, RotateCw, Globe } from 'lucide-react';
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
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const reloadIframe = () => {
    if (iframeRef.current) {
      // Setting src to itself is a way to reload an iframe without cross-origin issues
      iframeRef.current.src = tab?.url || '';
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const handleLoad = () => {
      setIsLoading(false);
      try {
        // Accessing contentWindow can throw a cross-origin error
        const contentWindow = iframe.contentWindow;
        if (contentWindow && contentWindow.location.href === 'about:blank') {
          // This can happen if the site blocks framing
          setIframeError(true);
        }
      } catch (e) {
         setIframeError(true);
      }
    };
    
    const handleError = () => {
      setIsLoading(false);
      setIframeError(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };

  }, [tab?.url]);
  
  if (!tab) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex h-12 flex-shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={reloadIframe} disabled={isLoading}>
            <RotateCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex-1 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground truncate">
          {tab.url}
        </div>
      </header>
      <div className="flex-grow relative">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        )}
        {iframeError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-8 text-center">
                <Globe className="h-16 w-16 text-destructive/50 mb-4"/>
                <h3 className="text-xl font-semibold">Could not load page</h3>
                <p className="text-muted-foreground mt-2">The site <span className="font-mono">{new URL(tab.url).hostname}</span> may not allow being displayed in other pages.</p>
                <Button className="mt-6" onClick={() => window.open(tab.url, '_blank')}>Open in New Tab</Button>
            </div>
        )}
        <iframe
          ref={iframeRef}
          src={tab.url}
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading || iframeError ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
