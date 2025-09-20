'use client';

import { Search } from 'lucide-react';
import { Logo } from './logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dispatch, SetStateAction, FormEvent } from 'react';

type SearchHomeProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSearch: (e: FormEvent) => void;
};

export function SearchHome({ query, setQuery, onSearch }: SearchHomeProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8" style={{ marginTop: '-15vh' }}>
        <Logo className="text-7xl md:text-8xl" />
        <form className="w-full max-w-xl" onSubmit={onSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search the web with Wise"
              className="w-full rounded-full bg-card py-6 pl-12 pr-24 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
