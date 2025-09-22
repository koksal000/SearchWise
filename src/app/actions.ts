'use server';

import { extractVideoData } from '@/ai/flows/extract-video-data-from-search-results';
import { scrapeGoogleSearchResults } from '@/ai/flows/scrape-google-search-results';
import { SearchResults, ImageSearchResults, VideoSearchResultItem, SearchResultItem, SearchType } from '@/lib/types';
import { nanoid } from 'nanoid';

const API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.GOOGLE_CX_ID;
const API_URL = 'https://www.googleapis.com/customsearch/v1';

type SearchParams = {
  query: string;
  page: number;
  safe: 'active' | 'off';
}

async function fetchWithScraping(query: string, searchType: SearchType): Promise<SearchResults | { error: string }> {
    console.log(`API quota likely exceeded. Falling back to scraping for ${searchType} search.`);
    let url = '';
    switch (searchType) {
        case 'images':
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=2`;
            break;
        case 'news':
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`;
            break;
        case 'all':
        case 'videos': // Videos will also use general search scraping
        default:
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
    }

    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }});
        if (!response.ok) {
            throw new Error(`Failed to fetch Google search page. Status: ${response.status}`);
        }
        const htmlContent = await response.text();
        
        const scrapedResults = await scrapeGoogleSearchResults({ htmlContent, searchType, query });

        // Transform scraped results into the format expected by the frontend
        const items = scrapedResults.results.map(r => ({
            ...r,
            displayLink: r.link ? new URL(r.link).hostname : '',
            // Add dummy pagemap if needed for other result types to not crash
            pagemap: r.imageUrl ? { cse_thumbnail: [{ src: r.imageUrl }] } : {},
        }));

        const searchInformation = {
             formattedTotalResults: `${items.length}`,
             formattedSearchTime: `0.00`,
        }

        if (searchType === 'images') {
             const imageItems = items.map(item => ({
                title: item.title,
                link: item.link,
                displayLink: item.displayLink,
                image: {
                    contextLink: item.link,
                    thumbnailLink: item.imageUrl || '',
                    width: 500, // dummy data
                    height: 500, // dummy data
                }
             }));
             return { searchInformation, items: imageItems as any };
        }

        return { searchInformation, items: items as SearchResultItem[] };

    } catch (scrapingError) {
        console.error('Scraping fallback failed:', scrapingError);
        return { error: 'Arama API kotası aşıldı ve yedek arama mekanizması başarısız oldu.' };
    }
}


async function fetchFromApi(params: URLSearchParams, query: string, searchType: SearchType): Promise<any> {
  if (!API_KEY || !CX_ID) {
    return fetchWithScraping(query, searchType);
  }
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google API Error:', errorData.error);
      if (errorData.error.code === 429) {
        // Quota exceeded, fall back to scraping
        return fetchWithScraping(query, searchType);
      }
      throw new Error(errorData.error?.message || 'An error occurred with the search API.');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch API Error:', error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown error occurred while fetching search results.' };
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
      const response = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }});
      if (!response.ok) {
        return item; // Return original item if fetch fails
      }
      const htmlContent = await response.text();

      // Use the GenAI flow to extract video data
      const extractedData = await extractVideoData({
        htmlContent,
        url: item.link,
      });
      
      return {
        ...item,
        videoUrl: extractedData.videoUrl,
        coverImageUrl: extractedData.coverImageUrl,
      };
    } catch (e) {
      console.error(`Failed to process URL ${item.link}:`, e);
      return item; // Return original item on error
    }
  });

  const itemsWithVideoData = await Promise.all(videoDataPromises);

  return { ...searchResult, items: itemsWithVideoData };
}

export async function fetchPageContent(url: string): Promise<{content: string} | {error: string}> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            return { error: `Failed to fetch page. Status: ${response.status}` };
        }
        const content = await response.text();
        return { content };
    } catch (error) {
        console.error('Fetch Page Content Error:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unknown error occurred while fetching page content.' };
    }
}
