'use server';
/**
 * @fileOverview Analyzes an image and generates descriptive search terms.
 *
 * - getImageSearchTerms - A function that handles the image analysis.
 * - GetImageSearchTermsInput - The input type for the getImageSearchTerms function.
 * - GetImageSearchTermsOutput - The return type for the getImageSearchTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetImageSearchTermsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GetImageSearchTermsInput = z.infer<typeof GetImageSearchTermsInputSchema>;

const GetImageSearchTermsOutputSchema = z.object({
  terms: z.array(z.string()).describe('An array of 3 to 5 descriptive search terms based on the image.'),
});
export type GetImageSearchTermsOutput = z.infer<typeof GetImageSearchTermsOutputSchema>;

export async function getImageSearchTerms(input: GetImageSearchTermsInput): Promise<GetImageSearchTermsOutput> {
  return getImageSearchTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getImageSearchTermsPrompt',
  input: {schema: GetImageSearchTermsInputSchema},
  output: {schema: GetImageSearchTermsOutputSchema},
  prompt: `You are an expert image analyst. Your task is to analyze the provided image and generate a list of 3 to 5 distinct and descriptive search terms that accurately represent the main subject, style, and context of the image.

For example, if you see a picture of a yellow straw hat on a beach, you might generate terms like: "yellow straw hat", "summer beach accessory", "sun protection hat", "woven sun hat".

Focus on the most salient features. Be specific and detailed.

Image:
{{media url=photoDataUri}}
`,
});

const getImageSearchTermsFlow = ai.defineFlow(
  {
    name: 'getImageSearchTermsFlow',
    inputSchema: GetImageSearchTermsInputSchema,
    outputSchema: GetImageSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
