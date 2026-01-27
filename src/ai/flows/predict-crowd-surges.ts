// src/ai/flows/predict-crowd-surges.ts
'use server';
/**
 * @fileOverview Predicts potential crowd surges based on historical data and real-time monitoring data.
 *
 * - predictCrowdSurges - A function that predicts potential crowd surges.
 * - PredictCrowdSurgesInput - The input type for the predictCrowdSurges function.
 * - PredictCrowdSurgesOutput - The return type for the predictCrowdSurges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCrowdSurgesInputSchema = z.object({
  historicalData: z.string().describe('Historical temple data (previous festivals, footfall).'),
  liveCameraData: z.string().describe('Live camera data of crowd density.'),
  liveSensorData: z.string().describe('Live sensor data of crowd density.'),
});
export type PredictCrowdSurgesInput = z.infer<typeof PredictCrowdSurgesInputSchema>;

const PredictCrowdSurgesOutputSchema = z.object({
  predictedSurges: z.string().describe('Predicted crowd surges with time and location.'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('Overall risk level of crowd surges.'),
  recommendations: z.string().describe('Recommendations for managing potential crowd surges.'),
});
export type PredictCrowdSurgesOutput = z.infer<typeof PredictCrowdSurgesOutputSchema>;

export async function predictCrowdSurges(input: PredictCrowdSurgesInput): Promise<PredictCrowdSurgesOutput> {
  return predictCrowdSurgesFlow(input);
}

const predictCrowdSurgesPrompt = ai.definePrompt({
  name: 'predictCrowdSurgesPrompt',
  input: {schema: PredictCrowdSurgesInputSchema},
  output: {schema: PredictCrowdSurgesOutputSchema},
  prompt: `You are an expert in crowd management and risk assessment for temples.
  Based on the historical data, live camera data, and live sensor data, predict potential crowd surges.

  Historical Data: {{{historicalData}}}
  Live Camera Data: {{{liveCameraData}}}
  Live Sensor Data: {{{liveSensorData}}}

  Provide a prediction of crowd surges, the risk level (Low, Medium, or High), and recommendations for managing the surges.
  Ensure that the predictedSurges, riskLevel and recommendations output fields are populated.
  Consider all inputs and be accurate in the determination of risk and suggestions.
  `,
});

const predictCrowdSurgesFlow = ai.defineFlow(
  {
    name: 'predictCrowdSurgesFlow',
    inputSchema: PredictCrowdSurgesInputSchema,
    outputSchema: PredictCrowdSurgesOutputSchema,
  },
  async input => {
    const {output} = await predictCrowdSurgesPrompt(input);
    return output!;
  }
);
