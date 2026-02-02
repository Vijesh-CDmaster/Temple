'use server';

import { countCrowd } from '@/ai/flows/count-crowd-flow';
import { z } from 'zod';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Image data is required.'),
});

export type State = {
    message: string;
    data: Awaited<ReturnType<typeof countCrowd>> | null;
}

export async function getCrowdCount(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = formSchema.safeParse({
    photoDataUri: formData.get('photoDataUri'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Image is missing.',
      data: null,
    };
  }
  
  try {
    const result = await countCrowd(validatedFields.data);
    return { message: 'Analysis successful.', data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    const lowerCaseError = errorMessage.toLowerCase();
    
    // Provide a more helpful message for common errors.
    if (lowerCaseError.includes('api key')) {
        return { message: 'Analysis failed: Invalid or missing Gemini API Key. Please ensure it is set correctly in your .env file and that the Genkit server is running.', data: null };
    }

    if (lowerCaseError.includes('quota exceeded') || lowerCaseError.includes('429')) {
        return { message: 'Analysis failed: You have exceeded the free tier request limit for the AI model. Please check your plan and billing details, or try again later.', data: null };
    }

    return { message: `Analysis failed: ${errorMessage}`, data: null };
  }
}
