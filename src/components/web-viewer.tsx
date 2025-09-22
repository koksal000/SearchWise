'use client';

import { X, ExternalLink, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { Input } from './ui/input';
import { fetchPageContent } from '@/app/actions';
import { canBeIframed } from '@/ai/flows/can-be-iframed';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
  onNavigate: (query: string) => void;
};

type ViewMode = 'direct' | 'proxied' | 'loading';

export function WebViewer({ tab, onClose, onNavigate }: WebViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [displayUrl, setDisplayUrl] = useState(tab?.url || '');
  const [srcDocContent, setSrcDocContent] = useState('');
  const [viewKey, setViewKey] = useState(Date.now());
  const { toast } = useToast();

  const loadContent = async (url: string) => {
    setViewMode('loading');
    setDisplayUrl(url);
    setViewKey(Date.now());
    setSrcDocContent('');

    try {
      const { canBeIframed: isIframable } = await canBeIframed({ url });

      if (isIframable) {
        setViewMode('direct');
      } else {
        const result = await fetchPageContent(url);
        if ('content' in result) {
          const baseTag = `<base href="${new URL(url).origin}">`;
          setSrcDocContent(baseTag + result.content);
          setViewMode('proxied');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Failed to load page",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      onClose(); // Close viewer on error
    }
  };

  useEffect(() => {
    if (tab) {
      loadContent(tab.url);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  
  const reload = () => {
    if(tab) {
      loadContent(tab.url);
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNavigate(displayUrl);
  };

  if (!tab) return null;

  const isLoading = viewMode === 'loading';

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
            <div className='absolute left-3 top-1/2 -translate-y-1/2'>
              {viewMode === 'proxied' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center" aria-label="Simplified mode info">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Simplified View</h4>
                          <p className="text-sm text-muted-foreground">
                            This site restricts being embedded, so it's shown in a simplified mode. Some features like logins or complex scripts may not work.
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
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
          src={viewMode === 'direct' ? tab.url : undefined}
          srcDoc={viewMode === 'proxied' ? srcDocContent : undefined}
          title={tab.title}
          className="h-full w-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          style={{ visibility: isLoading ? 'hidden' : 'visible' }}
        />
      </div>
    </div>
  );
}
