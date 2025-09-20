'use server';
/**
 * @fileOverview Extracts video links and cover images from HTML/JS/CSS data fetched from search results pages.
 *
 * - extractVideoData - A function that extracts video data from search results.
 * - ExtractVideoDataInput - The input type for the extractVideoData function.
 * - ExtractVideoDataOutput - The return type for the extractVideoData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractVideoDataInputSchema = z.object({
  htmlContent: z
    .string()
    .describe('The HTML content of the search result page.'),
  url: z.string().describe('The URL of the search result page.'),
});
export type ExtractVideoDataInput = z.infer<typeof ExtractVideoDataInputSchema>;

const ExtractVideoDataOutputSchema = z.object({
  videoUrl: z.string().optional().describe('The URL of the video, if found.'),
  coverImageUrl: z
    .string()
    .optional()
    .describe('The URL of the cover image for the video, if found.'),
});
export type ExtractVideoDataOutput = z.infer<typeof ExtractVideoDataOutputSchema>;

export async function extractVideoData(input: ExtractVideoDataInput): Promise<ExtractVideoDataOutput> {
  return extractVideoDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractVideoDataPrompt',
  input: {schema: ExtractVideoDataInputSchema},
  output: {schema: ExtractVideoDataOutputSchema},
  prompt: `You are an expert web data extractor. Given the HTML content of a web page and its URL, your task is to extract the video URL and cover image URL if they exist.

Analyze the HTML content provided below and identify any potential video sources (e.g., <video> tags, <source> tags, or common video hosting patterns like YouTube or Vimeo).

If a video URL is found, extract the direct link to the video file (e.g., a .mp4 file).

Also, look for a relevant cover image for the video. This could be within the <video> tag itself (poster attribute) or in associated <img> tags.

If you cannot find the video URL, return empty values.

HTML Content:
\`\`\`
{{{htmlContent}}}
\`\`\`
URL: {{{url}}}

Ensure that the output is formatted as a JSON object conforming to the schema. If you are unable to determine either the video URL or cover image URL, set the corresponding output field to undefined.

`,
});

const extractVideoDataFlow = ai.defineFlow(
  {
    name: 'extractVideoDataFlow',
    inputSchema: ExtractVideoDataInputSchema,
    outputSchema: ExtractVideoDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
