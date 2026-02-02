'use server';
/**
 * @fileOverview Generates a detailed summary for a given temple.
 *
 * - getTempleSummary - A function that handles the temple summary generation.
 * - TempleSummaryInput - The input type for the getTempleSummary function.
 * - TempleSummaryOutput - The return type for the getTempleSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TempleSummaryInputSchema = z.object({
  templeName: z.string().describe('The name of the temple to summarize.'),
  location: z.string().describe('The location of the temple.'),
});
export type TempleSummaryInput = z.infer<typeof TempleSummaryInputSchema>;

const TempleSummaryOutputSchema = z.object({
  summary: z.string().describe('A detailed and engaging summary covering the temple\'s history, mythology, and architectural significance. Should be formatted as a single string with paragraphs separated by newline characters.'),
});
export type TempleSummaryOutput = z.infer<typeof TempleSummaryOutputSchema>;

export async function getTempleSummary(input: TempleSummaryInput): Promise<TempleSummaryOutput> {
  return summarizeTempleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTemplePrompt',
  input: {schema: TempleSummaryInputSchema},
  output: {schema: TempleSummaryOutputSchema},
  prompt: `You are a knowledgeable historian and storyteller specializing in Indian temples.
Given the temple name and location, generate a detailed and engaging summary.

Your summary should cover:
1.  **Key Historical Points:** When was it built, by whom, and what major events has it witnessed?
2.  **Mythological Significance:** What are the core legends and stories associated with this temple and its deity?
3.  **Architectural Highlights:** Describe the style of architecture, key features, and any unique artistic elements.
4.  **Cultural Importance:** Why is this temple important for devotees today?

Weave these points into a compelling narrative. The output should be a single string, with paragraphs separated by newline characters for readability.

Temple: {{{templeName}}}, {{{location}}}
`,
});

const summarizeTempleFlow = ai.defineFlow(
  {
    name: 'summarizeTempleFlow',
    inputSchema: TempleSummaryInputSchema,
    outputSchema: TempleSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
