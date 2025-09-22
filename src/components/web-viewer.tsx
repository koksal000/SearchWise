'use client';

import { X, ExternalLink, RefreshCw, Search, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { TabItem } from '@/lib/types';
import { Input } from './ui/input';
import { fetchPageContent } from '@/app/actions';
import { canBeIframed } from '@/ai/flows/can-be-iframed';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type WebViewerProps = {
  tab: TabItem | undefined;
  onClose: () => void;
  onNavigate: (query: string) => void;
};

type ViewMode = 'direct' | 'proxied' | 'loading';

export function WebViewer({ tab, onClose, onNavigate }: WebViewerProps) {
  const [displayUrl, setDisplayUrl] = useState(tab?.url || '');
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [srcDocContent, setSrcDocContent] = useState('');
  const [viewKey, setViewKey] = useState(Date.now());
  const [isCloseConfirmationOpen, setCloseConfirmationOpen] = useState(false);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { toast } = useToast();
  
  const currentUrl = useMemo(() => history[historyIndex] || '', [history, historyIndex]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const loadContent = useCallback(async (url: string, navigationType: 'new' | 'history' = 'new') => {
    setViewMode('loading');
    setDisplayUrl(url);
    setViewKey(Date.now());
    setSrcDocContent('');
    
    if (navigationType === 'new') {
        // Eğer yeni bir URL'e gidiliyorsa, mevcut index'ten sonraki geçmişi sil ve yeni URL'i ekle
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(url);
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });
    }

    try {
      const { canBeIframed: isIframable } = await canBeIframed({ url });

      if (isIframable) {
        setViewMode('direct');
      } else {
        const result = await fetchPageContent(url);
        if ('content' in result) {
          const baseTag = `<base href="${new URL(url).origin}">`;
          const navigationInterceptorScript = `
            <script>
              document.addEventListener('click', function(e) {
                let target = e.target;
                while (target && target.tagName !== 'A') {
                  target = target.parentElement;
                }
                if (target && target.href) {
                  e.preventDefault();
                  // Sadece http/https linklerini yakala
                  if (target.protocol === 'http:' || target.protocol === 'https:') {
                    window.parent.postMessage({ type: 'navigate', url: target.href }, '*');
                  }
                }
              }, true);
            <\/script>
          `;
          setSrcDocContent(baseTag + navigationInterceptorScript + result.content);
          setViewMode('proxied');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Sayfa yüklenemedi",
        description: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.',
      });
      // Hata durumunda, geçmişte bir önceki sayfaya dön
      if (canGoBack) {
          setHistoryIndex(prev => prev - 1);
      } else {
          onClose(); // Gidecek yer yoksa kapat
      }
    }
  }, [toast, onClose, historyIndex, canGoBack]);

  useEffect(() => {
    if (tab && tab.url !== currentUrl) {
        setHistory([tab.url]);
        setHistoryIndex(0);
        loadContent(tab.url, 'history');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate' && event.data.url) {
        const newUrl = new URL(event.data.url, currentUrl).href;
        loadContent(newUrl, 'new');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [loadContent, currentUrl]);
  
  const reload = () => {
    if (currentUrl) {
      loadContent(currentUrl, 'history');
    }
  };

  const goBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadContent(history[newIndex], 'history');
    }
  }

  const goForward = () => {
      if (canGoForward) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          loadContent(history[newIndex], 'history');
      }
  }
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNavigate(displayUrl);
  };
  
  const handleCloseClick = () => {
      setCloseConfirmationOpen(true);
  }

  if (!tab) return null;

  const isLoading = viewMode === 'loading';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <header className="flex h-12 flex-shrink-0 items-center gap-2 border-b px-2 sm:px-4">
          <Button variant="ghost" size="icon" onClick={handleCloseClick}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goBack} disabled={!canGoBack || isLoading}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goForward} disabled={!canGoForward || isLoading}>
                <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={reload} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 relative">
              <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                {viewMode === 'proxied' ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center" aria-label="Basitleştirilmiş mod bilgisi">
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Basitleştirilmiş Görünüm</h4>
                            <p className="text-sm text-muted-foreground">
                              Bu site yerleştirilmeyi kısıtladığı için basitleştirilmiş modda gösteriliyor. Giriş yapma veya karmaşık betikler gibi bazı özellikler çalışmayabilir.
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
          <Button variant="ghost" size="icon" onClick={() => window.open(currentUrl, '_blank')} title="Yeni sekmede aç">
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
            src={viewMode === 'direct' ? currentUrl : undefined}
            srcDoc={viewMode === 'proxied' ? srcDocContent : undefined}
            title={tab.title}
            className="h-full w-full border-0"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          />
        </div>
      </div>
      <AlertDialog open={isCloseConfirmationOpen} onOpenChange={setCloseConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Onay</AlertDialogTitle>
            <AlertDialogDescription>
              Bu sekmeden çıkmak istediğinize emin misiniz? Yaptığınız değişiklikler kaybolabilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Çık</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
