'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useHistory } from '@/hooks/use-history';
import { useTabs } from '@/hooks/use-tabs';
import { SearchResultItem, SearchType, ImageSearchResultItem, VideoSearchResultItem } from '@/lib/types';
import { search, searchImages, searchVideos, searchNews } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Header } from './header';
import { SearchHome } from './search-home';
import { FilterPills } from './filter-pills';
import { SearchResults } from './search-results';
import { Pagination } from './pagination';
import { HistoryPanel } from './panels/history-panel';
import { SettingsPanel } from './panels/settings-panel';
import { TabsPanel } from './panels/tabs-panel';
import { WebViewer } from './web-viewer';

type View = 'home' | 'results';

export function SearchApp() {
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<(SearchResultItem | ImageSearchResultItem | VideoSearchResultItem)[] | null>(null);
  const [searchInfo, setSearchInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<SearchType>('all');
  
  const [isHistoryPanelOpen, setHistoryPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [isTabsPanelOpen, setTabsPanelOpen] = useState(false);
  
  const { settings } = useSettings();
  const { addToHistory } = useHistory();
  const { tabs, activeTab, addTab, setActiveTab, getTabById } = useTabs();
  const { toast } = useToast();

  const currentTab = getTabById(activeTab || '');

  const handleSearch = async (searchQuery: string, page: number = 1, filter: SearchType = 'all') => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setView('results');
    setResults(null);
    setSearchInfo('');
    setCurrentPage(page);
    setActiveFilter(filter);
    setActiveQuery(searchQuery);
    
    if (settings.saveHistory) {
      addToHistory(searchQuery);
    }

    try {
      let response;
      const safe = settings.safeSearch ? 'active' : 'off';
      
      switch (filter) {
        case 'images':
          response = await searchImages({ query: searchQuery, page, safe });
          break;
        case 'videos':
          response = await searchVideos({ query: searchQuery, page, safe });
          break;
        case 'news':
          response = await searchNews({ query: searchQuery, page, safe });
          break;
        case 'all':
        default:
          response = await search({ query: searchQuery, page, safe });
          break;
      }

      if (response.error) {
        throw new Error(response.error);
      }
      
      setResults(response.items || []);
      if (response.searchInformation) {
        setSearchInfo(`About ${response.searchInformation.formattedTotalResults} results (${response.searchInformation.formattedSearchTime} seconds)`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(query, 1, activeFilter);
  };
  
  const handlePageChange = (newPage: number) => {
    handleSearch(activeQuery, newPage, activeFilter);
    window.scrollTo(0, 0);
  };
  
  const handleFilterChange = (newFilter: SearchType) => {
    setQuery(activeQuery);
    handleSearch(activeQuery, 1, newFilter);
  };

  const handleHistoryItemClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery, 1, 'all');
  };
  
  const handleResultClick = (url: string, title: string) => {
    if (settings.inAppWebView) {
      addTab(url, title);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleTabItemClick = (id: string) => {
    setActiveTab(id);
  };

  const closeWebViewer = () => {
    setActiveTab(null);
  };

  const goHome = () => {
    setView('home');
    setQuery('');
    setActiveQuery('');
    setResults(null);
  }

  return (
    <div className="min-h-screen">
      {view === 'home' ? (
        <SearchHome query={query} setQuery={setQuery} onSearch={submitSearch} />
      ) : (
        <>
          <Header
            query={query}
            setQuery={setQuery}
            onSearch={submitSearch}
            onLogoClick={goHome}
            onHistoryClick={() => setHistoryPanelOpen(true)}
            onSettingsClick={() => setSettingsPanelOpen(true)}
            onTabsClick={() => setTabsPanelOpen(true)}
          />
          <main>
            <FilterPills activeFilter={activeFilter} onFilterChange={handleFilterChange} />
            <SearchResults
              query={activeQuery}
              results={results}
              searchInfo={searchInfo}
              isLoading={isLoading}
              searchType={activeFilter}
              onResultClick={handleResultClick}
            />
            {results && results.length > 0 && !isLoading && (
              <Pagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                hasNextPage={results.length >= 10}
              />
            )}
          </main>
        </>
      )}

      {currentTab && <WebViewer tab={currentTab} onClose={closeWebViewer} />}

      <HistoryPanel 
        isOpen={isHistoryPanelOpen} 
        onOpenChange={setHistoryPanelOpen}
        onHistoryItemClick={handleHistoryItemClick}
      />
      <SettingsPanel 
        isOpen={isSettingsPanelOpen} 
        onOpenChange={setSettingsPanelOpen}
      />
      <TabsPanel
        isOpen={isTabsPanelOpen}
        onOpenChange={setTabsPanelOpen}
        onTabItemClick={handleTabItemClick}
      />
    </div>
  );
}
