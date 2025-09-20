'use client';

import { SearchResultItem } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type NewsResultProps = {
  item: SearchResultItem;
  onResultClick: (url: string, title: string) => void;
};

function getTimeAgo(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export function NewsResult({ item, onResultClick }: NewsResultProps) {
  const imageUrl = item.pagemap?.cse_thumbnail?.[0]?.src;
  const publicationDate = item.pagemap?.metatags?.[0]?.['article:published_time'];

  return (
    <a
      href={item.link}
      onClick={(e) => {
        e.preventDefault();
        onResultClick(item.link, item.title);
      }}
      className="group block"
    >
      <Card className="flex flex-col md:flex-row overflow-hidden transition-all duration-300 group-hover:shadow-xl">
        {imageUrl && (
          <div className="md:w-1/3 w-full h-48 md:h-auto relative flex-shrink-0">
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col p-4">
            <span className="text-sm text-muted-foreground">{item.displayLink}</span>
            <h3 className="text-lg font-medium text-primary group-hover:underline mt-1">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 flex-grow" dangerouslySetInnerHTML={{ __html: item.snippet }}/>
            {publicationDate && (
                <p className="text-xs text-muted-foreground/80 mt-2">{getTimeAgo(publicationDate)}</p>
            )}
        </div>
      </Card>
    </a>
  );
}
