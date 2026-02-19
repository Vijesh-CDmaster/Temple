"""
Heatmap Visualization
=====================
Generate and overlay density heatmaps on video frames.
"""

from typing import Optional, Tuple
import cv2
import numpy as np


# Colormap presets for density visualization
COLORMAP_PRESETS = {
    "jet": cv2.COLORMAP_JET,        # Blue (low) -> Red (high)
    "hot": cv2.COLORMAP_HOT,        # Black -> Red -> Yellow -> White
    "inferno": cv2.COLORMAP_INFERNO,# Dark purple -> Orange -> Yellow
    "turbo": cv2.COLORMAP_TURBO,    # Similar to jet, perceptually uniform
    "plasma": cv2.COLORMAP_PLASMA,  # Purple -> Yellow
}


def generate_heatmap(
    density_map: np.ndarray,
    target_size: Optional[Tuple[int, int]] = None,
    colormap: str = "jet",
    normalize: bool = True,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None
) -> np.ndarray:
    """
    Generate colored heatmap from density map.
    
    Args:
        density_map: Density map [H, W] from CSRNet
        target_size: Output size (width, height) for resizing
        colormap: Colormap name ('jet', 'hot', 'inferno', 'turbo', 'plasma')
        normalize: Whether to normalize values to [0, 255]
        min_val: Minimum value for normalization (uses min if None)
        max_val: Maximum value for normalization (uses max if None)
        
    Returns:
        BGR heatmap image [H', W', 3]
    """
    # Ensure 2D
    if density_map.ndim == 3:
        density_map = density_map[0] if density_map.shape[0] == 1 else density_map[:, :, 0]
    
    # Normalize to 0-255 range
    if normalize:
        min_v = min_val if min_val is not None else density_map.min()
        max_v = max_val if max_val is not None else density_map.max()
        
        if max_v > min_v:
            normalized = ((density_map - min_v) / (max_v - min_v) * 255)
        else:
            normalized = np.zeros_like(density_map)
        
        normalized = normalized.astype(np.uint8)
    else:
        normalized = density_map.astype(np.uint8)
    
    # Resize if target size specified
    if target_size is not None:
        normalized = cv2.resize(normalized, target_size, interpolation=cv2.INTER_LINEAR)
    
    # Apply colormap
    cmap = COLORMAP_PRESETS.get(colormap, cv2.COLORMAP_JET)
    heatmap = cv2.applyColorMap(normalized, cmap)
    
    return heatmap


def overlay_heatmap(
    frame: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.5
) -> np.ndarray:
    """
    Overlay heatmap on original frame.
    
    Args:
        frame: Original BGR frame [H, W, 3]
        heatmap: Colored heatmap [H, W, 3]
        alpha: Blending factor (0 = only frame, 1 = only heatmap)
        
    Returns:
        Blended image [H, W, 3]
    """
    # Ensure same size
    if frame.shape[:2] != heatmap.shape[:2]:
        heatmap = cv2.resize(heatmap, (frame.shape[1], frame.shape[0]))
    
    # Blend
    blended = cv2.addWeighted(frame, 1 - alpha, heatmap, alpha, 0)
    
    return blended


class DensityVisualizer:
    """
    Comprehensive density visualization utility.
    
    Features:
    - Heatmap generation with customizable colormaps
    - Frame overlay with configurable opacity
    - Zone grid visualization
    - Count annotations
    
    Example:
        ```python
        viz = DensityVisualizer(colormap="turbo", alpha=0.4)
        
        for frame, result in process_video():
            display = viz.visualize(frame, result.density_map, result.crowd_count)
            cv2.imshow("Density", display)
        ```
    """
    
    def __init__(
        self,
        colormap: str = "jet",
        alpha: float = 0.5,
        show_count: bool = True,
        show_density_bar: bool = True,
        font_scale: float = 0.8
    ):
        """
        Initialize visualizer.
        
        Args:
            colormap: Colormap for heatmap ('jet', 'hot', 'inferno', 'turbo', 'plasma')
            alpha: Overlay opacity (0-1)
            show_count: Whether to display crowd count on frame
            show_density_bar: Whether to show density color bar
            font_scale: Font size scaling factor
        """
        self.colormap = colormap
        self.alpha = alpha
        self.show_count = show_count
        self.show_density_bar = show_density_bar
        self.font_scale = font_scale
        
        # For consistent normalization across frames
        self._max_density = 0.0
        self._adaptive_max = True
    
    def set_fixed_scale(self, max_density: float):
        """
        Set fixed scaling for consistent visualization.
        
        Args:
            max_density: Maximum density value for normalization
        """
        self._max_density = max_density
        self._adaptive_max = False
    
    def visualize(
        self,
        frame: np.ndarray,
        density_map: np.ndarray,
        count: Optional[float] = None,
        density_level: Optional[str] = None
    ) -> np.ndarray:
        """
        Generate visualization with heatmap overlay.
        
        Args:
            frame: Original BGR frame
            density_map: Density map from model
            count: Crowd count to display
            density_level: Density level string (e.g., "HIGH")
            
        Returns:
            Visualized frame with heatmap
        """
        # Update adaptive max
        current_max = float(density_map.max())
        if self._adaptive_max:
            self._max_density = max(self._max_density, current_max * 1.2)
        
        # Generate heatmap
        heatmap = generate_heatmap(
            density_map,
            target_size=(frame.shape[1], frame.shape[0]),
            colormap=self.colormap,
            max_val=self._max_density if self._max_density > 0 else None
        )
        
        # Overlay on frame
        result = overlay_heatmap(frame, heatmap, self.alpha)
        
        # Add annotations
        if self.show_count and count is not None:
            result = self._draw_count(result, count, density_level)
        
        if self.show_density_bar:
            result = self._draw_density_bar(result)
        
        return result
    
    def _draw_count(
        self,
        frame: np.ndarray,
        count: float,
        level: Optional[str] = None
    ) -> np.ndarray:
        """Draw count annotation on frame."""
        result = frame.copy()
        
        # Background box
        box_height = 80 if level else 50
        cv2.rectangle(result, (10, 10), (200, 10 + box_height), (0, 0, 0), -1)
        cv2.rectangle(result, (10, 10), (200, 10 + box_height), (255, 255, 255), 1)
        
        # Count text
        count_text = f"Count: {count:.0f}"
        cv2.putText(
            result, count_text, (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX, self.font_scale,
            (255, 255, 255), 2
        )
        
        # Level text with color
        if level:
            level_colors = {
                "FREE_FLOW": (0, 200, 0),
                "LOW": (0, 255, 0),
                "MEDIUM": (0, 255, 255),
                "HIGH": (0, 165, 255),
                "CRITICAL": (0, 0, 255),
            }
            color = level_colors.get(level, (255, 255, 255))
            
            cv2.putText(
                result, f"Level: {level}", (20, 75),
                cv2.FONT_HERSHEY_SIMPLEX, self.font_scale * 0.8,
                color, 2
            )
        
        return result
    
    def _draw_density_bar(self, frame: np.ndarray) -> np.ndarray:
        """Draw density color scale bar."""
        result = frame.copy()
        h, w = result.shape[:2]
        
        # Bar dimensions
        bar_width = 20
        bar_height = 150
        bar_x = w - bar_width - 20
        bar_y = (h - bar_height) // 2
        
        # Create gradient bar
        gradient = np.linspace(0, 255, bar_height).astype(np.uint8)
        gradient = gradient[::-1].reshape(-1, 1)  # Reverse (high at top)
        gradient = np.repeat(gradient, bar_width, axis=1)
        
        # Apply colormap
        cmap = COLORMAP_PRESETS.get(self.colormap, cv2.COLORMAP_JET)
        color_bar = cv2.applyColorMap(gradient, cmap)
        
        # Paste on frame
        result[bar_y:bar_y+bar_height, bar_x:bar_x+bar_width] = color_bar
        
        # Border
        cv2.rectangle(
            result,
            (bar_x - 1, bar_y - 1),
            (bar_x + bar_width, bar_y + bar_height),
            (255, 255, 255), 1
        )
        
        # Labels
        cv2.putText(result, "High", (bar_x - 40, bar_y + 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        cv2.putText(result, "Low", (bar_x - 35, bar_y + bar_height - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        return result
    
    def visualize_zones(
        self,
        frame: np.ndarray,
        zones: list,
        show_counts: bool = True
    ) -> np.ndarray:
        """
        Visualize zone-based density analysis.
        
        Args:
            frame: Original frame
            zones: List of zone dicts from DensityAnalyzer.analyze_zones()
            show_counts: Whether to show count per zone
            
        Returns:
            Frame with zone overlays
        """
        result = frame.copy()
        overlay = result.copy()
        
        for zone in zones:
            bounds = zone["bounds"]
            x1, y1, x2, y2 = bounds["x1"], bounds["y1"], bounds["x2"], bounds["y2"]
            
            # Scale bounds to frame size
            h, w = frame.shape[:2]
            x1_scaled = int(x1 / zones[-1]["bounds"]["x2"] * w)
            x2_scaled = int(x2 / zones[-1]["bounds"]["x2"] * w)
            y1_scaled = int(y1 / zones[-1]["bounds"]["y2"] * h)
            y2_scaled = int(y2 / zones[-1]["bounds"]["y2"] * h)
            
            # Zone color based on level
            color = zone["color"][::-1]  # RGB to BGR
            
            # Semi-transparent fill
            cv2.rectangle(overlay, (x1_scaled, y1_scaled), (x2_scaled, y2_scaled), color, -1)
            
            # Border
            cv2.rectangle(result, (x1_scaled, y1_scaled), (x2_scaled, y2_scaled), color, 2)
            
            # Count label
            if show_counts:
                label = f"{zone['count']:.0f}"
                label_x = x1_scaled + 5
                label_y = y1_scaled + 25
                
                cv2.putText(
                    result, label, (label_x, label_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
                )
        
        # Blend overlay
        result = cv2.addWeighted(overlay, 0.3, result, 0.7, 0)
        
        return result


def create_side_by_side(
    frame: np.ndarray,
    heatmap_overlay: np.ndarray,
    density_map: np.ndarray
) -> np.ndarray:
    """
    Create side-by-side comparison view.
    
    Args:
        frame: Original frame
        heatmap_overlay: Frame with heatmap overlay
        density_map: Raw density map
        
    Returns:
        Combined image with original, overlay, and raw heatmap
    """
    h, w = frame.shape[:2]
    
    # Generate pure heatmap at frame size
    pure_heatmap = generate_heatmap(density_map, target_size=(w, h))
    
    # Stack horizontally
    combined = np.hstack([frame, heatmap_overlay, pure_heatmap])
    
    # Add labels
    cv2.putText(combined, "Original", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(combined, "Overlay", (w + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(combined, "Density Map", (2 * w + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    return combined
