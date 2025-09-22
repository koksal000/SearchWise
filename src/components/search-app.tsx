'use client';

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useHistory } from '@/hooks/use-history';
import { useTabs } from '@/hooks/use-tabs';
import { SearchResultItem, SearchType, ImageSearchResultItem, VideoSearchResultItem } from '@/lib/types';
import { search, searchImages, searchVideos, searchNews, filterInAppFriendlyResults } from '@/app/actions';
import { getImageSearchTerms } from '@/ai/flows/get-image-search-terms';
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
import { ImageSearchDialog } from './image-search-dialog';

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
  const [isImageSearchDialogOpen, setImageSearchDialogOpen] = useState(false);
  
  const { settings } = useSettings();
  const { addToHistory } = useHistory();
  const { activeTab, addTab, setActiveTab, getTabById } = useTabs();
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSearch = useCallback(async (searchQuery: string, page: number = 1, filter: SearchType = 'all') => {
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
      const shouldFilter = settings.inAppWebView && settings.filterInAppFriendly;
      
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

      if (response && 'error' in response) {
        if (response.error === 'API_QUOTA_EXCEEDED') {
            toast({
                variant: "destructive",
                title: "Daily Quota Reached",
                description: "The daily search quota has been reached. Please add your own API key in an environment variable to continue.",
            });
            setResults([]);
            setIsLoading(false);
            return;
        }
        throw new Error(response.error);
      }
      
      let items = response.items || [];

      if (shouldFilter && items.length > 0) {
        toast({ title: 'Filtering Results', description: 'Finding sites that work best in the app...' });
        items = await filterInAppFriendlyResults(items);
      }

      setResults(items);
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
  }, [settings.saveHistory, settings.safeSearch, settings.inAppWebView, settings.filterInAppFriendly, addToHistory, toast]);


  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = event.error;
        if (event.error === 'network') {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        toast({ variant: "destructive", title: "Voice Search Error", description: errorMessage });
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript, 1, activeFilter);
      };
      recognitionRef.current = recognition;
    }
  }, [activeFilter, toast, handleSearch]);

  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    } else if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    } else {
        toast({ variant: "destructive", title: "Not Supported", description: "Voice search is not supported in your browser." });
    }
  };

  const handleImageSearch = () => {
    setImageSearchDialogOpen(true);
  };
  
  const handleImageSearchSubmit = async (file: File) => {
    setIsLoading(true);
    setImageSearchDialogOpen(false);
    toast({ title: 'Analyzing Image...', description: 'Please wait while we generate search terms.' });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        const result = await getImageSearchTerms({ photoDataUri });
        
        if (result.terms && result.terms.length > 0) {
            const firstTerm = result.terms[0];
            setQuery(firstTerm);
            await handleSearch(firstTerm, 1, 'all');
        } else {
             toast({ variant: "destructive", title: 'Analysis Failed', description: 'Could not generate search terms from the image.' });
        }
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Image search error:', error);
      toast({
        variant: "destructive",
        title: "Image Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setIsLoading(false);
    }
  };

  const currentTab = getTabById(activeTab || '');

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
      window.open(url, '_blank', 'noopener,noreferrer');
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
    <div className="min-h-screen bg-background">
      {view === 'home' ? (
        <SearchHome 
          query={query} 
          setQuery={setQuery} 
          onSearch={submitSearch}
          onVoiceSearch={handleVoiceSearch}
          onImageSearch={handleImageSearch}
          isListening={isListening}
        />
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
            onVoiceSearch={handleVoiceSearch}
            onImageSearch={handleImageSearch}
            isListening={isListening}
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

      <ImageSearchDialog
        isOpen={isImageSearchDialogOpen}
        onOpenChange={setImageSearchDialogOpen}
        onSearch={handleImageSearchSubmit}
      />
      
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
