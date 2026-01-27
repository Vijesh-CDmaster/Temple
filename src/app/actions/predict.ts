'use server';

import { predictCrowdSurges } from '@/ai/flows/predict-crowd-surges';
import { z } from 'zod';

const formSchema = z.object({
  historicalData: z.string().min(10, 'Historical data must be at least 10 characters long.'),
  liveCameraData: z.string().min(10, 'Live camera data must be at least 10 characters long.'),
  liveSensorData: z.string().min(10, 'Live sensor data must be at least 10 characters long.'),
});

type State = {
    message: string;
    errors?: {
        historicalData?: string[];
        liveCameraData?: string[];
        liveSensorData?: string[];
    } | null;
    data: Awaited<ReturnType<typeof predictCrowdSurges>> | null;
}

export async function getPrediction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = formSchema.safeParse({
    historicalData: formData.get('historicalData'),
    liveCameraData: formData.get('liveCameraData'),
    liveSensorData: formData.get('liveSensorData'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }
  
  try {
    const result = await predictCrowdSurges(validatedFields.data);
    return { message: 'Prediction successful.', errors: null, data: result };
  } catch (error) {
    console.error(error);
    return { message: 'Prediction failed due to a server error.', errors: null, data: null };
  }
}
