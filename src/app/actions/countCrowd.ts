'use server';

import { z } from 'zod';

// ML API endpoint - runs locally via Python FastAPI server
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

const formSchema = z.object({
  photoDataUri: z.string().min(1, 'Image data is required.'),
});

// Output type matching the ML API response
export type CrowdAnalysisResult = {
  crowdCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  analysis: string;
  densityPerSqm?: number;
  processingTimeMs?: number;
};

export type State = {
  message: string;
  data: CrowdAnalysisResult | null;
};

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
    // Call the local ML API server (CSRNet/YOLO)
    const response = await fetch(`${ML_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoDataUri: validatedFields.data.photoDataUri,
        area_sqm: 100.0, // Default area - can be made configurable
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `ML API error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      message: 'Analysis successful.',
      data: {
        crowdCount: result.crowdCount,
        riskLevel: result.riskLevel,
        analysis: result.analysis,
        densityPerSqm: result.densityPerSqm,
        processingTimeMs: result.processingTimeMs,
      },
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    const lowerCaseError = errorMessage.toLowerCase();

    // Provide helpful messages for common errors
    if (lowerCaseError.includes('econnrefused') || lowerCaseError.includes('fetch failed')) {
      return {
        message: 'Analysis failed: ML server is not running. Please start the Python API server with: python -m crowd_ai.api_server',
        data: null,
      };
    }

    if (lowerCaseError.includes('no ml models available')) {
      return {
        message: 'Analysis failed: ML models not loaded. Please install PyTorch and dependencies: pip install -r crowd_ai/requirements.txt',
        data: null,
      };
    }

    return { message: `Analysis failed: ${errorMessage}`, data: null };
  }
}
