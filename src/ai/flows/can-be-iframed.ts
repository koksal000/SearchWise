'use server';
/**
 * @fileOverview Checks if a URL can be embedded in an iframe by checking its headers.
 *
 * - canBeIframed - A function that checks if a URL can be iframed.
 * - CanBeIframedInput - The input type for the canBeIframed function.
 * - CanBeIframedOutput - The return type for the canBeIframed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CanBeIframedInputSchema = z.object({
  url: z.string().describe('The URL to check.'),
});
export type CanBeIframedInput = z.infer<typeof CanBeIframedInputSchema>;

const CanBeIframedOutputSchema = z.object({
  canBeIframed: z
    .boolean()
    .describe(
      'Whether the URL can be safely embedded in an iframe based on its headers.'
    ),
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
  async ({url}) => {
    try {
      const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const xFrameOptions = response.headers.get('x-frame-options');
      const contentSecurityPolicy = response.headers.get('content-security-policy');

      if (xFrameOptions) {
        const xFrameOptionsLower = xFrameOptions.toLowerCase();
        if (xFrameOptionsLower === 'deny' || xFrameOptionsLower === 'sameorigin') {
          return { canBeIframed: false };
        }
      }

      if (contentSecurityPolicy) {
        if (contentSecurityPolicy.includes("frame-ancestors 'none'")) {
          return { canBeIframed: false };
        }
        if (contentSecurityPolicy.includes("frame-ancestors 'self'")) {
          return { canBeIframed: false };
        }
      }

      return { canBeIframed: true };
    } catch (error) {
      console.error(`Error checking iframability for ${url}:`, error);
      // On network error or other issues, assume it can't be iframed safely.
      return { canBeIframed: false };
    }
  }
);
