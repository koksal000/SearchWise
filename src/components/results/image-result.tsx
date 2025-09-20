'use client';

import { ImageSearchResultItem } from "@/lib/types";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

type ImageResultsGridProps = {
  items: ImageSearchResultItem[];
  onResultClick: (url: string, title: string) => void;
};

export function ImageResultsGrid({ items, onResultClick }: ImageResultsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.image.contextLink}
          onClick={(e) => {
            e.preventDefault();
            onResultClick(item.image.contextLink, item.title);
          }}
          className="group block"
        >
          <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            <CardContent className="p-0">
              <div className="aspect-square relative w-full">
                <Image
                  src={item.image.thumbnailLink}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate group-hover:text-primary">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate">{item.displayLink}</p>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
