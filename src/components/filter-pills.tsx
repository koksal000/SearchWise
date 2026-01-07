'use client';

import { SearchType } from '@/lib/types';
import { Button } from './ui/button';
import { Image as ImageIcon, Video, Newspaper, Globe, FileVideo } from 'lucide-react';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

type FilterPillsProps = {
  activeFilter: SearchType;
  onFilterChange: (filter: SearchType) => void;
};

const filters: { id: SearchType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: SearchType.ALL, label: 'Tümü', icon: Globe },
  { id: SearchType.IMAGES, label: 'Görseller', icon: ImageIcon },
  { id: SearchType.VIDEOS, label: 'Videolar', icon: Video },
  { id: SearchType.NEWS, label: 'Haberler', icon: Newspaper },
  { id: SearchType.GIF, label: 'GIF\'ler', icon: FileVideo },
];

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="w-full border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max items-center gap-1 p-3 sm:justify-start">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className="h-7 rounded-full px-2"
            >
              <filter.icon className="mr-1.5 h-4 w-4" />
              {filter.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
