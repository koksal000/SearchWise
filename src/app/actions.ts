'use server';

import { canBeIframed } from '@/ai/flows/can-be-iframed';
import { extractScrapedResults, extractVideoData, extractFullResolutionImage } from '@/lib/scraping-service';
import { SearchResults, ImageSearchResults, VideoSearchResultItem, SearchResultItem, SearchType, ImageSearchResultItemImage } from '@/lib/types';

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.GOOGLE_CX_ID;
const API_URL = 'https://www.googleapis.com/customsearch/v1';

type SearchParams = {
  query: string;
  page: number;
  safe: 'active' | 'off';
}

async function fetchPageContentFromProxy(url: string): Promise<{ content: string } | { error: string }> {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36' },
        });

        if (!response.ok) {
             throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        const content = await response.text();
        return { content };

    } catch (e) {
        console.error("fetchPageContentFromProxy failed: ", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
        return { error: 'An unknown error occurred while fetching page content.' };
    }
}


async function fetchWithScraping(query: string, searchType: SearchType, safe: 'active' | 'off', page: number): Promise<SearchResults | ImageSearchResults | { error: string }> {
    console.log(`API quota likely exceeded or keys not provided. Falling back to scraping for ${searchType} search.`);
    
    const encodedQuery = encodeURIComponent(query);
    let url = '';

    const start = (page - 1) * 10;

    switch (searchType) {
        case 'images':
            if (safe === 'off') {
                // unsafe image search URL
                url = `https://www.google.com/search?q=${encodedQuery}&tbm=isch&safe=off&start=${start}`;
            } else {
                // safe image search URL
                url = `https://www.google.com/search?q=${encodedQuery}&tbm=isch&start=${start}`;
            }
            break;
        case 'news':
            url = `https://www.google.com/search?q=${encodedQuery}&tbm=nws&start=${start}`;
            break;
        case 'videos':
             url = `https://www.google.com/search?q=${encodedQuery}&tbm=vid&start=${start}`;
            break;
        case 'all':
        default:
            url = `https://www.google.com/search?q=${encodedQuery}&start=${start}`;
            break;
    }

    try {
        const pageContentResult = await fetchPageContentFromProxy(url);

        if ('error' in pageContentResult) {
            return { error: `Search API fallback failed: ${pageContentResult.error}` };
        }
        
        const htmlContent = pageContentResult.content;
        
        const scrapedResults = extractScrapedResults(htmlContent, searchType);

        if (!scrapedResults || scrapedResults.length === 0) {
            const errorMessage = "Scraping fallback couldn't find any results. This might be due to changes in Google's page structure or a bot block.";
            console.warn(errorMessage, "Query:", query, "URL:", url);
            return { error: errorMessage };
        }

        const searchInformation = {
             formattedTotalResults: `${scrapedResults.length}`,
             formattedSearchTime: `0.00`,
        }

        if (searchType === 'images') {
             const imageItems: ImageSearchResultItem[] = scrapedResults.map(item => ({
                title: item.title,
                link: item.link,
                displayLink: new URL(item.link).hostname,
                image: {
                    contextLink: item.link,
                    thumbnailLink: item.imageUrl || '',
                    width: 500, // Dummy data
                    height: 500, // Dummy data
                } as ImageSearchResultItemImage
             }));
             return { searchInformation, items: imageItems };
        }

        const items: SearchResultItem[] = scrapedResults.map(item => ({
            ...item,
            displayLink: new URL(item.link).hostname,
            pagemap: item.imageUrl ? { cse_thumbnail: [{ src: item.imageUrl }] } : {},
        }));

        return { searchInformation, items };

    } catch (scrapingError) {
        console.error('Scraping fallback failed:', scrapingError);
        const errorMessage = scrapingError instanceof Error ? scrapingError.message : 'An unknown scraping error occurred.';
        return { error: `Search API fallback failed: ${errorMessage}` };
    }
}


async function fetchFromApi(params: URLSearchParams, query: string, searchType: SearchType, safe: 'active' | 'off', page: number): Promise<any> {
  if (!API_KEY || !CX_ID) {
    console.log("API_KEY or CX_ID is missing. Falling back to scraping.");
    return fetchWithScraping(query, searchType, safe, page);
  }
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 429) {
        console.log("Google API quota exceeded. Falling back to scraping.");
        return fetchWithScraping(query, searchType, safe, page);
      }
      const errorData = await response.json();
      const message = errorData.error?.message || 'An error occurred with the Search API.';
      console.error('Google API Error:', message);
      // Don't fallback on every error, only on quota errors.
      // For other errors, it's better to show the message to the user.
      return { error: message };
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch API Error:', error);
    // Fallback to scraping on network-like errors
    return fetchWithScraping(query, searchType, safe, page);
  }
}

export async function search({ query, page, safe }: SearchParams): Promise<SearchResults | { error: string }> {
  const params = new URLSearchParams({
    key: API_KEY!,
    cx: CX_ID!,
    q: query,
    start: ((page - 1) * 10 + 1).toString(),
    safe,
    hl: 'en',
  });
  return fetchFromApi(params, query, 'all', safe, page);
}

export async function searchImages({ query, page, safe }: SearchParams): Promise<ImageSearchResults | { error: string }> {
  const params = new URLSearchParams({
    key: API_KEY!,
    cx: CX_ID!,
    q: query,
    start: ((page - 1) * 10 + 1).toString(),
    safe,
    hl: 'en',
    searchType: 'image',
  });
  return fetchFromApi(params, query, 'images', safe, page);
}

export async function searchNews({ query, page, safe }: SearchParams): Promise<SearchResults | { error: string }> {
    const params = new URLSearchParams({
      key: API_KEY!,
      cx: CX_ID!,
      q: query,
      start: ((page - 1) * 10 + 1).toString(),
      safe,
      hl: 'en',
      sort: 'date',
    });
    return fetchFromApi(params, query, 'news', safe, page);
}


export async function searchVideos({ query, page, safe }: SearchParams): Promise<{ items: VideoSearchResultItem[] } & Omit<SearchResults, 'items'> | { error:string }> {
  // Video scraping is more reliable, so we prioritize scraping for videos.
  const searchResult = await fetchWithScraping(`${query} video`, 'videos', safe, page);
  
  if ('error' in searchResult) {
    return searchResult;
  }
  
  if (!searchResult.items) {
    return { ...searchResult, items: [] };
  }

  const videoDataPromises = searchResult.items.map(async (item: SearchResultItem): Promise<VideoSearchResultItem> => {
    try {
      const pageContentResult = await fetchPageContentFromProxy(item.link);
      if ('error' in pageContentResult) {
        return item; // Return the item without extra data if page fetch fails
      }
      const htmlContent = pageContentResult.content;
      const extractedData = extractVideoData(htmlContent);
      
      return {
        ...item,
        videoUrl: extractedData.videoUrl,
        coverImageUrl: extractedData.coverImageUrl,
      };
    } catch (e) {
      console.error(`Failed to process URL ${item.link} for video data:`, e);
      return item; // Return original item on error
    }
  });

  const itemsWithVideoData = await Promise.all(videoDataPromises);

  return { ...searchResult, items: itemsWithVideoData };
}

export async function fetchPageContent(url: string, forceProxy: boolean = false): Promise<{content: string, viewMode: 'direct' | 'proxied'} | {error: string}> {
    try {
        if (!forceProxy) {
            const { canBeIframed: isIframable } = await canBeIframed({ url });
            if (isIframable) {
                return { content: '', viewMode: 'direct' }; 
            }
        }

        const pageContentResult = await fetchPageContentFromProxy(url);
        if ('error' in pageContentResult) {
            return { error: pageContentResult.error };
        }
        return { content: pageContentResult.content, viewMode: 'proxied' };

    } catch (error) {
        console.error('Fetch Page Content Error:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Unknown error fetching page content.' };
    }
}

export async function getFullResolutionImage(url: string): Promise<{ imageUrl: string } | { error: string }> {
    try {
        const pageContentResult = await fetchPageContentFromProxy(url);
        if ('error' in pageContentResult) {
            return { error: pageContentResult.error };
        }
        const imageUrl = extractFullResolutionImage(pageContentResult.content);
        if (!imageUrl) {
            return { error: "Couldn't find a full-resolution image on the page." };
        }
        return { imageUrl };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: message };
    }
}
