'use client';

import { SearchResultItem, SearchType, ImageSearchResultItem, VideoSearchResultItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { WebResult } from './results/web-result';
import { ImageResultsGrid } from './results/image-result';
import { VideoResult } from './results/video-result';
import { NewsResult } from './results/news-result';

type SearchResultsProps = {
  query: string;
  results: (SearchResultItem | ImageSearchResultItem | VideoSearchResultItem)[] | null;
  searchInfo: string;
  isLoading: boolean;
  searchType: SearchType;
  onResultClick: (url: string, title: string) => void;
};

export function SearchResults({ 
  query,
  results, 
  searchInfo, 
  isLoading, 
  searchType,
  onResultClick
}: SearchResultsProps) {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">"{query}" için aranıyor...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold">"{query}" için sonuç bulunamadı</h3>
        <p className="text-muted-foreground mt-2">Farklı bir arama terimi deneyin veya yazımınızı kontrol edin.</p>
      </div>
    );
  }

  const renderResults = () => {
    switch (searchType) {
      case 'images':
        return <ImageResultsGrid items={results as ImageSearchResultItem[]} onResultClick={onResultClick} />;
      case 'videos':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(results as VideoSearchResultItem[]).map((item, index) => (
              <VideoResult key={index} item={item} onResultClick={onResultClick} />
            ))}
          </div>
        );
      case 'news':
        return (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {(results as SearchResultItem[]).map((item, index) => (
              <NewsResult key={index} item={item} onResultClick={onResultClick} />
            ))}
          </div>
        );
      case 'all':
      default:
        return (
          <div className="flex flex-col gap-8">
            {(results as SearchResultItem[]).map((item, index) => (
              <WebResult key={index} item={item} onResultClick={onResultClick} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-6">
      <p className="text-sm text-muted-foreground mb-6">{searchInfo}</p>
      {renderResults()}
    </div>
  );
}
