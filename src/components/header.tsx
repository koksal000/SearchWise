'use client';

import { Search, History, Settings, PanelsLeftRight, X } from 'lucide-react';
import { Logo } from './logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dispatch, SetStateAction, FormEvent } from 'react';
import { useTabs } from '@/hooks/use-tabs';

type HeaderProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSearch: (e: FormEvent) => void;
  onLogoClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  onTabsClick: () => void;
};

export function Header({ 
  query, 
  setQuery, 
  onSearch, 
  onLogoClick,
  onHistoryClick,
  onSettingsClick,
  onTabsClick,
}: HeaderProps) {
  const { tabs } = useTabs();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Logo onClick={onLogoClick} className="text-2xl hidden sm:flex" />
      <form className="flex-1" onSubmit={onSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full bg-card pl-10 h-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onHistoryClick}>
          <History className="h-5 w-5" />
          <span className="sr-only">History</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onTabsClick} className="relative">
          <PanelsLeftRight className="h-5 w-5" />
          <span className="sr-only">Tabs</span>
          {tabs.length > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {tabs.length}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
}
