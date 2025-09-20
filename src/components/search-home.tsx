'use client';

import { Search, Mic, Camera } from 'lucide-react';
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
};

export function SearchHome({ query, setQuery, onSearch, onVoiceSearch, onImageSearch, isListening }: SearchHomeProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8" style={{ marginTop: '-15vh' }}>
        <Logo className="text-7xl md:text-8xl" />
        <form className="w-full max-w-xl" onSubmit={onSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isListening ? "Listening..." : "Search the web with Wise"}
              className="w-full rounded-full bg-card py-6 pl-12 pr-40 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isListening}
            />
            <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onVoiceSearch}>
                <Mic className={`h-5 w-5 ${isListening ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onImageSearch}>
                <Camera className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button type="submit" size="lg" className="rounded-full">
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
