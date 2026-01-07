'use client';

import { VideoSearchResultItem } from "@/lib/types";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Video as VideoIcon } from "lucide-react";
import { Badge } from "../ui/badge";

type VideoResultProps = {
  item: VideoSearchResultItem;
  onVideoResultClick: (item: VideoSearchResultItem) => void;
};

function isValidHttpUrl(string: string | undefined) {
  if (!string) return false;
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Function to format ISO 8601 duration to MM:SS
function formatDuration(isoDuration?: string): string | null {
    if (!isoDuration) return null;
  
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
    if (!match) return null;
  
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
  
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
    const fmtHours = Math.floor(totalSeconds / 3600);
    const fmtMinutes = Math.floor((totalSeconds % 3600) / 60);
    const fmtSeconds = totalSeconds % 60;
  
    const paddedSeconds = fmtSeconds.toString().padStart(2, '0');
    
    if (fmtHours > 0) {
      const paddedMinutes = fmtMinutes.toString().padStart(2, '0');
      return `${fmtHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
      return `${fmtMinutes}:${paddedSeconds}`;
    }
}

export function VideoResult({ item, onVideoResultClick }: VideoResultProps) {
  let imageUrl = item.coverImageUrl || item.pagemap?.cse_thumbnail?.[0]?.src;
  
  if (imageUrl && !isValidHttpUrl(imageUrl)) {
    imageUrl = undefined;
  }
  
  const duration = formatDuration(item.duration);

  return (
    <div className="w-full">
      <button onClick={() => onVideoResultClick(item)} className="group w-full text-left">
        <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
            <CardContent className="p-0">
              <div className="aspect-video relative w-full bg-muted flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {duration && (
                        <Badge variant="secondary" className="absolute bottom-2 right-2">{duration}</Badge>
                    )}
                  </>
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
      </button>
    </div>
  );
}
