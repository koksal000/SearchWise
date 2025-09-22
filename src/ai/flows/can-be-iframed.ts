'use server';
/**
 * @fileOverview A flow to check if a URL can be embedded in an iframe.
 *
 * - canBeIframed - A function that checks the headers of a URL.
 * - CanBeIframedInput - The input type for the canBeIframed function.
 * - CanBeIframedOutput - The return type for the canBeIframed function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CanBeIframedInputSchema = z.object({
  url: z.string().describe('The URL to check.'),
});
export type CanBeIframedInput = z.infer<typeof CanBeIframedInputSchema>;

const CanBeIframedOutputSchema = z.object({
  canBeIframed: z.boolean().describe('Whether the URL can be embedded in an iframe.'),
});
export type CanBeIframedOutput = z.infer<typeof CanBeIframedOutputSchema>;

export async function canBeIframed(input: CanBeIframedInput): Promise<CanBeIframedOutput> {
  return canBeIframedFlow(input);
}

const canBeIframedFlow = ai.defineFlow(
  {
    name: 'canBeIframedFlow',
    inputSchema: CanBeIframedInputSchema,
    outputSchema: CanBeIframedOutputSchema,
  },
  async ({ url }) => {
    try {
      const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const xFrameOptions = response.headers.get('x-frame-options');
      const csp = response.headers.get('content-security-policy');

      if (xFrameOptions) {
        const normalizedXFrame = xFrameOptions.toLowerCase();
        if (normalizedXFrame === 'deny' || normalizedXFrame === 'sameorigin') {
          return { canBeIframed: false };
        }
      }

      if (csp) {
        const frameAncestors = csp.split(';').find(directive => directive.trim().startsWith('frame-ancestors'));
        if (frameAncestors) {
          const sources = frameAncestors.split(' ').slice(1);
          if (sources.includes("'none'") || sources.includes("'self'")) {
             // Note: 'self' is similar to sameorigin, we block it for simplicity.
            return { canBeIframed: false };
          }
        }
      }

      return { canBeIframed: true };
    } catch (error) {
      console.error(`Failed to check iframable status for ${url}:`, error);
      // On network error, assume it can't be iframed to be safe
      return { canBeIframed: false };
    }
  }
);
