"""
Crowd Density Inference Engine
==============================
Real-time inference using CSRNet for crowd counting.
"""

import time
from dataclasses import dataclass, field
from typing import Optional, Dict, List, Tuple, Union
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn

from ..models import CSRNet, load_csrnet_model
from ..preprocessing import preprocess_frame, CSRNetTransform


@dataclass
class InferenceResult:
    """
    Results from crowd density inference.
    
    Attributes:
        crowd_count: Estimated number of people in frame
        density_map: Raw density map from model [H', W']
        density_per_sqm: Average density (people per square meter)
        density_level: Classification (LOW/MEDIUM/HIGH/CRITICAL)
        processing_time_ms: Time taken for inference
        frame_shape: Original frame dimensions (H, W)
        timestamp: Unix timestamp of inference
    """
    crowd_count: float
    density_map: np.ndarray
    density_per_sqm: float
    density_level: str
    processing_time_ms: float
    frame_shape: Tuple[int, int]
    timestamp: float
    
    # Additional statistics
    max_density: float = 0.0
    min_density: float = 0.0
    std_density: float = 0.0
    
    def to_dict(self) -> dict:
        """Convert to JSON-serializable dictionary."""
        return {
            "crowd_count": round(self.crowd_count, 1),
            "density_per_sqm": round(self.density_per_sqm, 2),
            "density_level": self.density_level,
            "processing_time_ms": round(self.processing_time_ms, 1),
            "frame_shape": list(self.frame_shape),
            "timestamp": self.timestamp,
            "max_density": round(self.max_density, 2),
            "min_density": round(self.min_density, 2),
            "std_density": round(self.std_density, 2)
        }


@dataclass
class EngineConfig:
    """Configuration for the inference engine."""
    # Model settings
    model_type: str = "standard"  # "standard" or "lite"
    weights_path: Optional[str] = None
    
    # Preprocessing
    scale_factor: float = 0.5  # Resize input (0.5 = half size)
    target_size: Optional[Tuple[int, int]] = None
    
    # Area calibration
    area_sqm: float = 100.0  # Area covered by camera in square meters
    
    # Density thresholds (people per square meter)
    density_thresholds: Dict[str, float] = field(default_factory=lambda: {
        "LOW": 0.5,      # < 0.5 people/sqm
        "MEDIUM": 1.5,   # 0.5 - 1.5 people/sqm
        "HIGH": 3.0,     # 1.5 - 3.0 people/sqm
        "CRITICAL": 5.0  # > 3.0 people/sqm (safety concern)
    })
    
    # Performance
    use_cuda: bool = True
    use_half_precision: bool = False  # FP16 for faster inference
    
    # Smoothing
    enable_smoothing: bool = True
    smoothing_window: int = 5  # Number of frames for temporal smoothing


class CrowdDensityEngine:
    """
    Real-time crowd density estimation engine.
    
    Features:
    - CSRNet-based density estimation
    - Configurable preprocessing
    - Density classification
    - Temporal smoothing for stable counts
    
    Example:
        ```python
        engine = CrowdDensityEngine()
        
        for frame in video_source.frames():
            result = engine.process(frame)
            print(f"Count: {result.crowd_count}, Level: {result.density_level}")
        ```
    """
    
    def __init__(self, config: Optional[EngineConfig] = None):
        """
        Initialize the inference engine.
        
        Args:
            config: Engine configuration (uses defaults if None)
        """
        self.config = config or EngineConfig()
        self._setup_device()
        self._load_model()
        self._setup_transform()
        
        # For temporal smoothing
        self._count_history: List[float] = []
        
        # Performance tracking
        self._inference_times: List[float] = []
    
    def _setup_device(self):
        """Setup computation device (CUDA/CPU)."""
        if self.config.use_cuda and torch.cuda.is_available():
            self.device = torch.device("cuda")
            print(f"Using CUDA: {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            print("Using CPU")
    
    def _load_model(self):
        """Load the CSRNet model."""
        print(f"Loading {self.config.model_type} model...")
        
        self.model = load_csrnet_model(
            weights_path=self.config.weights_path,
            model_type=self.config.model_type,
            device=self.device
        )
        
        # Use half precision if enabled (GPU only)
        if self.config.use_half_precision and self.device.type == "cuda":
            self.model = self.model.half()
            print("Using FP16 precision")
        
        self.model.eval()
    
    def _setup_transform(self):
        """Setup preprocessing transform."""
        self.transform = CSRNetTransform(
            target_size=self.config.target_size,
            scale_factor=self.config.scale_factor,
            device=self.device
        )
    
    @torch.no_grad()
    def process(
        self,
        frame: np.ndarray,
        area_sqm: Optional[float] = None
    ) -> InferenceResult:
        """
        Process a single frame and return crowd density results.
        
        Args:
            frame: BGR image from OpenCV [H, W, 3]
            area_sqm: Override area in square meters (uses config default if None)
            
        Returns:
            InferenceResult with count, density map, and classification
        """
        start_time = time.perf_counter()
        
        # Use provided area or config default
        area = area_sqm if area_sqm is not None else self.config.area_sqm
        
        # Preprocess
        tensor, preprocess_info = self.transform(frame)
        
        # Handle half precision
        if self.config.use_half_precision and self.device.type == "cuda":
            tensor = tensor.half()
        
        # Model inference
        density_map = self.model(tensor)
        
        # Get crowd count (sum of density map)
        raw_count = density_map.sum().item()
        
        # Apply temporal smoothing
        if self.config.enable_smoothing:
            smoothed_count = self._smooth_count(raw_count)
        else:
            smoothed_count = raw_count
        
        # Convert density map to numpy
        density_np = density_map[0, 0].cpu().numpy()
        
        # Calculate density per square meter
        density_per_sqm = smoothed_count / area if area > 0 else 0
        
        # Classify density level
        density_level = self._classify_density(density_per_sqm)
        
        # Calculate statistics
        max_density = float(density_np.max())
        min_density = float(density_np.min())
        std_density = float(density_np.std())
        
        # Processing time
        processing_time = (time.perf_counter() - start_time) * 1000
        self._inference_times.append(processing_time)
        
        return InferenceResult(
            crowd_count=smoothed_count,
            density_map=density_np,
            density_per_sqm=density_per_sqm,
            density_level=density_level,
            processing_time_ms=processing_time,
            frame_shape=preprocess_info["original_shape"],
            timestamp=time.time(),
            max_density=max_density,
            min_density=min_density,
            std_density=std_density
        )
    
    def _smooth_count(self, count: float) -> float:
        """Apply temporal smoothing to crowd count."""
        self._count_history.append(count)
        
        # Keep only recent history
        if len(self._count_history) > self.config.smoothing_window:
            self._count_history = self._count_history[-self.config.smoothing_window:]
        
        # Return moving average
        return sum(self._count_history) / len(self._count_history)
    
    def _classify_density(self, density_per_sqm: float) -> str:
        """
        Classify density level based on thresholds.
        
        Density levels (industry standard for crowd safety):
        - LOW: Comfortable movement, < 0.5 people/sqm
        - MEDIUM: Normal crowd, 0.5 - 1.5 people/sqm
        - HIGH: Dense crowd, limited movement, 1.5 - 3.0 people/sqm
        - CRITICAL: Safety concern, > 3.0 people/sqm
        """
        thresholds = self.config.density_thresholds
        
        if density_per_sqm < thresholds["LOW"]:
            return "LOW"
        elif density_per_sqm < thresholds["MEDIUM"]:
            return "MEDIUM"
        elif density_per_sqm < thresholds["HIGH"]:
            return "HIGH"
        else:
            return "CRITICAL"
    
    def reset_smoothing(self):
        """Reset temporal smoothing history."""
        self._count_history.clear()
    
    @property
    def average_inference_time(self) -> float:
        """Get average inference time in milliseconds."""
        if not self._inference_times:
            return 0.0
        return sum(self._inference_times) / len(self._inference_times)
    
    @property
    def fps(self) -> float:
        """Get estimated inference FPS."""
        avg_time = self.average_inference_time
        if avg_time == 0:
            return 0.0
        return 1000.0 / avg_time
    
    def get_performance_stats(self) -> dict:
        """Get performance statistics."""
        return {
            "average_inference_ms": round(self.average_inference_time, 2),
            "estimated_fps": round(self.fps, 1),
            "device": str(self.device),
            "model_type": self.config.model_type,
            "using_half_precision": self.config.use_half_precision,
            "total_frames_processed": len(self._inference_times)
        }
    
    def warmup(self, num_iterations: int = 5):
        """
        Warm up the model with dummy inputs.
        
        Useful for getting stable inference times on GPU.
        
        Args:
            num_iterations: Number of warmup iterations
        """
        print("Warming up model...")
        
        # Create dummy input
        dummy = np.zeros((480, 640, 3), dtype=np.uint8)
        
        for _ in range(num_iterations):
            self.process(dummy)
        
        # Clear history after warmup
        self._inference_times.clear()
        self._count_history.clear()
        
        print(f"Warmup complete. Average inference: {self.average_inference_time:.1f}ms")


def create_engine(
    weights_path: Optional[str] = None,
    area_sqm: float = 100.0,
    scale_factor: float = 0.5,
    use_lite_model: bool = False
) -> CrowdDensityEngine:
    """
    Factory function to create a configured inference engine.
    
    Args:
        weights_path: Path to model weights (optional)
        area_sqm: Area covered by camera in square meters
        scale_factor: Input resize factor (0.5 = half size)
        use_lite_model: Use lightweight model for faster inference
        
    Returns:
        Configured CrowdDensityEngine instance
    """
    config = EngineConfig(
        model_type="lite" if use_lite_model else "standard",
        weights_path=weights_path,
        scale_factor=scale_factor,
        area_sqm=area_sqm
    )
    
    return CrowdDensityEngine(config)
