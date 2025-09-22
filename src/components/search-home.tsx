'use client';

import { Search, Mic, Camera, History, Settings, PanelsLeftRight } from 'lucide-react';
import { Logo } from './logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dispatch, SetStateAction, FormEvent } from 'react';

type SearchHomeProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSearch: (e: FormEvent) => void;
  onVoiceSearch: () => void;
  onImageSearch: () => void;
  isListening: boolean;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  onTabsClick: () => void;
};

export function SearchHome({ 
  query, 
  setQuery, 
  onSearch, 
  onVoiceSearch, 
  onImageSearch, 
  isListening,
  onHistoryClick,
  onSettingsClick,
  onTabsClick
}: SearchHomeProps) {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onHistoryClick}>
                <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onTabsClick}>
                <PanelsLeftRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
                <Settings className="h-5 w-5" />
            </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6" style={{ marginTop: '-15vh' }}>
          <Logo className="text-6xl md:text-7xl" />
          <form className="w-full max-w-xl" onSubmit={onSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={isListening ? "Dinleniyor..." : "Wise ile internette arama yap"}
                className="w-full rounded-full bg-card py-6 pl-12 pr-44 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isListening}
              />
              <div className="absolute right-28 top-1/2 -translate-y-1/2 flex items-center gap-0">
                <Button type="button" variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={onVoiceSearch}>
                  <Mic className={`h-5 w-5 ${isListening ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={onImageSearch}>
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button type="submit" size="lg" className="rounded-full h-10">
                  Ara
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
