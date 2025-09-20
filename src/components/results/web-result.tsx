'use client';

import { SearchResultItem } from "@/lib/types";
import { Globe } from "lucide-react";

type WebResultProps = {
  item: SearchResultItem;
  onResultClick: (url: string, title: string) => void;
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        {faviconUrl ? (
            <img src={faviconUrl} alt="favicon" className="h-6 w-6 rounded-full object-contain" />
        ) : (
            <Globe className="h-6 w-6 text-muted-foreground" />
        )}
        <div className="flex flex-col">
            <span className="text-sm text-foreground truncate">{new URL(item.link).hostname}</span>
            <span className="text-xs text-muted-foreground truncate">{item.displayLink}</span>
        </div>
      </div>
      <a
        href={item.link}
        onClick={(e) => {
          e.preventDefault();
          onResultClick(item.link, item.title);
        }}
        className="group"
      >
        <h3 className="text-lg font-medium text-primary group-hover:underline truncate">
          {item.title}
        </h3>
      </a>
      <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: item.snippet }} />
    </div>
  );
}
