import { ScrapedResult, SearchType } from './types';

// Regular expressions to find data in the HTML.
// These are fragile and might break if Google changes their markup.

// This regex looks for the main result blocks in a standard Google search.
const webResultRegex = /<div class="g">.*?<a href="(.*?)".*?<h3.*?>(.*?)<\/h3>.*?<div class="VwiC3b".*?<span>(.*?)<\/span>.*?<\/div>/gs;

// This regex is specifically for image search results. It's more complex as it needs to find the link, the image source, and the title.
const imageResultRegex = /<a.*?href="(\/imgres\?imgurl=.*?)"[^>]*>.*?<img.*?src="(https?:\/\/[^"]+)".*?<\/a>/gs;

// This regex targets news results, which often have a slightly different structure.
const newsResultRegex = /<div class="SoaBEf">.*?<a href="(.*?)".*?<div role="heading".*?>(.*?)<\/div>.*?<div class="GI74Re".*?>(.*?)<\/div>/gs;


function decodeResult(html: string): string {
    return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/&quot;/g, '"');
}

export function extractScrapedResults(htmlContent: string, searchType: SearchType): ScrapedResult[] {
    const results: ScrapedResult[] = [];
    let regex: RegExp;

    switch (searchType) {
        case SearchType.IMAGES:
            // For images, we need to extract the direct image URL from the /imgres link
            const imageMatches = [...htmlContent.matchAll(imageResultRegex)];
            for (const match of imageMatches) {
                const imgresUrl = new URL(match[1], 'https://www.google.com');
                const link = imgresUrl.searchParams.get('imgurl');
                const title = "Image Result"; // Google image search doesn't provide a reliable title in the same way
                const snippet = imgresUrl.searchParams.get('imgrefurl') || '';
                const imageUrl = match[2];
                if (link) {
                    results.push({ title: decodeResult(title), link, snippet: decodeResult(snippet), imageUrl });
                }
            }
            return results;

        case SearchType.NEWS:
            regex = newsResultRegex;
            break;

        case SearchType.ALL:
        case SearchType.VIDEOS: // Video search scraping uses the web regex and post-processes in actions.ts
        default:
            regex = webResultRegex;
            break;
    }

    const matches = [...htmlContent.matchAll(regex)];

    for (const match of matches) {
        const link = match[1];
        const title = match[2];
        const snippet = match[3];
        // For web results, try to find an associated thumbnail if available
        const imageUrlRegex = /<img.*?src="(https?:\/\/[^"]+)".*?>/;
        const imageMatch = snippet.match(imageUrlRegex);
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        if (link && title && snippet && !link.startsWith('/search')) { // Filter out "related searches" etc.
            results.push({ title: decodeResult(title), link: decodeResult(link), snippet: decodeResult(snippet), imageUrl });
        }
    }

    return results;
}

export function extractVideoData(htmlContent: string): { videoUrl?: string; coverImageUrl?: string } {
    // Regex for <video> tag with a src
    const videoTagRegex = /<video.*?src=["'](.*?)["'].*?(?:poster=["'](.*?)["'])?/s;
    const videoMatch = htmlContent.match(videoTagRegex);

    if (videoMatch && videoMatch[1]) {
        return { videoUrl: videoMatch[1], coverImageUrl: videoMatch[2] };
    }

    // Regex for <source> tag inside a <video> tag
    const sourceTagRegex = /<source.*?src=["'](.*?)["'].*?type=["']video\/mp4["']/s;
    const sourceMatch = htmlContent.match(sourceTagRegex);
    if (sourceMatch && sourceMatch[1]) {
        // Attempt to find a poster image on the parent <video> tag
        const parentVideoRegex = new RegExp(`<video.*?>.*?${sourceMatch[0]}.*?<\/video>`, 's');
        const parentVideoMatch = htmlContent.match(parentVideoRegex);
        const posterRegex = /poster=["'](.*?)["']/;
        const posterMatch = parentVideoMatch?.[0].match(posterRegex);

        return { videoUrl: sourceMatch[1], coverImageUrl: posterMatch?.[1] };
    }
    
    // Fallback regex for common video URLs like .mp4 in JSON blobs or attributes
    const genericUrlRegex = /["'](https?:\/\/[^"']+\.mp4(?:\?[^"']*)?)["']/g;
    let genericMatch;
    const matches = [];
    while ((genericMatch = genericUrlRegex.exec(htmlContent)) !== null) {
        matches.push(genericMatch[1]);
    }
    
    if (matches.length > 0) {
        // A simple heuristic: pick the first one found. This could be improved.
        const videoUrl = matches[0];
        // Try to find a cover image near the video URL
        const ogImageRegex = /<meta.*?property=["']og:image["'].*?content=["'](.*?)["']/;
        const ogImageMatch = htmlContent.match(ogImageRegex);
        return { videoUrl, coverImageUrl: ogImageMatch?.[1] };
    }

    return {};
}
