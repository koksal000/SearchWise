import { ScrapedResult, SearchType } from './types';
import { parse, HTMLElement } from 'node-html-parser';


export function extractScrapedResults(htmlContent: string, searchType: SearchType): ScrapedResult[] {
    const root = parse(htmlContent);

    if (searchType === SearchType.IMAGES) {
        const imageResults: ScrapedResult[] = [];
        const imageElements = root.querySelectorAll('div.isv-r');
        
        for (const el of imageElements) {
            const linkEl = el.querySelector('a:first-child');
            if (!linkEl) continue;

            const linkHref = linkEl.getAttribute('href');
            if (!linkHref) continue;

            const imgEl = el.querySelector('img');
            const imageUrl = imgEl?.getAttribute('src');
            const titleEl = el.querySelector('div.byt6U');
            const title = titleEl?.innerText || 'Görsel Sonucu';
            
            const urlParams = new URLSearchParams(linkHref.split('?')[1]);
            const link = urlParams.get('imgurl');
            const snippet = urlParams.get('imgrefurl') || '';

            if (link && imageUrl) {
                imageResults.push({ title, link, snippet, imageUrl });
            }
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

    // Default to web search
    const webResults: ScrapedResult[] = [];
    const resultElements = root.querySelectorAll('div.g');

    for (const el of resultElements) {
        const linkEl = el.querySelector('a');
        const link = linkEl?.getAttribute('href');

        const titleEl = el.querySelector('h3');
        const title = titleEl?.innerText;

        const snippetEl = el.querySelector('div.VwiC3b');
        const snippet = snippetEl?.innerText;

        if (link && title && snippet && !link.startsWith('/search')) {
            const imageEl = el.querySelector('img');
            const imageUrl = imageEl?.getAttribute('src');
            webResults.push({ title, link, snippet, imageUrl });
        }
    }
    
    return webResults;
}

export function extractVideoData(htmlContent: string): { videoUrl?: string; coverImageUrl?: string } {
    const root = parse(htmlContent);

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
    
    // Look for OG (Open Graph) meta tags as a fallback
    const ogVideo = root.querySelector('meta[property="og:video"]');
    if (ogVideo) {
         return {
            videoUrl: ogVideo.getAttribute('content'),
            coverImageUrl: root.querySelector('meta[property="og:image"]')?.getAttribute('content')
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
