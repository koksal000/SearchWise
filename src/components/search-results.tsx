'use client';

import { SearchResultItem, SearchType, ImageSearchResultItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { WebResult } from './results/web-result';
import { ImageResultsGrid } from './results/image-result';
import { NewsResult } from './results/news-result';

type SearchResultsProps = {
  query: string;
  results: (SearchResultItem | ImageSearchResultItem)[] | null;
  searchInfo: string;
  isLoading: boolean;
  searchType: SearchType;
  onResultClick: (e: React.MouseEvent<HTMLAnchorElement>, item: SearchResultItem) => void;
  onImageResultClick: (item: ImageSearchResultItem) => void;
};

export function SearchResults({ 
  query,
  results, 
  searchInfo, 
  isLoading, 
  searchType,
  onResultClick,
  onImageResultClick,
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
      case SearchType.IMAGES:
      case SearchType.GIF:
        return <ImageResultsGrid items={results as ImageSearchResultItem[]} onImageResultClick={onImageResultClick} />;
      case SearchType.NEWS:
        return (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {(results as SearchResultItem[]).map((item, index) => (
              <NewsResult key={index} item={item} onResultClick={onResultClick} />
            ))}
          </div>
        );
      case SearchType.VIDEOS:
      case SearchType.ALL:
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
