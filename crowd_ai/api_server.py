"""
Crowd Density API Server
========================
FastAPI server for crowd density estimation using CSRNet/YOLO.

Usage:
    python -m crowd_ai.api_server
    
    Or with uvicorn:
    uvicorn crowd_ai.api_server:app --host 0.0.0.0 --port 8000 --reload
"""

import base64
import io
import time
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(
    title="Crowd Density API",
    description="Real-time crowd counting and density estimation using CSRNet/YOLO",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances (lazy loaded)
_csrnet_engine = None
_yolo_detector = None


class AnalyzeRequest(BaseModel):
    """Request body for analyze endpoint."""
    photoDataUri: str  # Base64 encoded image with data URI prefix
    area_sqm: Optional[float] = 100.0  # Area covered by camera


class AnalyzeResponse(BaseModel):
    """Response from analyze endpoint."""
    crowdCount: int
    riskLevel: str  # "Low", "Medium", "High"
    analysis: str
    densityPerSqm: float
    processingTimeMs: float


def get_csrnet_engine():
    """Lazy load CSRNet engine."""
    global _csrnet_engine
    if _csrnet_engine is None:
        try:
            from .inference import CrowdDensityEngine, EngineConfig
            config = EngineConfig(
                model_type="lite",  # Use lightweight model for faster inference
                scale_factor=0.5,
                area_sqm=100.0,
                use_cuda=True,  # Will fall back to CPU if not available
                enable_smoothing=False  # Disable smoothing for API (single image)
            )
            _csrnet_engine = CrowdDensityEngine(config)
            print("CSRNet engine loaded successfully")
        except Exception as e:
            print(f"Could not load CSRNet engine: {e}")
            _csrnet_engine = "failed"
    return _csrnet_engine if _csrnet_engine != "failed" else None


def get_yolo_detector():
    """Lazy load YOLO detector optimized for speed."""
    global _yolo_detector
    if _yolo_detector is None:
        try:
            from .yolo_detector import YOLOv8Detector, YOLO_AVAILABLE
            if YOLO_AVAILABLE:
                _yolo_detector = YOLOv8Detector(
                    model_size="n",  # Nano model for maximum speed
                    confidence_threshold=0.3  # Balance between speed and accuracy
                )
                print("YOLO detector loaded successfully (nano model for real-time)")
            else:
                print("YOLO not available (ultralytics not installed)")
                _yolo_detector = "unavailable"
        except Exception as e:
            print(f"Could not load YOLO detector: {e}")
            _yolo_detector = "failed"
    return _yolo_detector if _yolo_detector not in ["failed", "unavailable"] else None


def decode_image(data_uri: str) -> np.ndarray:
    """Decode base64 data URI to OpenCV image."""
    try:
        # Remove data URI prefix if present
        if "," in data_uri:
            header, encoded = data_uri.split(",", 1)
        else:
            encoded = data_uri
        
        # Decode base64
        image_data = base64.b64decode(encoded)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Convert to OpenCV format (BGR)
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        return frame
    except Exception as e:
        raise ValueError(f"Failed to decode image: {e}")


def classify_risk_level(density_level: str) -> str:
    """Map density level to risk level for frontend."""
    mapping = {
        "LOW": "Low",
        "MEDIUM": "Medium",
        "HIGH": "High",
        "CRITICAL": "High"  # Map critical to High for frontend compatibility
    }
    return mapping.get(density_level, "Medium")


def generate_analysis(crowd_count: int, density_level: str, density_per_sqm: float) -> str:
    """Generate human-readable analysis text."""
    if crowd_count == 0:
        return "No people detected in the frame. The area appears to be empty."
    
    level_descriptions = {
        "LOW": f"Light crowd detected with {crowd_count} people. The area has comfortable spacing with approximately {density_per_sqm:.2f} people per square meter. Safe for normal operations.",
        "MEDIUM": f"Moderate crowd of {crowd_count} people detected. Density is {density_per_sqm:.2f} people per square meter. Some congestion may occur in narrow passages.",
        "HIGH": f"Dense crowd of {crowd_count} people detected. High density of {density_per_sqm:.2f} people per square meter. Consider crowd control measures and monitor closely.",
        "CRITICAL": f"Critical crowd density with {crowd_count} people detected! Density is {density_per_sqm:.2f} people per square meter. Immediate action recommended - potential safety hazard."
    }
    
    return level_descriptions.get(density_level, f"Detected {crowd_count} people in the area.")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "service": "Crowd Density API",
        "models": {
            "csrnet": "available" if get_csrnet_engine() else "unavailable",
            "yolo": "available" if get_yolo_detector() else "unavailable"
        }
    }


@app.get("/health")
async def health_check():
    """Health check for load balancers."""
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_crowd(request: AnalyzeRequest):
    """
    Analyze crowd density from an image.
    
    Accepts a base64 encoded image and returns crowd count, risk level, and analysis.
    Uses YOLO as primary detector (better for individual detection),
    with CSRNet for dense crowd estimation.
    """
    start_time = time.perf_counter()
    
    # Decode image
    try:
        frame = decode_image(request.photoDataUri)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    crowd_count = 0
    density_level = "LOW"
    density_per_sqm = 0.0
    processing_time_ms = 0.0
    detection_method = "none"
    
    # Try YOLO first (better for individual people and low-medium density)
    yolo = get_yolo_detector()
    if yolo:
        try:
            result = yolo.detect(frame)
            crowd_count = result.person_count
            processing_time_ms = result.processing_time_ms
            detection_method = "yolo"
            
            # Calculate density and classify
            density_per_sqm = crowd_count / request.area_sqm if request.area_sqm > 0 else 0
            
            if density_per_sqm < 0.5:
                density_level = "LOW"
            elif density_per_sqm < 1.5:
                density_level = "MEDIUM"
            elif density_per_sqm < 3.0:
                density_level = "HIGH"
            else:
                density_level = "CRITICAL"
        except Exception as e:
            print(f"YOLO detection failed: {e}")
            yolo = None
    
    # Use CSRNet as fallback (better for very dense crowds where YOLO struggles)
    if yolo is None:
        csrnet = get_csrnet_engine()
        if csrnet:
            try:
                result = csrnet.process(frame, area_sqm=request.area_sqm)
                # Ensure non-negative values
                crowd_count = max(0, int(round(result.crowd_count)))
                density_level = result.density_level
                density_per_sqm = max(0.0, result.density_per_sqm)
                processing_time_ms = result.processing_time_ms
                detection_method = "csrnet"
            except Exception as e:
                print(f"CSRNet inference failed: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="Both YOLO and CSRNet failed. Check model availability."
                )
        else:
            raise HTTPException(
                status_code=500,
                detail="No ML models available. Please install required dependencies."
            )
    
    # Generate response
    total_time = (time.perf_counter() - start_time) * 1000
    risk_level = classify_risk_level(density_level)
    analysis = generate_analysis(crowd_count, density_level, density_per_sqm)
    
    return AnalyzeResponse(
        crowdCount=max(0, crowd_count),  # Ensure non-negative
        riskLevel=risk_level,
        analysis=analysis,
        densityPerSqm=max(0.0, round(density_per_sqm, 2)),
        processingTimeMs=round(total_time, 1)
    )


@app.post("/analyze/yolo")
async def analyze_with_yolo(request: AnalyzeRequest):
    """Analyze using only YOLO detector (for low-density areas)."""
    yolo = get_yolo_detector()
    if not yolo:
        raise HTTPException(
            status_code=503,
            detail="YOLO detector not available. Install ultralytics: pip install ultralytics"
        )
    
    try:
        frame = decode_image(request.photoDataUri)
        result = yolo.detect(frame)
        
        density_per_sqm = result.person_count / request.area_sqm if request.area_sqm > 0 else 0
        
        if density_per_sqm < 0.5:
            density_level = "LOW"
        elif density_per_sqm < 1.5:
            density_level = "MEDIUM"
        elif density_per_sqm < 3.0:
            density_level = "HIGH"
        else:
            density_level = "CRITICAL"
        
        return AnalyzeResponse(
            crowdCount=result.person_count,
            riskLevel=classify_risk_level(density_level),
            analysis=generate_analysis(result.person_count, density_level, density_per_sqm),
            densityPerSqm=round(density_per_sqm, 2),
            processingTimeMs=round(result.processing_time_ms, 1)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YOLO detection failed: {e}")


def main():
    """Run the API server."""
    import uvicorn
    print("Starting Crowd Density API Server...")
    print("=" * 60)
    print("Endpoints:")
    print("  GET  /         - Health check and model status")
    print("  POST /analyze  - Analyze crowd density from image")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
