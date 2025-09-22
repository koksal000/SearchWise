'use client';

import { SearchType } from '@/lib/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Video, Newspaper, Globe } from 'lucide-react';

type FilterPillsProps = {
  activeFilter: SearchType;
  onFilterChange: (filter: SearchType) => void;
};

const filters: { id: SearchType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Tümü', icon: Globe },
  { id: 'images', label: 'Görseller', icon: ImageIcon },
  { id: 'videos', label: 'Videolar', icon: Video },
  { id: 'news', label: 'Haberler', icon: Newspaper },
];

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex w-full items-center justify-center gap-2 border-b p-4 sm:justify-start">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className="rounded-full"
        >
          <filter.icon className="mr-2 h-4 w-4" />
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
