import { ScrapedResult, SearchType } from './types';
import { parse, HTMLElement } from 'node-html-parser';


export function extractScrapedResults(htmlContent: string, searchType: SearchType): ScrapedResult[] {
    const root = parse(htmlContent);

    if (searchType === SearchType.IMAGES) {
        const imageResults: ScrapedResult[] = [];
        const imageElements = root.querySelectorAll('div[data-ri]');
        
        for (const el of imageElements) {
            const linkEl = el.querySelector('a');
            if (!linkEl) continue;

            const pageLink = linkEl.getAttribute('href');
            if (!pageLink) continue;
            
            const imgEl = el.querySelector('img');
            const imageUrl = imgEl?.getAttribute('data-src') || imgEl?.getAttribute('src');
            if (!imageUrl) continue;

            const title = imgEl.getAttribute('alt') || 'Görsel Sonucu';
            
            const snippetEl = linkEl.nextElementSibling;
            const snippet = snippetEl?.innerText || new URL(`https://google.com${pageLink}`).hostname;

            imageResults.push({ title, link: `https://google.com${pageLink}`, snippet, imageUrl });
        }
        return imageResults;
    }

    if (searchType === SearchType.NEWS) {
        const newsResults: ScrapedResult[] = [];
        const newsElements = root.querySelectorAll('div.SoaBEf');

        for (const el of newsElements) {
            const linkEl = el.querySelector('a');
            const link = linkEl?.getAttribute('href');
            const titleEl = el.querySelector('div[role="heading"]');
            const title = titleEl?.innerText;
            const snippetEl = el.querySelector('div.GI74Re');
            const snippet = snippetEl?.innerText;
            const imageEl = el.querySelector('img');
            const imageUrl = imageEl?.getAttribute('src');

            if (link && title && snippet) {
                 newsResults.push({ title, link, snippet, imageUrl });
            }
        }
        return newsResults;
    }

    // --- GENERAL WEB SEARCH ---
    const webResults: ScrapedResult[] = [];
    // The general container for each search result is now often just 'div.g'
    const resultElements = root.querySelectorAll('div.g');

    for (const el of resultElements) {
        // Find the anchor tag which contains the link and title
        const linkEl = el.querySelector('a');
        if (!linkEl) continue;

        const link = linkEl.getAttribute('href');
        const titleEl = linkEl.querySelector('h3');
        const title = titleEl?.innerText;

        // The snippet is often in a div with a specific class structure
        const snippetEl = el.querySelector('.VwiC3b');
        const snippet = snippetEl?.innerText;

        if (link && title && snippet && !link.startsWith('/search') && !link.startsWith('#')) {
            // Find a potential thumbnail within the result block
            const imageEl = el.querySelector('img');
            const imageUrl = imageEl?.getAttribute('src');
            webResults.push({ title, link, snippet, imageUrl });
        }
    }
    
    return webResults;
}

export function extractVideoData(htmlContent: string): { videoUrl?: string; coverImageUrl?: string } {
    const root = parse(htmlContent);

    // Prioritize meta tags as they are more reliable
    const ogVideo = root.querySelector('meta[property="og:video"]');
    if (ogVideo) {
         return {
            videoUrl: ogVideo.getAttribute('content'),
            coverImageUrl: root.querySelector('meta[property="og:image"]')?.getAttribute('content')
        };
    }
    
    // Try to find a <video> tag with a src attribute
    const videoTag = root.querySelector('video[src]');
    if (videoTag) {
        return {
            videoUrl: videoTag.getAttribute('src'),
            coverImageUrl: videoTag.getAttribute('poster')
        };
    }

    // Try to find a <source> tag within a <video> tag
    const sourceTag = root.querySelector('video source[src]');
    if (sourceTag) {
        return {
            videoUrl: sourceTag.getAttribute('src'),
            coverImageUrl: sourceTag.closest('video')?.getAttribute('poster')
        };
    }
    
    // Fallback for generic MP4 URLs in the content
    const urlRegex = /(https?:\/\/[^"'`]+\.mp4)/g;
    const matches = htmlContent.match(urlRegex);
    if (matches && matches.length > 0) {
        return {
            videoUrl: matches[0],
            coverImageUrl: root.querySelector('meta[property="og:image"]')?.getAttribute('content')
        }
    }

    return {};
}

// Function to find the highest resolution image on an image-hosting page.
export function extractFullResolutionImage(htmlContent: string): string | null {
    const root = parse(htmlContent);

    // Look for OG image first, often high quality
    const ogImage = root.querySelector('meta[property="og:image"]');
    if (ogImage) {
        return ogImage.getAttribute('content');
    }

    // Find all images and pick the largest one based on dimensions or heuristics
    let largestImage: { url: string, area: number } | null = null;

    const images = root.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) return;
        
        // Use intrinsic dimensions if available
        const width = parseInt(img.getAttribute('width') || '0');
        const height = parseInt(img.getAttribute('height') || '0');
        const area = width * height;

        if (!largestImage || area > largestImage.area) {
            largestImage = { url: src, area: area };
        }
    });

    return largestImage ? largestImage.url : null;
}
