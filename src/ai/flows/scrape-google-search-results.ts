'use server';
/**
 * @fileOverview Scrapes Google search results page when API quota is exceeded.
 *
 * - scrapeGoogleSearchResults - A function that scrapes Google search results.
 * - ScrapeGoogleSearchResultsInput - The input type for the function.
 * - ScrapeGoogleSearchResultsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SearchType } from '@/lib/types';

const ScrapedResultSchema = z.object({
  title: z.string().describe('The main title of the search result.'),
  link: z.string().describe('The direct URL to the search result page.'),
  snippet: z.string().describe('A brief description or snippet of the search result.'),
  imageUrl: z.string().optional().describe('The URL of the thumbnail image, especially for image or news results.'),
});

const ScrapeGoogleSearchResultsInputSchema = z.object({
  htmlContent: z.string().describe('The full HTML content of a Google search results page.'),
  searchType: z.nativeEnum(SearchType).describe('The type of search being performed (all, images, news, videos).'),
  query: z.string().describe('The original search query.')
});
export type ScrapeGoogleSearchResultsInput = z.infer<typeof ScrapeGoogleSearchResultsInputSchema>;

const ScrapeGoogleSearchResultsOutputSchema = z.object({
  results: z.array(ScrapedResultSchema).describe('An array of scraped search results.'),
});
export type ScrapeGoogleSearchResultsOutput = z.infer<typeof ScrapeGoogleSearchResultsOutputSchema>;


export async function scrapeGoogleSearchResults(input: ScrapeGoogleSearchResultsInput): Promise<ScrapeGoogleSearchResultsOutput> {
  return scrapeGoogleSearchResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scrapeGoogleSearchResultsPrompt',
  input: { schema: ScrapeGoogleSearchResultsInputSchema },
  output: { schema: ScrapeGoogleSearchResultsOutputSchema },
  prompt: `You are an expert web scraper. Your task is to extract search result data from the provided HTML of a Google search results page.

The search was for "{{query}}" with a search type of "{{searchType}}".

Parse the HTML and extract the following information for each search result:
- title: The main title of the result.
- link: The full URL the result points to. Resolve any relative URLs to be absolute google.com URLs if necessary, but prefer the direct link.
- snippet: The descriptive text snippet shown under the title.
- imageUrl: If it's an image or news search, extract the source URL for the result's thumbnail image. For web results, this can be omitted.

Return the data as a structured JSON object. Focus on the main organic search results and ignore ads or "People also ask" sections.

HTML Content to parse:
\`\`\`html
{{{htmlContent}}}
\`\`\`
`,
});

const scrapeGoogleSearchResultsFlow = ai.defineFlow(
  {
    name: 'scrapeGoogleSearchResultsFlow',
    inputSchema: ScrapeGoogleSearchResultsInputSchema,
    outputSchema: ScrapeGoogleSearchResultsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { results: [] };
    }
    return output;
  }
);
