'use server';
/**
 * @fileOverview Counts people in an image using AI.
 *
 * - countCrowd - A function that handles the crowd counting process from an image.
 * - CountCrowdInput - The input type for the countCrowd function.
 * - CountCrowdOutput - The return type for the countCrowd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CountCrowdInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crowd, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CountCrowdInput = z.infer<typeof CountCrowdInputSchema>;

const CountCrowdOutputSchema = z.object({
  crowdCount: z.number().describe('The estimated number of people visible in the image.'),
  analysis: z.string().describe('A brief analysis of the crowd density and any potential observations.'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed risk level based on the crowd density.'),
});
export type CountCrowdOutput = z.infer<typeof CountCrowdOutputSchema>;

export async function countCrowd(input: CountCrowdInput): Promise<CountCrowdOutput> {
  return countCrowdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'countCrowdPrompt',
  input: {schema: CountCrowdInputSchema},
  output: {schema: CountCrowdOutputSchema},
  prompt: `You are an expert in analyzing images for crowd control purposes.
Your task is to analyze the provided image and perform the following:
1.  Count the number of people visible in the image. Provide your best estimate.
2.  Assess the crowd density and assign a risk level: Low, Medium, or High.
3.  Write a brief analysis of your observations (e.g., "The crowd is concentrated in the upper left", "People are spaced out evenly").

Populate the crowdCount, riskLevel, and analysis fields in the output.

Image to analyze: {{media url=photoDataUri}}`,
});

const countCrowdFlow = ai.defineFlow(
  {
    name: 'countCrowdFlow',
    inputSchema: CountCrowdInputSchema,
    outputSchema: CountCrowdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
