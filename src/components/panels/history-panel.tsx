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
import { useHistory } from '@/hooks/use-history';
import { Trash2 } from 'lucide-react';

type HistoryPanelProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onHistoryItemClick: (query: string) => void;
};

function getTimeAgo(timestamp: number): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}


export function HistoryPanel({ isOpen, onOpenChange, onHistoryItemClick }: HistoryPanelProps) {
  const { history, clearHistory } = useHistory();

  const handleItemClick = (query: string) => {
    onHistoryItemClick(query);
    onOpenChange(false);
  };
  
  const handleClearHistory = () => {
    if(confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Search History</SheetTitle>
          <SheetDescription>
            Your recent searches.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <div className="py-4 pr-6">
              {history.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.query)}
                      className="w-full text-left p-3 rounded-lg hover:bg-accent"
                    >
                      <p className="font-medium truncate">{item.query}</p>
                      <p className="text-xs text-muted-foreground">{getTimeAgo(item.timestamp)}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>No history yet.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        {history.length > 0 && (
           <SheetFooter>
            <Button variant="outline" className="w-full" onClick={handleClearHistory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
            </Button>
           </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
