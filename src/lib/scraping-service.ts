import { ScrapedResult, SearchType } from './types';
import { parse, HTMLElement } from 'node-html-parser';


export function extractScrapedResults(htmlContent: string, searchType: SearchType): ScrapedResult[] {
    const root = parse(htmlContent);

    if (searchType === SearchType.IMAGES || searchType === SearchType.GIF) {
        const imageResults: ScrapedResult[] = [];
        // Updated selector for image results
        const imageElements = root.querySelectorAll('div.isv-r'); 
        
        for (const el of imageElements) {
            const linkEl = el.querySelector('a');
            if (!linkEl) continue;

            const pageLink = linkEl.getAttribute('href');
            if (!pageLink) continue;
            
            const imgEl = el.querySelector('img');
            const imageUrl = imgEl?.getAttribute('data-src') || imgEl?.getAttribute('src');
            if (!imageUrl) continue;

            const titleEl = el.querySelector('.bytUYc');
            const title = titleEl?.innerText || 'Görsel Sonucu';
            
            const snippetEl = el.querySelector('.V_iG3b');
            const snippet = snippetEl?.innerText || new URL(`https://google.com${pageLink}`).hostname;


            imageResults.push({ title, link: `https://google.com${pageLink}`, snippet, imageUrl });
        }
        if (imageResults.length > 0) return imageResults;

        // Fallback for older structure
        const oldImageElements = root.querySelectorAll('div[data-ri]');
        for (const el of oldImageElements) {
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

    // --- GENERAL WEB SEARCH (UPDATED) ---
    const webResults: ScrapedResult[] = [];
    const resultElements = root.querySelectorAll('div.g');

    for (const el of resultElements) {
        const linkEl = el.querySelector('a');
        if (!linkEl) continue;

        const href = linkEl.getAttribute('href');
        if (!href || href.startsWith('/search?q=') || href.includes('google.com/search')) continue;

        const titleEl = linkEl.querySelector('h3');
        const title = titleEl?.innerText;
        
        // Updated snippet selector
        const snippetEl = el.querySelector('.VwiC3b, .AP7Wnd');
        const snippet = snippetEl?.innerText;

        if (href && title && snippet) {
            const imageEl = el.querySelector('img');
            const imageUrl = imageEl?.getAttribute('src');
            webResults.push({ title, link: href, snippet, imageUrl });
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
    const ogVideo = root.querySelector('meta[property="og:video"]');
    if (ogVideo) {
        return ogVideo.getAttribute('content');
    }
    
    // Specific selector for Reddit galleries
    const redditGalleryImage = root.querySelector('a[href^="https://i.redd.it/"] > img');
    if(redditGalleryImage) {
        const link = redditGalleryImage.parentNode.getAttribute('href');
        if(link) return link;
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
