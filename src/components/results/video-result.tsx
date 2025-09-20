'use client';

import { VideoSearchResultItem } from "@/lib/types";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Video as VideoIcon } from "lucide-react";

type VideoResultProps = {
  item: VideoSearchResultItem;
  onResultClick: (url: string, title: string) => void;
};

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function VideoResult({ item, onResultClick }: VideoResultProps) {
  let imageUrl = item.coverImageUrl || item.pagemap?.cse_thumbnail?.[0]?.src;
  
  if (imageUrl && !isValidHttpUrl(imageUrl)) {
    imageUrl = undefined;
  }

  // A direct link to an MP4 or similar is a video, otherwise it's a webpage with a video.
  const isDirectVideoLink = item.videoUrl?.match(/\.(mp4|webm|ogg)$/);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const urlToOpen = isDirectVideoLink ? item.videoUrl! : item.link;
    onResultClick(urlToOpen, item.title);
  };

  return (
    <div className="w-full">
      <a href={item.link} onClick={handleClick} className="group">
        <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            <CardContent className="p-0">
              <div className="aspect-video relative w-full bg-muted flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <VideoIcon className="h-16 w-16 text-muted-foreground/50" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-foreground group-hover:text-primary truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{item.displayLink}</p>
              </div>
            </CardContent>
        </Card>
      </a>
    </div>
  );
}
