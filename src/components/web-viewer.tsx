'use client';

import { X, ExternalLink, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useRef, useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { Input } from './ui/input';
import { fetchPageContent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
  onNavigate: (query: string) => void;
};

const LOAD_TIMEOUT = 5000; // 5 seconds

export function WebViewer({ tab, onClose, onNavigate }: WebViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayUrl, setDisplayUrl] = useState(tab?.url || '');
  const [viewKey, setViewKey] = useState(Date.now());
  const [useSrcDoc, setUseSrcDoc] = useState(false);
  const [srcDocContent, setSrcDocContent] = useState('');
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadContentAsProxy = async (url: string) => {
    // Ensure we don't run this multiple times
    if (useSrcDoc) return;
    
    setIsLoading(true);
    const result = await fetchPageContent(url);
    if ('content' in result) {
      // Add a <base> tag to resolve relative paths
      const baseTag = `<base href="${new URL(url).origin}">`;
      setSrcDocContent(baseTag + result.content);
      setUseSrcDoc(true);
    } else {
      toast({
        variant: "destructive",
        title: "Failed to load page",
        description: result.error,
      });
      // Fallback to trying to load in iframe directly on error
      setUseSrcDoc(false);
    }
    setIsLoading(false);
  }

  const clearLoadTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (tab) {
      setIsLoading(true);
      setDisplayUrl(tab.url);
      setViewKey(Date.now());
      setUseSrcDoc(false);
      setSrcDocContent('');
      
      // Set a timeout to assume the site is blocked if it doesn't load
      clearLoadTimeout();
      timeoutRef.current = setTimeout(() => {
        if (isLoading && tab.url) { // If still loading after timeout
          loadContentAsProxy(tab.url);
        }
      }, LOAD_TIMEOUT);
    }

    return () => {
      clearLoadTimeout();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  
  const handleLoad = () => {
    setIsLoading(false);
    clearLoadTimeout();
  };
  
  const reload = () => {
    if(tab) {
      setIsLoading(true);
      setDisplayUrl(tab.url);
      setViewKey(Date.now());
      setUseSrcDoc(false);
      setSrcDocContent('');

      // Restart the timeout logic on reload
      clearLoadTimeout();
      timeoutRef.current = setTimeout(() => {
        if (isLoading && tab.url) {
          loadContentAsProxy(tab.url);
        }
      }, LOAD_TIMEOUT);
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
            <div className='absolute left-3 top-1/2 -translate-y-1/2' title={useSrcDoc ? 'Viewing in simplified mode' : 'Secure'}>
              {useSrcDoc ? (
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
              ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Input
                value={displayUrl}
                onChange={(e) => setDisplayUrl(e.target.value)}
                className="w-full rounded-full bg-muted pl-9 pr-4 h-9"
            />
        </form>
        <Button variant="ghost" size="icon" onClick={() => window.open(tab.url, '_blank')} title="Open in new tab">
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
          src={!useSrcDoc ? tab.url : undefined}
          srcDoc={useSrcDoc ? srcDocContent : undefined}
          onLoad={handleLoad}
          onError={() => loadContentAsProxy(tab.url)} // Try proxy on direct error
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
