"""
YOLOv8 People Detection (Optional)
==================================
Optional module for using YOLOv8 in low-density validation zones.

YOLOv8 is better suited for:
- Low-density areas (< 20 people)
- Entry/exit validation zones
- Individual person tracking

CSRNet is better for:
- Dense crowds (> 50 people)
- Highly occluded scenes
- Density estimation without tracking

This module uses Ultralytics YOLOv8 (AGPL-3.0 license).
Free for non-commercial use.

Installation:
    pip install ultralytics
"""

from typing import Optional, List, Tuple, Dict
from dataclasses import dataclass
import numpy as np

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


@dataclass
class PersonDetection:
    """A single person detection."""
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    class_id: int = 0  # 0 = person in COCO


@dataclass 
class DetectionResult:
    """Results from YOLO person detection."""
    detections: List[PersonDetection]
    person_count: int
    processing_time_ms: float
    frame_shape: Tuple[int, int]
    
    def to_dict(self) -> dict:
        return {
            "person_count": self.person_count,
            "processing_time_ms": round(self.processing_time_ms, 1),
            "detections": [
                {
                    "bbox": d.bbox,
                    "confidence": round(d.confidence, 2)
                }
                for d in self.detections
            ]
        }


class YOLOv8Detector:
    """
    YOLOv8-based person detector for low-density zones.
    
    Best used for:
    - Entry/exit counting
    - Low-density validation
    - Individual detection (< 50 people)
    
    Example:
        ```python
        detector = YOLOv8Detector()
        
        result = detector.detect(frame)
        print(f"People detected: {result.person_count}")
        
        # Draw detections
        frame_with_boxes = detector.draw_detections(frame, result)
        ```
    """
    
    def __init__(
        self,
        model_size: str = "n",  # n, s, m, l, x
        confidence_threshold: float = 0.5,
        device: Optional[str] = None
    ):
        """
        Initialize YOLOv8 detector.
        
        Args:
            model_size: YOLO model size ('n', 's', 'm', 'l', 'x')
                        Smaller = faster, larger = more accurate
            confidence_threshold: Minimum detection confidence
            device: Device to run on ('cpu', 'cuda', or None for auto)
        """
        if not YOLO_AVAILABLE:
            raise ImportError(
                "ultralytics package not installed. "
                "Install with: pip install ultralytics"
            )
        
        self.confidence_threshold = confidence_threshold
        self.device = device
        
        # Load pretrained YOLO model
        model_name = f"yolov8{model_size}.pt"
        print(f"Loading YOLOv8 model: {model_name}")
        self.model = YOLO(model_name)
        
        # Person class ID in COCO dataset
        self.person_class_id = 0
    
    def detect(
        self,
        frame: np.ndarray,
        classes: Optional[List[int]] = None
    ) -> DetectionResult:
        """
        Detect people in frame.
        
        Args:
            frame: BGR image from OpenCV
            classes: Classes to detect (default: [0] for person only)
            
        Returns:
            DetectionResult with person count and bounding boxes
        """
        import time
        start = time.perf_counter()
        
        # Default to person class only
        if classes is None:
            classes = [self.person_class_id]
        
        # Run inference
        results = self.model(
            frame,
            classes=classes,
            conf=self.confidence_threshold,
            device=self.device,
            verbose=False
        )
        
        # Extract detections
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                
                if class_id == self.person_class_id:
                    detections.append(PersonDetection(
                        bbox=(x1, y1, x2, y2),
                        confidence=confidence,
                        class_id=class_id
                    ))
        
        processing_time = (time.perf_counter() - start) * 1000
        
        return DetectionResult(
            detections=detections,
            person_count=len(detections),
            processing_time_ms=processing_time,
            frame_shape=frame.shape[:2]
        )
    
    def draw_detections(
        self,
        frame: np.ndarray,
        result: DetectionResult,
        color: Tuple[int, int, int] = (0, 255, 0),
        thickness: int = 2,
        show_confidence: bool = True
    ) -> np.ndarray:
        """
        Draw detection boxes on frame.
        
        Args:
            frame: Input frame
            result: Detection result
            color: Box color (BGR)
            thickness: Line thickness
            show_confidence: Show confidence scores
            
        Returns:
            Frame with drawn detections
        """
        import cv2
        
        output = frame.copy()
        
        for det in result.detections:
            x1, y1, x2, y2 = det.bbox
            
            # Draw box
            cv2.rectangle(output, (x1, y1), (x2, y2), color, thickness)
            
            # Label
            if show_confidence:
                label = f"Person {det.confidence:.2f}"
                cv2.putText(
                    output, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2
                )
        
        # Count overlay
        cv2.putText(
            output, f"Count: {result.person_count}",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2
        )
        
        return output


class HybridCrowdCounter:
    """
    Hybrid counter combining CSRNet and YOLOv8.
    
    Uses YOLOv8 for low-density areas (more accurate for individuals)
    and CSRNet for high-density areas (better for crowds).
    
    Example:
        ```python
        hybrid = HybridCrowdCounter(
            csrnet_engine=engine,
            yolo_threshold=30  # Use YOLO when < 30 people
        )
        
        result = hybrid.count(frame)
        print(f"Method used: {result['method']}")
        print(f"Count: {result['count']}")
        ```
    """
    
    def __init__(
        self,
        csrnet_engine,
        yolo_detector: Optional[YOLOv8Detector] = None,
        density_threshold: float = 30,
        area_sqm: float = 100.0
    ):
        """
        Initialize hybrid counter.
        
        Args:
            csrnet_engine: CrowdDensityEngine instance
            yolo_detector: YOLOv8Detector instance (created if None)
            density_threshold: Use YOLO when estimated count < threshold
            area_sqm: Area for density calculation
        """
        self.csrnet = csrnet_engine
        self.yolo = yolo_detector
        self.density_threshold = density_threshold
        self.area_sqm = area_sqm
        
        self._last_method = None
    
    def count(
        self,
        frame: np.ndarray,
        force_method: Optional[str] = None
    ) -> Dict:
        """
        Count people using appropriate method.
        
        Args:
            frame: Input frame
            force_method: Force 'csrnet' or 'yolo' (None for auto)
            
        Returns:
            Dictionary with count and method used
        """
        if force_method == "yolo" or (
            force_method is None and self._should_use_yolo(frame)
        ):
            return self._count_with_yolo(frame)
        else:
            return self._count_with_csrnet(frame)
    
    def _should_use_yolo(self, frame: np.ndarray) -> bool:
        """Decide whether to use YOLO based on initial CSRNet estimate."""
        # Quick CSRNet estimate
        result = self.csrnet.process(frame, area_sqm=self.area_sqm)
        
        # Use YOLO for low-density scenes
        return result.crowd_count < self.density_threshold
    
    def _count_with_csrnet(self, frame: np.ndarray) -> Dict:
        """Count using CSRNet."""
        result = self.csrnet.process(frame, area_sqm=self.area_sqm)
        self._last_method = "csrnet"
        
        return {
            "count": result.crowd_count,
            "method": "csrnet",
            "density_level": result.density_level,
            "density_per_sqm": result.density_per_sqm,
            "processing_time_ms": result.processing_time_ms
        }
    
    def _count_with_yolo(self, frame: np.ndarray) -> Dict:
        """Count using YOLO."""
        if self.yolo is None:
            if not YOLO_AVAILABLE:
                # Fallback to CSRNet
                return self._count_with_csrnet(frame)
            self.yolo = YOLOv8Detector(model_size="n")
        
        result = self.yolo.detect(frame)
        self._last_method = "yolo"
        
        density_per_sqm = result.person_count / self.area_sqm
        
        return {
            "count": result.person_count,
            "method": "yolo",
            "density_level": self._classify_density(density_per_sqm),
            "density_per_sqm": density_per_sqm,
            "processing_time_ms": result.processing_time_ms,
            "detections": result.detections
        }
    
    def _classify_density(self, density: float) -> str:
        """Simple density classification."""
        if density < 0.5:
            return "LOW"
        elif density < 1.5:
            return "MEDIUM"
        elif density < 3.0:
            return "HIGH"
        else:
            return "CRITICAL"


def check_yolo_available() -> bool:
    """Check if YOLO is available."""
    return YOLO_AVAILABLE
