"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCrowdCount } from "@/app/actions/countCrowd";
import type { State as ResultState } from "@/app/actions/countCrowd";
import type { CountCrowdOutput } from "@/ai/flows/count-crowd-flow";
import { Camera, Users, Loader2, VideoOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState: ResultState = {
  message: "",
  data: null,
};

export function CrowdCounter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [resultState, setResultState] = useState<ResultState>(initialState);

  const startCamera = async () => {
    setCameraError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setCameraError("Could not access camera. Please check permissions and try again.");
        setIsCameraOn(false);
      }
    } else {
      setCameraError("Camera not supported by this browser.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      const formData = new FormData();
      formData.append('photoDataUri', dataUrl);

      setIsPending(true);
      setResultState(initialState);
      const response = await getCrowdCount(initialState, formData);
      setResultState(response);
      setIsPending(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Camera className="text-primary"/> Live Crowd Analysis</CardTitle>
          <CardDescription>Use your device's camera to get a real-time crowd count and risk assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", { 'hidden': !isCameraOn })}></video>
            {!isCameraOn && (
                <div className="flex flex-col items-center text-center text-muted-foreground p-4">
                    <VideoOff className="w-12 h-12 mb-2"/>
                    <p className="text-sm font-medium">{cameraError || "Camera is off"}</p>
                    {cameraError && <Button onClick={startCamera} variant="outline" className="mt-4">Try Again</Button>}
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAnalyze} disabled={isPending || !isCameraOn} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              Analyze Crowd from Camera
            </Button>
        </CardFooter>
      </Card>

      <div className="lg:col-span-2">
        {resultState.data ? (
          <AnalysisResults data={resultState.data} />
        ) : (
          <Card className="flex h-full min-h-[400px] flex-col items-center justify-center text-center p-8">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Analysis will appear here</h3>
            <p className="text-sm text-muted-foreground mt-2">Point your camera at a crowd and click "Analyze" to begin.</p>
          </Card>
        )}
        {resultState.message && resultState.message !== 'Analysis successful.' && <p className="text-sm font-medium text-destructive mt-2">{resultState.message}</p>}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}


function AnalysisResults({ data }: { data: CountCrowdOutput }) {
    const riskColor = {
        Low: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/50 dark:border-green-700",
        Medium: "text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700",
        High: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/50 dark:border-red-700",
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Users className="text-primary"/> Crowd Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estimated Crowd Count</p>
                    <p className="text-6xl font-bold">{data.crowdCount}</p>
                </div>
                <div className={`p-4 rounded-lg border ${riskColor[data.riskLevel]}`}>
                    <h4 className="font-semibold flex items-center gap-2"><AlertTriangle/> Risk Level: {data.riskLevel}</h4>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Analysis</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">{data.analysis}</p>
                </div>
            </CardContent>
        </Card>
    )
}
