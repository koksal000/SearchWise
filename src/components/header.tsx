'use client';

import { Search, History, Settings, PanelsLeftRight, X, Mic, Camera, ChevronsUpDown } from 'lucide-react';
import { Logo } from './logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dispatch, SetStateAction, FormEvent, useState } from 'react';
import { useTabs } from '@/hooks/use-tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';

type HeaderProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSearch: (e: FormEvent) => void;
  onLogoClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  onTabsClick: () => void;
  onVoiceSearch: () => void;
  onImageSearch: () => void;
  isListening: boolean;
};

export function Header({ 
  query, 
  setQuery, 
  onSearch, 
  onLogoClick,
  onHistoryClick,
  onSettingsClick,
  onTabsClick,
  onVoiceSearch,
  onImageSearch,
  isListening,
}: HeaderProps) {
  const { tabs } = useTabs();
  const [isActionsOpen, setActionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b bg-background/80 px-4 pt-2 backdrop-blur-sm md:px-6">
       <div className='flex items-center gap-4'>
        <Logo onClick={onLogoClick} className="text-2xl hidden sm:flex" />
        <form className="flex-1" onSubmit={onSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isListening ? "Dinleniyor..." : "Ara..."}
              className="w-full rounded-full bg-card pl-10 pr-24 h-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isListening}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onVoiceSearch}>
                <Mic className={`h-4 w-4 ${isListening ? 'text-primary animate-pulse' : ''}`} />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onImageSearch}>
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-20 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        <Collapsible open={isActionsOpen} onOpenChange={setActionsOpen} className="hidden sm:block">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                    <ChevronsUpDown className="h-5 w-5" />
                    <span className="sr-only">Toggle Actions</span>
                </Button>
            </CollapsibleTrigger>
        </Collapsible>
      </div>

      <CollapsibleContent asChild className="hidden sm:block">
        <div className="flex items-center justify-center gap-2 py-2">
            <Button variant="ghost" size="sm" onClick={onHistoryClick}>
                <History className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Geçmiş</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onTabsClick} className="relative">
                <PanelsLeftRight className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Sekmeler</span>
                {tabs.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {tabs.length}
                </span>
                )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onSettingsClick}>
                <Settings className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Ayarlar</span>
            </Button>
        </div>
      </CollapsibleContent>
      
      {/* Mobile only buttons */}
      <div className="sm:hidden flex items-center justify-center gap-2 py-2">
        <Button variant="ghost" size="sm" onClick={onHistoryClick}>
            <History className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onTabsClick} className="relative">
            <PanelsLeftRight className="h-5 w-5" />
            {tabs.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {tabs.length}
            </span>
            )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            <Settings className="h-5 w-5" />
        </Button>
      </div>

    </header>
  );
}
