'use server';

import { getTempleSummary } from '@/ai/flows/summarize-temple-flow';
import { z } from 'zod';

const formSchema = z.object({
  templeName: z.string(),
  location: z.string(),
});

export type SummaryState = {
    message: string;
    summary: string | null;
}

export async function generateTempleSummary(prevState: SummaryState, formData: FormData): Promise<SummaryState> {
  const validatedFields = formSchema.safeParse({
    templeName: formData.get('templeName'),
    location: formData.get('location'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input. Temple name and location are required.',
      summary: null,
    };
  }
  
  try {
    const result = await getTempleSummary(validatedFields.data);
    return { message: 'Summary generated.', summary: result.summary };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    if (errorMessage.toLowerCase().includes('api key')) {
        return { message: 'Generation failed: Invalid or missing Gemini API Key. Please ensure it is set correctly in your .env file and that the Genkit server is running.', summary: null };
    }

    return { message: `Generation failed: ${errorMessage}`, summary: null };
  }
}
