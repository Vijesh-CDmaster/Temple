"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCrowdCount } from "@/app/actions/countCrowd";
import type { State as ResultState, CrowdAnalysisResult } from "@/app/actions/countCrowd";
import { Camera, Users, Loader2, VideoOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState: ResultState = {
  message: "",
  data: null,
};

const ANALYSIS_INTERVAL = 500; // 500ms for near real-time (2 FPS)
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

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
        // Lower resolution for faster processing
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, frameRate: { ideal: 30 } } 
        });
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

  // Direct API call for faster response (bypasses server action overhead)
  const handleAnalyze = async () => {
    if (isPending || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < video.HAVE_METADATA || video.videoWidth === 0) {
      return;
    }
    
    // Use smaller canvas for faster encoding/transmission
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Lower quality JPEG for faster transmission
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

    setIsPending(true);
    
    try {
      // Direct call to ML API for minimal latency
      const response = await fetch(`${ML_API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUri: dataUrl, area_sqm: 10.0 }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setResultState({
          message: 'Analysis successful.',
          data: {
            crowdCount: result.crowdCount,
            riskLevel: result.riskLevel,
            analysis: result.analysis,
            densityPerSqm: result.densityPerSqm,
            processingTimeMs: result.processingTimeMs,
          }
        });
      }
    } catch (error) {
      console.error('ML API error:', error);
    }
    
    setIsPending(false);
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

  useEffect(() => {
    if (isCameraOn) {
      // Start analysis immediately
      const initialTimeout = setTimeout(() => {
        handleAnalyze();
      }, 500);

      // Continuous real-time analysis
      const intervalId = setInterval(() => {
        handleAnalyze();
      }, ANALYSIS_INTERVAL);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(intervalId);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn]);


  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Camera className="text-primary"/> Live Crowd Analysis</CardTitle>
          <CardDescription>Using your device's camera to get a real-time crowd count and risk assessment. Updates automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", { 'hidden': !isCameraOn })}></video>
            
            {isPending && !resultState.data && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-lg font-semibold">Analyzing crowd...</p>
                    <p className="text-sm">This may take a moment.</p>
                </div>
            )}

            {!isCameraOn && !isPending && (
                <div className="flex flex-col items-center text-center text-muted-foreground p-4">
                    <VideoOff className="w-12 h-12 mb-2"/>
                    <p className="text-sm font-medium">{cameraError || "Initializing Camera..."}</p>
                    {cameraError && <Button onClick={startCamera} variant="outline" className="mt-4">Try Again</Button>}
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
         <Card className="flex h-full min-h-[400px] flex-col">
           <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    {isPending && <Loader2 className="h-5 w-5 animate-spin"/>}
                    {!isPending && resultState.data && <Users className="text-primary"/>}
                     Crowd Analysis Results
                </CardTitle>
            </CardHeader>
            {resultState.data ? (
              <AnalysisResults data={resultState.data} />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                {isPending ? (
                    <>
                        <Loader2 className="h-16 w-16 text-muted-foreground animate-spin mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground">Analysis in Progress</h3>
                        <p className="text-sm text-muted-foreground mt-2">Please wait while we analyze the camera feed.</p>
                    </>
                ) : (
                    <>
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground">Waiting for camera...</h3>
                        <p className="text-sm text-muted-foreground mt-2">The crowd analysis will start automatically.</p>
                    </>
                )}
              </div>
            )}
            {resultState.message && resultState.message !== 'Analysis successful.' && <p className="p-4 pt-0 text-sm font-medium text-destructive mt-2">{resultState.message}</p>}
        </Card>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}


function AnalysisResults({ data }: { data: CrowdAnalysisResult }) {
    const riskColor = {
        Low: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/50 dark:border-green-700",
        Medium: "text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-900/50 dark:border-amber-700",
        High: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/50 dark:border-red-700",
    }
    return (
        <CardContent className="space-y-6">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Estimated Crowd Count</p>
                <p className="text-6xl font-bold">{data.crowdCount}</p>
                {data.densityPerSqm !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Density: {data.densityPerSqm} people/m²
                    </p>
                )}
            </div>
            <div className={`p-4 rounded-lg border ${riskColor[data.riskLevel]}`}>
                <h4 className="font-semibold flex items-center gap-2"><AlertTriangle/> Risk Level: {data.riskLevel}</h4>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">{data.analysis}</p>
            </div>
            {data.processingTimeMs !== undefined && (
                <p className="text-xs text-center text-muted-foreground">
                    Processed in {data.processingTimeMs}ms using local ML models
                </p>
            )}
        </CardContent>
    )
}
