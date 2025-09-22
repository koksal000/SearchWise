'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTabs } from '@/hooks/use-tabs';
import { X, Globe, Trash2 } from 'lucide-react';
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
  } from "@/components/ui/alert-dialog"

type TabsPanelProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTabItemClick: (id: string) => void;
};

function getFaviconUrl(url: string) {
    try {
        const urlObject = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=32`;
    } catch (error) {
        return '';
    }
}

export function TabsPanel({ isOpen, onOpenChange, onTabItemClick }: TabsPanelProps) {
  const { tabs, removeTab, clearAllTabs, activeTab } = useTabs();

  const handleItemClick = (id: string) => {
    onTabItemClick(id);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Açık Sekmeler</SheetTitle>
          <SheetDescription>
            Açık sekmelerinizi yönetin.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="py-4 pr-6">
              {tabs.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {tabs.map(item => {
                    const faviconUrl = getFaviconUrl(item.url);
                    return (
                        <div key={item.id} className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-accent ${activeTab === item.id ? 'bg-accent' : ''}`}>
                            <button
                                onClick={() => handleItemClick(item.id)}
                                className="flex-grow flex items-center gap-3 text-left"
                            >
                                {faviconUrl ? (
                                    <img src={faviconUrl} alt="favicon" className="h-5 w-5 flex-shrink-0" />
                                ) : (
                                    <Globe className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                )}
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-medium truncate text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                                </div>
                            </button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-100"
                                onClick={() => removeTab(item.id)}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Açık sekme yok.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        {tabs.length > 0 && (
           <SheetFooter>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Tüm Sekmeleri Kapat
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem tüm açık sekmeleri kapatacaktır. Bu eylem geri alınamaz.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllTabs}>Devam Et</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
           </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
