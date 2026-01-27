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
    return { message: 'Analysis failed due to a server error.', data: null };
  }
}
