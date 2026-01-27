"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPrediction } from "@/app/actions/predict";
import type { PredictCrowdSurgesOutput } from "@/ai/flows/predict-crowd-surges";
import { Bot, Loader2, BarChart, FileText, AlertTriangle, Zap } from "lucide-react";

const initialState = {
  message: "",
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Predict Crowd Surges
    </Button>
  );
}

export function AiPrediction() {
  const [state, formAction] = useFormState(getPrediction, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Zap className="text-primary"/> AI Crowd Prediction</CardTitle>
          <CardDescription>Input real-time data to predict potential crowd surges using AI.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="historicalData">Historical Data</Label>
              <Textarea
                id="historicalData"
                name="historicalData"
                placeholder="e.g., Footfall during last year's festival was 50,000. Peak hours were 10am-1pm."
                rows={3}
                defaultValue="Previous festival footfall reached 75,000 on the main day, with a sudden surge recorded at 11 AM near the main sanctum."
              />
               {state.errors?.historicalData && <p className="text-sm font-medium text-destructive">{state.errors.historicalData[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveCameraData">Live Camera Data</Label>
              <Textarea
                id="liveCameraData"
                name="liveCameraData"
                placeholder="e.g., High density observed at Gate 3. Crowd movement is slow."
                rows={3}
                defaultValue="Camera feed from C-05 shows high crowd density at the northern corridor. Movement speed is estimated at 0.5 m/s."
              />
              {state.errors?.liveCameraData && <p className="text-sm font-medium text-destructive">{state.errors.liveCameraData[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveSensorData">Live Sensor Data</Label>
              <Textarea
                id="liveSensorData"
                name="liveSensorData"
                placeholder="e.g., Pressure sensors at main hall are at 80% capacity."
                rows={3}
                defaultValue="IoT sensor network reports 90% density in the main prayer hall. Temperature has risen by 2 degrees Celsius in the last 15 minutes."
              />
              {state.errors?.liveSensorData && <p className="text-sm font-medium text-destructive">{state.errors.liveSensorData[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <div className="lg:col-span-3">
        {state.data ? (
          <PredictionResults data={state.data} />
        ) : (
          <Card className="flex h-full min-h-[400px] flex-col items-center justify-center text-center p-8">
            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Prediction results will appear here</h3>
            <p className="text-sm text-muted-foreground mt-2">Fill in the data and click "Predict" to see the AI's analysis.</p>
          </Card>
        )}
        {state.message && state.message !== 'Prediction successful.' && <p className="text-sm font-medium text-destructive mt-2">{state.message}</p>}
      </div>
    </div>
  );
}


function PredictionResults({ data }: { data: PredictCrowdSurgesOutput }) {
    const riskColor = {
        Low: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/50 dark:border-green-700",
        Medium: "text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700",
        High: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/50 dark:border-red-700",
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BarChart className="text-primary"/> Prediction Analysis</CardTitle>
                <CardDescription>AI-generated insights and recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg border ${riskColor[data.riskLevel]}`}>
                    <h4 className="font-semibold flex items-center gap-2"><AlertTriangle/> Risk Level: {data.riskLevel}</h4>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText /> Predicted Surges</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">{data.predictedSurges}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText /> Recommendations</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">{data.recommendations}</p>
                </div>
            </CardContent>
        </Card>
    )
}
