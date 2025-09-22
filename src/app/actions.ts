'use server';

import { canBeIframed } from '@/ai/flows/can-be-iframed';
import { extractScrapedResults, extractVideoData } from '@/lib/scraping-service';
import { SearchResults, ImageSearchResults, VideoSearchResultItem, SearchResultItem, SearchType, ImageSearchResultItemImage } from '@/lib/types';
import { fetchPageContentFlow } from '@/ai/flows/fetch-page-content-flow';

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.GOOGLE_CX_ID;
const API_URL = 'https://www.googleapis.com/customsearch/v1';

type SearchParams = {
  query: string;
  page: number;
  safe: 'active' | 'off';
}

async function fetchWithScraping(query: string, searchType: SearchType): Promise<SearchResults | ImageSearchResults | { error: string }> {
    console.log(`API quota likely exceeded or keys not provided. Falling back to scraping for ${searchType} search.`);
    let url = '';
    const encodedQuery = encodeURIComponent(query);
    
    // Construct Google search URL based on search type
    switch (searchType) {
        case 'images':
            url = `https://www.google.com/search?q=${encodedQuery}&udm=2`;
            break;
        case 'news':
            url = `https://www.google.com/search?q=${encodedQuery}&tbm=nws`;
            break;
        case 'videos':
             url = `https://www.google.com/search?q=${encodedQuery}&tbm=vid`;
            break;
        case 'all':
        default:
            url = `https://www.google.com/search?q=${encodedQuery}`;
            break;
    }

    try {
        const pageContentResult = await fetchPageContentFlow({ url });
        const htmlContent = pageContentResult.content;
        
        const scrapedResults = extractScrapedResults(htmlContent, searchType);

        if (!scrapedResults || scrapedResults.length === 0) {
            return { searchInformation: { formattedTotalResults: '0', formattedSearchTime: '0.00' }, items: [] };
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


async function fetchFromApi(params: URLSearchParams, query: string, searchType: SearchType): Promise<any> {
  if (!API_KEY || !CX_ID) {
    console.log("API_KEY or CX_ID is missing. Falling back to scraping.");
    return fetchWithScraping(query, searchType);
  }
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 429) {
        return fetchWithScraping(query, searchType);
      }
      const errorData = await response.json();
      const message = errorData.error?.message || 'An error occurred with the Search API.';
      console.error('Google API Error:', message);
      return { error: message };
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch API Error:', error);
    return fetchWithScraping(query, searchType);
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
  return fetchFromApi(params, query, 'all');
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
  return fetchFromApi(params, query, 'images');
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
    return fetchFromApi(params, query, 'news');
}


export async function searchVideos({ query, page, safe }: SearchParams): Promise<{ items: VideoSearchResultItem[] } & Omit<SearchResults, 'items'> | { error: string }> {
  const searchResult = await search({ query: `${query} video`, page, safe });
  
  if ('error' in searchResult) {
    return searchResult;
  }
  
  if (!searchResult.items) {
    return { ...searchResult, items: [] };
  }

  const videoDataPromises = searchResult.items.map(async (item: SearchResultItem): Promise<VideoSearchResultItem> => {
    try {
      const response = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' }});
      if (!response.ok) {
        return item;
      }
      const htmlContent = await response.text();
      const extractedData = extractVideoData(htmlContent);
      
      return {
        ...item,
        videoUrl: extractedData.videoUrl,
        coverImageUrl: extractedData.coverImageUrl,
      };
    } catch (e) {
      console.error(`Failed to process URL ${item.link}:`, e);
      return item;
    }
  });

  const itemsWithVideoData = await Promise.all(videoDataPromises);

  return { ...searchResult, items: itemsWithVideoData };
}

export async function fetchPageContent(url: string): Promise<{content: string} | {error: string}> {
    try {
        const { canBeIframed: isIframable } = await canBeIframed({ url });
        if (isIframable) {
            return { content: '' }; // Let the iframe handle it directly
        }

        const pageContentResult = await fetchPageContentFlow({ url });
        return { content: pageContentResult.content };
    } catch (error) {
        console.error('Fetch Page Content Error:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'Unknown error fetching page content.' };
    }
}
