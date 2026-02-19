"""
Density Analyzer Module
=======================
Advanced density analysis and classification.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple
import numpy as np


class DensityLevel(Enum):
    """
    Crowd density classification levels.
    
    Based on industry standards for crowd safety management:
    - FREE_FLOW: Open space, unrestricted movement
    - LOW: Comfortable walking, easy navigation
    - MEDIUM: Normal crowd, some navigation needed
    - HIGH: Dense crowd, limited movement
    - CRITICAL: Safety concern, risk of crowd crush
    """
    FREE_FLOW = "FREE_FLOW"  # < 0.3 people/sqm
    LOW = "LOW"              # 0.3 - 0.5 people/sqm
    MEDIUM = "MEDIUM"        # 0.5 - 1.5 people/sqm
    HIGH = "HIGH"            # 1.5 - 3.0 people/sqm
    CRITICAL = "CRITICAL"    # > 3.0 people/sqm
    
    @property
    def color_rgb(self) -> Tuple[int, int, int]:
        """Get RGB color for visualization."""
        colors = {
            DensityLevel.FREE_FLOW: (0, 200, 0),    # Green
            DensityLevel.LOW: (100, 200, 100),       # Light green
            DensityLevel.MEDIUM: (255, 200, 0),      # Yellow
            DensityLevel.HIGH: (255, 100, 0),        # Orange
            DensityLevel.CRITICAL: (255, 0, 0),      # Red
        }
        return colors[self]
    
    @property
    def description(self) -> str:
        """Get human-readable description."""
        descriptions = {
            DensityLevel.FREE_FLOW: "Open space, free movement",
            DensityLevel.LOW: "Comfortable walking space",
            DensityLevel.MEDIUM: "Normal crowd density",
            DensityLevel.HIGH: "Dense crowd, limited movement",
            DensityLevel.CRITICAL: "SAFETY ALERT: Very high density",
        }
        return descriptions[self]


@dataclass
class DensityStats:
    """
    Statistical analysis of density distribution.
    
    Provides insights into crowd distribution patterns.
    """
    total_count: float
    density_per_sqm: float
    level: DensityLevel
    
    # Distribution statistics
    mean_density: float
    max_density: float
    min_density: float
    std_density: float
    
    # Hotspot analysis
    hotspot_count: int  # Number of high-density regions
    hotspot_percentage: float  # Percentage of area that's high density
    
    # Safety metrics
    critical_area_percentage: float  # Percentage of area in critical state
    estimated_flow_rate: float  # Estimated people movement rate
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "total_count": round(self.total_count, 1),
            "density_per_sqm": round(self.density_per_sqm, 3),
            "level": self.level.value,
            "mean_density": round(self.mean_density, 4),
            "max_density": round(self.max_density, 4),
            "min_density": round(self.min_density, 4),
            "std_density": round(self.std_density, 4),
            "hotspot_count": self.hotspot_count,
            "hotspot_percentage": round(self.hotspot_percentage, 2),
            "critical_area_percentage": round(self.critical_area_percentage, 2),
            "safety_status": "OK" if self.level != DensityLevel.CRITICAL else "WARNING"
        }


class DensityAnalyzer:
    """
    Advanced density analysis from CSRNet output.
    
    Provides:
    - Detailed statistics
    - Zone-based analysis
    - Hotspot detection
    - Safety assessments
    
    Example:
        ```python
        analyzer = DensityAnalyzer(area_sqm=100)
        
        # From inference result
        stats = analyzer.analyze(density_map, crowd_count)
        
        print(f"Level: {stats.level.value}")
        print(f"Hotspots: {stats.hotspot_count}")
        ```
    """
    
    # Default thresholds (people per square meter)
    DEFAULT_THRESHOLDS = {
        DensityLevel.FREE_FLOW: 0.3,
        DensityLevel.LOW: 0.5,
        DensityLevel.MEDIUM: 1.5,
        DensityLevel.HIGH: 3.0,
        DensityLevel.CRITICAL: float('inf')
    }
    
    def __init__(
        self,
        area_sqm: float = 100.0,
        thresholds: Optional[Dict[DensityLevel, float]] = None
    ):
        """
        Initialize analyzer.
        
        Args:
            area_sqm: Area covered by camera in square meters
            thresholds: Custom density thresholds per level
        """
        self.area_sqm = area_sqm
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS.copy()
    
    def analyze(
        self,
        density_map: np.ndarray,
        crowd_count: Optional[float] = None
    ) -> DensityStats:
        """
        Perform comprehensive density analysis.
        
        Args:
            density_map: Density map from CSRNet [H, W]
            crowd_count: Pre-computed count (computed from map if None)
            
        Returns:
            DensityStats with full analysis
        """
        # Ensure 2D
        if density_map.ndim == 3:
            density_map = density_map[0]
        
        # Basic stats
        total = crowd_count if crowd_count is not None else float(density_map.sum())
        density_per_sqm = total / self.area_sqm if self.area_sqm > 0 else 0
        
        mean_density = float(density_map.mean())
        max_density = float(density_map.max())
        min_density = float(density_map.min())
        std_density = float(density_map.std())
        
        # Classify overall level
        level = self._classify_density(density_per_sqm)
        
        # Hotspot analysis
        hotspot_threshold = mean_density + 2 * std_density
        hotspot_mask = density_map > hotspot_threshold
        hotspot_count = self._count_connected_components(hotspot_mask)
        hotspot_percentage = (hotspot_mask.sum() / density_map.size) * 100
        
        # Critical area analysis
        # Scale density map values to people/sqm for per-pixel analysis
        pixels = density_map.size
        area_per_pixel = self.area_sqm / pixels
        density_per_pixel_sqm = density_map / area_per_pixel if area_per_pixel > 0 else density_map
        
        critical_threshold = self.thresholds[DensityLevel.HIGH]
        critical_mask = density_per_pixel_sqm > critical_threshold
        critical_area_percentage = (critical_mask.sum() / pixels) * 100
        
        # Estimate flow rate (simplified model)
        # Higher density = lower flow rate
        base_flow = 1.5  # people/meter/second at free flow
        flow_factor = max(0.1, 1 - (density_per_sqm / 5))
        estimated_flow_rate = base_flow * flow_factor
        
        return DensityStats(
            total_count=total,
            density_per_sqm=density_per_sqm,
            level=level,
            mean_density=mean_density,
            max_density=max_density,
            min_density=min_density,
            std_density=std_density,
            hotspot_count=hotspot_count,
            hotspot_percentage=hotspot_percentage,
            critical_area_percentage=critical_area_percentage,
            estimated_flow_rate=estimated_flow_rate
        )
    
    def _classify_density(self, density_per_sqm: float) -> DensityLevel:
        """Classify density into level."""
        if density_per_sqm < self.thresholds[DensityLevel.FREE_FLOW]:
            return DensityLevel.FREE_FLOW
        elif density_per_sqm < self.thresholds[DensityLevel.LOW]:
            return DensityLevel.LOW
        elif density_per_sqm < self.thresholds[DensityLevel.MEDIUM]:
            return DensityLevel.MEDIUM
        elif density_per_sqm < self.thresholds[DensityLevel.HIGH]:
            return DensityLevel.HIGH
        else:
            return DensityLevel.CRITICAL
    
    def _count_connected_components(self, mask: np.ndarray) -> int:
        """Count connected high-density regions."""
        try:
            import cv2
            mask_uint8 = (mask * 255).astype(np.uint8)
            num_labels, _ = cv2.connectedComponents(mask_uint8)
            return max(0, num_labels - 1)  # Exclude background
        except:
            # Fallback: estimate from thresholded regions
            return int(mask.sum() > 0)
    
    def analyze_zones(
        self,
        density_map: np.ndarray,
        zone_grid: Tuple[int, int] = (3, 3)
    ) -> List[Dict]:
        """
        Analyze density by zones (grid-based).
        
        Divides the frame into a grid and analyzes each zone.
        
        Args:
            density_map: Density map [H, W]
            zone_grid: Grid dimensions (rows, cols)
            
        Returns:
            List of zone analysis dictionaries
        """
        if density_map.ndim == 3:
            density_map = density_map[0]
        
        rows, cols = zone_grid
        h, w = density_map.shape
        
        zone_h = h // rows
        zone_w = w // cols
        
        zone_area = self.area_sqm / (rows * cols)
        
        zones = []
        for i in range(rows):
            for j in range(cols):
                y1, y2 = i * zone_h, (i + 1) * zone_h
                x1, x2 = j * zone_w, (j + 1) * zone_w
                
                zone_map = density_map[y1:y2, x1:x2]
                zone_count = float(zone_map.sum())
                zone_density = zone_count / zone_area if zone_area > 0 else 0
                
                zone_level = self._classify_density(zone_density)
                
                zones.append({
                    "zone_id": f"zone_{i}_{j}",
                    "row": i,
                    "col": j,
                    "bounds": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                    "count": round(zone_count, 1),
                    "density_per_sqm": round(zone_density, 3),
                    "level": zone_level.value,
                    "color": zone_level.color_rgb
                })
        
        return zones
    
    def get_safety_assessment(self, stats: DensityStats) -> Dict:
        """
        Generate safety assessment from density stats.
        
        Returns:
            Dictionary with safety status and recommendations
        """
        assessment = {
            "overall_status": "SAFE",
            "risk_level": 0,  # 0-100
            "alerts": [],
            "recommendations": []
        }
        
        # Calculate risk level
        risk_level = min(100, (stats.density_per_sqm / 5) * 100)
        assessment["risk_level"] = round(risk_level)
        
        # Check conditions
        if stats.level == DensityLevel.CRITICAL:
            assessment["overall_status"] = "CRITICAL"
            assessment["alerts"].append("Crowd density exceeds safe limits!")
            assessment["recommendations"].append("Initiate crowd control measures")
            assessment["recommendations"].append("Open additional exit points")
        elif stats.level == DensityLevel.HIGH:
            assessment["overall_status"] = "WARNING"
            assessment["alerts"].append("High crowd density detected")
            assessment["recommendations"].append("Monitor situation closely")
            assessment["recommendations"].append("Prepare crowd control personnel")
        
        if stats.hotspot_percentage > 10:
            assessment["alerts"].append(f"Hotspots detected: {stats.hotspot_count} areas")
            assessment["recommendations"].append("Disperse crowd from hotspot areas")
        
        if stats.critical_area_percentage > 5:
            assessment["alerts"].append(
                f"{stats.critical_area_percentage:.1f}% of area at critical density"
            )
        
        return assessment
