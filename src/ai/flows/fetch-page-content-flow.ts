'use server';
/**
 * @fileOverview A flow to fetch the content of a URL using an AI tool.
 *
 * - fetchPageContent - A function that fetches the HTML content of a URL.
 * - FetchPageContentInput - The input type for the fetchPageContent function.
 * - FetchPageContentOutput - The return type for the fetchPageContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetch } from 'zx';

const FetchPageContentInputSchema = z.object({
  url: z.string().describe('The URL to fetch.'),
});
export type FetchPageContentInput = z.infer<typeof FetchPageContentInputSchema>;

const FetchPageContentOutputSchema = z.object({
  content: z.string().describe('The HTML content of the page.'),
});
export type FetchPageContentOutput = z.infer<typeof FetchPageContentOutputSchema>;

export async function fetchPageContentFlow(input: FetchPageContentInput): Promise<FetchPageContentOutput> {
  return pageContentFetcherFlow(input);
}

const fetchUrlTool = ai.defineTool(
    {
      name: 'fetchUrl',
      description: 'Fetches the content of a URL.',
      inputSchema: z.object({ url: z.string() }),
      outputSchema: z.object({ content: z.string() }),
    },
    async ({ url }) => {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        return { content: await response.text() };
    }
);

const pageContentFetcherFlow = ai.defineFlow(
  {
    name: 'pageContentFetcherFlow',
    inputSchema: FetchPageContentInputSchema,
    outputSchema: FetchPageContentOutputSchema,
    tools: [fetchUrlTool],
  },
  async ({ url }) => {
    const llmResponse = await ai.generate({
        prompt: `Fetch the content of the url: ${url}`,
        tools: [fetchUrlTool],
        toolChoice: "required",
    });

    const toolRequest = llmResponse.toolRequest();
    if (!toolRequest) {
        throw new Error('Expected a tool request from the model.');
    }

    const toolResponse = await toolRequest.run();
    
    return { content: toolResponse as string };
  }
);
