'use client';

import { SearchResultItem } from "@/lib/types";
import { Globe, PlayCircle } from "lucide-react";

type WebResultProps = {
  item: SearchResultItem;
  onResultClick: (e: React.MouseEvent<HTMLAnchorElement>, item: SearchResultItem) => void;
};

function getFaviconUrl(url: string) {
    try {
        const urlObject = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=32`;
    } catch (error) {
        return '';
    }
}

export function WebResult({ item, onResultClick }: WebResultProps) {
    const faviconUrl = getFaviconUrl(item.link);
    const isVideo = !!item.pagemap?.videoobject?.length;

  return (
    <div className="max-w-2xl">
      <a
        href={item.link}
        onClick={(e) => onResultClick(e, item)}
        className="group"
      >
        <div className="flex items-center gap-2 mb-1">
            {faviconUrl ? (
                <img src={faviconUrl} alt="favicon" className="h-6 w-6 rounded-full object-contain" />
            ) : (
                <Globe className="h-6 w-6 text-muted-foreground" />
            )}
            <div className="flex flex-col">
                <span className="text-sm text-foreground truncate group-hover:underline">{new URL(item.link).hostname}</span>
                <span className="text-xs text-muted-foreground truncate">{item.displayLink}</span>
            </div>
        </div>
        <h3 className="text-lg font-medium text-primary group-hover:underline flex items-center gap-2">
          {isVideo && <PlayCircle className="h-5 w-5 text-primary/80 flex-shrink-0" />}
          {item.title}
        </h3>
      </a>
      <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: item.snippet }} />
    </div>
  );
}
