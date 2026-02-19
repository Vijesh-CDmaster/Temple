"""
Camera Calibration Module
=========================
Tools for camera area calibration and pixel-to-real-world conversion.

For accurate crowd density measurement, we need to know how much
real-world area each pixel (or density map region) represents.

Calibration Methods:
1. Manual Reference Points - Using known distances in the scene
2. Camera Height Estimation - Using camera mounting height and angle
3. Predefined Presets - For common camera setups
"""

import json
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Dict
from pathlib import Path
import math

import numpy as np


@dataclass
class CalibrationPoint:
    """
    A calibration point with pixel and real-world coordinates.
    
    Used for perspective transformation and area calculation.
    """
    # Pixel coordinates (in original frame)
    pixel_x: int
    pixel_y: int
    
    # Real-world coordinates (in meters, from a reference origin)
    world_x: float
    world_y: float
    
    # Optional label
    label: str = ""


@dataclass
class CameraCalibration:
    """
    Camera calibration data for a specific camera/area.
    
    Stores all necessary information to convert pixel coordinates
    to real-world measurements for crowd density calculation.
    
    Attributes:
        camera_id: Unique identifier for the camera
        area_name: Human-readable name (e.g., "Main Gate")
        frame_width: Video frame width in pixels
        frame_height: Video frame height in pixels
        total_area_sqm: Total area covered by camera in square meters
        calibration_points: Reference points for perspective correction
        
    Example:
        ```python
        # Create calibration for a camera covering 100 sqm
        calib = CameraCalibration(
            camera_id="cam_main_gate",
            area_name="Main Gate",
            frame_width=1920,
            frame_height=1080,
            total_area_sqm=100
        )
        
        # Calculate density
        pixels_per_sqm = calib.get_pixels_per_sqm()
        ```
    """
    camera_id: str
    area_name: str
    frame_width: int
    frame_height: int
    total_area_sqm: float
    
    # Camera physical setup (optional, for advanced calibration)
    camera_height_m: float = 0.0  # Height of camera from ground
    camera_tilt_deg: float = 0.0  # Tilt angle (0 = horizontal, 90 = straight down)
    camera_fov_deg: float = 70.0  # Horizontal field of view
    
    # Calibration points (for perspective correction)
    calibration_points: List[CalibrationPoint] = None
    
    # Perspective transformation matrix (computed from calibration points)
    _transform_matrix: Optional[np.ndarray] = None
    
    def __post_init__(self):
        if self.calibration_points is None:
            self.calibration_points = []
    
    @property
    def frame_area_pixels(self) -> int:
        """Total frame area in pixels."""
        return self.frame_width * self.frame_height
    
    @property
    def pixels_per_sqm(self) -> float:
        """
        Average pixels per square meter.
        
        Note: This is a rough average. Due to perspective, 
        different regions may have different pixel densities.
        """
        if self.total_area_sqm <= 0:
            return 0.0
        return self.frame_area_pixels / self.total_area_sqm
    
    @property
    def sqm_per_pixel(self) -> float:
        """Square meters per pixel."""
        if self.frame_area_pixels <= 0:
            return 0.0
        return self.total_area_sqm / self.frame_area_pixels
    
    def get_density_map_area(
        self,
        density_map_shape: Tuple[int, int]
    ) -> float:
        """
        Get the area represented by each density map cell.
        
        CSRNet typically downsamples by 8x, so the density map
        is smaller than the input frame.
        
        Args:
            density_map_shape: Shape of density map (H, W)
            
        Returns:
            Area per density map cell in square meters
        """
        dm_h, dm_w = density_map_shape
        num_cells = dm_h * dm_w
        
        if num_cells <= 0:
            return 0.0
        
        return self.total_area_sqm / num_cells
    
    def pixel_to_world(
        self,
        pixel_x: int,
        pixel_y: int
    ) -> Tuple[float, float]:
        """
        Convert pixel coordinates to approximate world coordinates.
        
        This is a simplified linear mapping. For more accurate
        results, use perspective calibration with multiple reference points.
        
        Args:
            pixel_x: X coordinate in frame
            pixel_y: Y coordinate in frame
            
        Returns:
            Tuple of (world_x, world_y) in meters
        """
        if self._transform_matrix is not None:
            # Use perspective transform if available
            point = np.array([[[pixel_x, pixel_y]]], dtype=np.float32)
            import cv2
            transformed = cv2.perspectiveTransform(point, self._transform_matrix)
            return float(transformed[0, 0, 0]), float(transformed[0, 0, 1])
        
        # Simple linear mapping as fallback
        # Assumes rectangular area with origin at top-left
        width_m = math.sqrt(self.total_area_sqm * self.frame_width / self.frame_height)
        height_m = self.total_area_sqm / width_m
        
        world_x = (pixel_x / self.frame_width) * width_m
        world_y = (pixel_y / self.frame_height) * height_m
        
        return world_x, world_y
    
    def compute_perspective_transform(self):
        """
        Compute perspective transformation matrix from calibration points.
        
        Requires at least 4 calibration points.
        """
        if len(self.calibration_points) < 4:
            print("Warning: Need at least 4 calibration points for perspective transform")
            return
        
        import cv2
        
        # Extract pixel and world coordinates
        src_points = np.array([
            [p.pixel_x, p.pixel_y] for p in self.calibration_points[:4]
        ], dtype=np.float32)
        
        dst_points = np.array([
            [p.world_x, p.world_y] for p in self.calibration_points[:4]
        ], dtype=np.float32)
        
        self._transform_matrix = cv2.getPerspectiveTransform(src_points, dst_points)
        print("Perspective transform matrix computed")
    
    def save(self, filepath: str):
        """Save calibration to JSON file."""
        data = {
            "camera_id": self.camera_id,
            "area_name": self.area_name,
            "frame_width": self.frame_width,
            "frame_height": self.frame_height,
            "total_area_sqm": self.total_area_sqm,
            "camera_height_m": self.camera_height_m,
            "camera_tilt_deg": self.camera_tilt_deg,
            "camera_fov_deg": self.camera_fov_deg,
            "calibration_points": [asdict(p) for p in self.calibration_points]
        }
        
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Calibration saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str) -> "CameraCalibration":
        """Load calibration from JSON file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        calib_points = [
            CalibrationPoint(**p) for p in data.get("calibration_points", [])
        ]
        
        calib = cls(
            camera_id=data["camera_id"],
            area_name=data["area_name"],
            frame_width=data["frame_width"],
            frame_height=data["frame_height"],
            total_area_sqm=data["total_area_sqm"],
            camera_height_m=data.get("camera_height_m", 0),
            camera_tilt_deg=data.get("camera_tilt_deg", 0),
            camera_fov_deg=data.get("camera_fov_deg", 70),
            calibration_points=calib_points
        )
        
        if len(calib_points) >= 4:
            calib.compute_perspective_transform()
        
        return calib


def calibrate_from_reference(
    frame_width: int,
    frame_height: int,
    reference_distance_pixels: float,
    reference_distance_meters: float,
    camera_id: str = "default",
    area_name: str = "Default Area"
) -> CameraCalibration:
    """
    Quick calibration using a known reference distance.
    
    This is the simplest calibration method - measure a known distance
    in the image (e.g., a floor tile that's 0.3m) and provide both
    the pixel and real-world measurements.
    
    Args:
        frame_width: Video frame width
        frame_height: Video frame height
        reference_distance_pixels: Distance in pixels
        reference_distance_meters: Same distance in meters
        camera_id: Camera identifier
        area_name: Area name
        
    Returns:
        CameraCalibration object
        
    Example:
        ```python
        # If a 1-meter reference object is 100 pixels in the image
        calib = calibrate_from_reference(
            frame_width=1920,
            frame_height=1080,
            reference_distance_pixels=100,
            reference_distance_meters=1.0
        )
        ```
    """
    # Calculate meters per pixel
    meters_per_pixel = reference_distance_meters / reference_distance_pixels
    
    # Calculate total area
    total_area = (frame_width * meters_per_pixel) * (frame_height * meters_per_pixel)
    
    return CameraCalibration(
        camera_id=camera_id,
        area_name=area_name,
        frame_width=frame_width,
        frame_height=frame_height,
        total_area_sqm=total_area
    )


def estimate_area_from_height(
    frame_width: int,
    frame_height: int,
    camera_height_m: float,
    camera_tilt_deg: float = 45,
    horizontal_fov_deg: float = 70,
    camera_id: str = "default",
    area_name: str = "Default Area"
) -> CameraCalibration:
    """
    Estimate covered area from camera mounting parameters.
    
    Uses camera height, tilt angle, and field of view to estimate
    the ground area visible in the frame.
    
    This is useful when you know the camera's physical setup but
    can't directly measure distances in the scene.
    
    Args:
        frame_width: Video frame width
        frame_height: Video frame height
        camera_height_m: Camera height above ground in meters
        camera_tilt_deg: Tilt angle (0 = horizontal, 90 = straight down)
        horizontal_fov_deg: Horizontal field of view in degrees
        camera_id: Camera identifier
        area_name: Area name
        
    Returns:
        CameraCalibration object
        
    Example:
        ```python
        # Camera mounted at 5m height, tilted 60 degrees down
        calib = estimate_area_from_height(
            frame_width=1920,
            frame_height=1080,
            camera_height_m=5.0,
            camera_tilt_deg=60,
            horizontal_fov_deg=70
        )
        print(f"Estimated area: {calib.total_area_sqm:.1f} sqm")
        ```
    """
    # Convert to radians
    tilt_rad = math.radians(camera_tilt_deg)
    h_fov_rad = math.radians(horizontal_fov_deg)
    
    # Vertical FOV (assuming 16:9 aspect ratio)
    aspect_ratio = frame_width / frame_height
    v_fov_rad = 2 * math.atan(math.tan(h_fov_rad / 2) / aspect_ratio)
    
    # Calculate ground distance to center of view
    if tilt_rad != math.pi / 2:  # Not straight down
        center_distance = camera_height_m / math.tan(tilt_rad)
    else:
        center_distance = 0
    
    # Calculate near and far distances
    near_angle = tilt_rad + v_fov_rad / 2
    far_angle = tilt_rad - v_fov_rad / 2
    
    if near_angle < math.pi / 2:
        near_distance = camera_height_m / math.tan(near_angle)
    else:
        near_distance = 0
    
    if far_angle > 0:
        far_distance = camera_height_m / math.tan(far_angle)
    else:
        far_distance = center_distance * 3  # Default to 3x center distance
    
    # Calculate average width at center distance
    avg_distance = (near_distance + far_distance) / 2
    width = 2 * avg_distance * math.tan(h_fov_rad / 2)
    
    # Calculate depth
    depth = far_distance - near_distance
    
    # Approximate area (trapezoidal assumption)
    total_area = width * depth
    
    # Clamp to reasonable values
    total_area = max(1.0, min(10000.0, total_area))
    
    return CameraCalibration(
        camera_id=camera_id,
        area_name=area_name,
        frame_width=frame_width,
        frame_height=frame_height,
        total_area_sqm=total_area,
        camera_height_m=camera_height_m,
        camera_tilt_deg=camera_tilt_deg,
        camera_fov_deg=horizontal_fov_deg
    )


# Preset calibrations for common scenarios
CALIBRATION_PRESETS: Dict[str, dict] = {
    "laptop_webcam_desk": {
        "description": "Laptop webcam viewing a desk area (~1-2 sqm)",
        "total_area_sqm": 1.5,
        "camera_height_m": 0.5,
        "camera_tilt_deg": 30
    },
    "laptop_webcam_room": {
        "description": "Laptop webcam viewing a small room (~3-5 sqm)",
        "total_area_sqm": 4.0,
        "camera_height_m": 0.5,
        "camera_tilt_deg": 15
    },
    "ceiling_camera_5m": {
        "description": "Ceiling-mounted camera at 5m height, 60deg tilt",
        "total_area_sqm": 50.0,
        "camera_height_m": 5.0,
        "camera_tilt_deg": 60
    },
    "cctv_wide_angle": {
        "description": "Standard CCTV with wide angle lens",
        "total_area_sqm": 100.0,
        "camera_height_m": 4.0,
        "camera_tilt_deg": 45
    },
    "temple_entrance": {
        "description": "Temple entrance area camera",
        "total_area_sqm": 80.0,
        "camera_height_m": 5.0,
        "camera_tilt_deg": 50
    },
    "temple_main_hall": {
        "description": "Temple main hall/courtyard camera",
        "total_area_sqm": 200.0,
        "camera_height_m": 8.0,
        "camera_tilt_deg": 60
    }
}


def get_preset_calibration(
    preset_name: str,
    frame_width: int = 1920,
    frame_height: int = 1080,
    camera_id: str = "default"
) -> CameraCalibration:
    """
    Get a preset calibration configuration.
    
    Args:
        preset_name: Name of preset (see CALIBRATION_PRESETS)
        frame_width: Video frame width
        frame_height: Video frame height
        camera_id: Camera identifier
        
    Returns:
        CameraCalibration object
        
    Available presets:
    - laptop_webcam_desk: ~1.5 sqm desk area
    - laptop_webcam_room: ~4 sqm room area
    - ceiling_camera_5m: Standard ceiling mount
    - cctv_wide_angle: Wide angle CCTV
    - temple_entrance: Temple entrance area
    - temple_main_hall: Large hall/courtyard
    """
    if preset_name not in CALIBRATION_PRESETS:
        raise ValueError(f"Unknown preset: {preset_name}. Available: {list(CALIBRATION_PRESETS.keys())}")
    
    preset = CALIBRATION_PRESETS[preset_name]
    
    return CameraCalibration(
        camera_id=camera_id,
        area_name=preset.get("description", preset_name),
        frame_width=frame_width,
        frame_height=frame_height,
        total_area_sqm=preset["total_area_sqm"],
        camera_height_m=preset.get("camera_height_m", 0),
        camera_tilt_deg=preset.get("camera_tilt_deg", 0)
    )
