"""
Video Source Classes
====================
Abstract and concrete implementations for video capture sources.
Supports webcam, RTSP streams, and video files.
"""

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Tuple, Generator
from pathlib import Path

import cv2
import numpy as np


@dataclass
class FrameMetadata:
    """Metadata associated with each captured frame."""
    timestamp: float  # Unix timestamp when frame was captured
    frame_number: int  # Sequential frame number
    source_id: str  # Identifier for the video source
    resolution: Tuple[int, int]  # (width, height)
    fps: float  # Estimated FPS at capture time


class VideoSource(ABC):
    """
    Abstract base class for video sources.
    
    Provides a unified interface for different video input types:
    - Laptop webcam (cv2.VideoCapture(0))
    - RTSP/CCTV streams
    - Video files (for testing)
    
    Usage:
        ```python
        with WebcamSource() as source:
            for frame, metadata in source.frames():
                process(frame)
        ```
    """
    
    def __init__(self, source_id: str = "default"):
        self.source_id = source_id
        self._cap: Optional[cv2.VideoCapture] = None
        self._frame_count = 0
        self._start_time: Optional[float] = None
        self._is_open = False
    
    @abstractmethod
    def _create_capture(self) -> cv2.VideoCapture:
        """Create and return the OpenCV VideoCapture object."""
        pass
    
    def open(self) -> bool:
        """
        Open the video source.
        
        Returns:
            True if successfully opened, False otherwise.
        """
        try:
            self._cap = self._create_capture()
            self._is_open = self._cap.isOpened()
            self._start_time = time.time()
            self._frame_count = 0
            
            if self._is_open:
                print(f"[{self.source_id}] Video source opened successfully")
                self._print_source_info()
            else:
                print(f"[{self.source_id}] Failed to open video source")
            
            return self._is_open
            
        except Exception as e:
            print(f"[{self.source_id}] Error opening video source: {e}")
            return False
    
    def close(self):
        """Release the video source."""
        if self._cap is not None:
            self._cap.release()
            self._cap = None
            self._is_open = False
            print(f"[{self.source_id}] Video source closed")
    
    def _print_source_info(self):
        """Print information about the video source."""
        if self._cap is None:
            return
            
        width = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = self._cap.get(cv2.CAP_PROP_FPS)
        
        print(f"[{self.source_id}] Resolution: {width}x{height}, FPS: {fps:.1f}")
    
    def read(self) -> Tuple[Optional[np.ndarray], Optional[FrameMetadata]]:
        """
        Read a single frame from the video source.
        
        Returns:
            Tuple of (frame, metadata) or (None, None) if read fails.
        """
        if self._cap is None or not self._is_open:
            return None, None
        
        ret, frame = self._cap.read()
        
        if not ret or frame is None:
            return None, None
        
        self._frame_count += 1
        
        # Calculate current FPS
        elapsed = time.time() - self._start_time
        current_fps = self._frame_count / elapsed if elapsed > 0 else 0
        
        metadata = FrameMetadata(
            timestamp=time.time(),
            frame_number=self._frame_count,
            source_id=self.source_id,
            resolution=(frame.shape[1], frame.shape[0]),
            fps=current_fps
        )
        
        return frame, metadata
    
    def frames(
        self, 
        max_frames: Optional[int] = None,
        skip_frames: int = 0
    ) -> Generator[Tuple[np.ndarray, FrameMetadata], None, None]:
        """
        Generator that yields frames from the video source.
        
        Args:
            max_frames: Maximum number of frames to yield (None = unlimited)
            skip_frames: Number of frames to skip between yields (for reducing FPS)
            
        Yields:
            Tuple of (frame, metadata) for each captured frame.
        """
        frames_yielded = 0
        skip_counter = 0
        
        while True:
            frame, metadata = self.read()
            
            if frame is None:
                break
            
            # Skip frames if requested
            if skip_counter < skip_frames:
                skip_counter += 1
                continue
            skip_counter = 0
            
            yield frame, metadata
            frames_yielded += 1
            
            if max_frames is not None and frames_yielded >= max_frames:
                break
    
    @property
    def is_open(self) -> bool:
        """Check if the video source is currently open."""
        return self._is_open and self._cap is not None
    
    @property
    def resolution(self) -> Tuple[int, int]:
        """Get current resolution (width, height)."""
        if self._cap is None:
            return (0, 0)
        return (
            int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        )
    
    @property
    def fps(self) -> float:
        """Get the FPS of the video source."""
        if self._cap is None:
            return 0.0
        return self._cap.get(cv2.CAP_PROP_FPS)
    
    def set_resolution(self, width: int, height: int) -> bool:
        """
        Attempt to set the capture resolution.
        
        Note: Not all sources support this.
        
        Returns:
            True if successful, False otherwise.
        """
        if self._cap is None:
            return False
        
        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        
        # Verify
        actual_w = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_h = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        return actual_w == width and actual_h == height
    
    def __enter__(self):
        """Context manager entry."""
        self.open()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
        return False


class WebcamSource(VideoSource):
    """
    Webcam video source using laptop camera.
    
    Uses cv2.VideoCapture(device_id) for USB/built-in cameras.
    
    Args:
        device_id: Camera device ID (default: 0 for primary camera)
        source_id: Identifier string for this source
        
    Example:
        ```python
        # Use default laptop webcam
        with WebcamSource() as cam:
            for frame, meta in cam.frames():
                cv2.imshow("Frame", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        ```
    """
    
    def __init__(self, device_id: int = 0, source_id: str = "webcam"):
        super().__init__(source_id)
        self.device_id = device_id
    
    def _create_capture(self) -> cv2.VideoCapture:
        """Create webcam capture."""
        print(f"[{self.source_id}] Opening webcam device {self.device_id}...")
        
        # Use DirectShow backend on Windows for better compatibility
        cap = cv2.VideoCapture(self.device_id, cv2.CAP_DSHOW)
        
        # Set reasonable defaults for webcam
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce latency
        
        return cap


class RTSPSource(VideoSource):
    """
    RTSP stream video source for CCTV/IP cameras.
    
    Designed for industrial CCTV integration with proper
    reconnection handling and buffering.
    
    Args:
        rtsp_url: Full RTSP URL (e.g., "rtsp://user:pass@192.168.1.100:554/stream1")
        source_id: Identifier string for this source
        reconnect_attempts: Number of reconnection attempts on failure
        
    Example:
        ```python
        # Connect to IP camera
        with RTSPSource("rtsp://admin:admin@192.168.1.100:554/stream") as cam:
            for frame, meta in cam.frames():
                process(frame)
        ```
    """
    
    def __init__(
        self, 
        rtsp_url: str, 
        source_id: str = "rtsp_cam",
        reconnect_attempts: int = 3
    ):
        super().__init__(source_id)
        self.rtsp_url = rtsp_url
        self.reconnect_attempts = reconnect_attempts
    
    def _create_capture(self) -> cv2.VideoCapture:
        """Create RTSP capture with optimized settings."""
        # Mask password in URL for logging
        safe_url = self._mask_credentials(self.rtsp_url)
        print(f"[{self.source_id}] Connecting to RTSP stream: {safe_url}")
        
        # Use FFMPEG backend for better RTSP support
        cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
        
        # Optimize for RTSP streaming
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)
        
        # Set TCP transport for more reliable streaming
        # This is set via environment or gstreamer pipeline in production
        
        return cap
    
    def _mask_credentials(self, url: str) -> str:
        """Mask username/password in URL for safe logging."""
        import re
        return re.sub(r'://([^:]+):([^@]+)@', r'://***:***@', url)
    
    def read(self) -> Tuple[Optional[np.ndarray], Optional[FrameMetadata]]:
        """Read with reconnection on failure."""
        frame, metadata = super().read()
        
        if frame is None and self._is_open:
            # Attempt reconnection
            for attempt in range(self.reconnect_attempts):
                print(f"[{self.source_id}] Reconnecting (attempt {attempt + 1})...")
                time.sleep(1)
                
                self.close()
                if self.open():
                    frame, metadata = super().read()
                    if frame is not None:
                        print(f"[{self.source_id}] Reconnection successful")
                        break
        
        return frame, metadata


class VideoFileSource(VideoSource):
    """
    Video file source for testing and development.
    
    Useful for:
    - Testing pipeline without live camera
    - Benchmarking with consistent input
    - Debugging with recorded footage
    
    Args:
        file_path: Path to video file
        loop: Whether to loop the video
        source_id: Identifier string for this source
    """
    
    def __init__(
        self, 
        file_path: str, 
        loop: bool = False,
        source_id: str = "video_file"
    ):
        super().__init__(source_id)
        self.file_path = Path(file_path)
        self.loop = loop
    
    def _create_capture(self) -> cv2.VideoCapture:
        """Create video file capture."""
        if not self.file_path.exists():
            raise FileNotFoundError(f"Video file not found: {self.file_path}")
        
        print(f"[{self.source_id}] Opening video file: {self.file_path}")
        return cv2.VideoCapture(str(self.file_path))
    
    def read(self) -> Tuple[Optional[np.ndarray], Optional[FrameMetadata]]:
        """Read with optional looping."""
        frame, metadata = super().read()
        
        if frame is None and self.loop and self._cap is not None:
            # Reset to beginning
            self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self._frame_count = 0
            self._start_time = time.time()
            frame, metadata = super().read()
        
        return frame, metadata
    
    @property
    def total_frames(self) -> int:
        """Get total number of frames in the video."""
        if self._cap is None:
            return 0
        return int(self._cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    @property
    def duration_seconds(self) -> float:
        """Get video duration in seconds."""
        if self._cap is None or self.fps == 0:
            return 0.0
        return self.total_frames / self.fps


def create_video_source(source: str, source_id: str = "auto") -> VideoSource:
    """
    Factory function to create appropriate video source.
    
    Args:
        source: Can be:
            - Integer string ("0", "1") for webcam device ID
            - RTSP URL starting with "rtsp://"
            - File path to video file
        source_id: Optional identifier
        
    Returns:
        Appropriate VideoSource instance
        
    Example:
        ```python
        # Webcam
        source = create_video_source("0")
        
        # RTSP
        source = create_video_source("rtsp://192.168.1.100/stream")
        
        # Video file
        source = create_video_source("test_video.mp4")
        ```
    """
    # Check if it's a device ID (integer)
    if source.isdigit():
        return WebcamSource(
            device_id=int(source),
            source_id=source_id if source_id != "auto" else f"webcam_{source}"
        )
    
    # Check if it's an RTSP URL
    if source.lower().startswith("rtsp://"):
        return RTSPSource(
            rtsp_url=source,
            source_id=source_id if source_id != "auto" else "rtsp_cam"
        )
    
    # Assume it's a file path
    return VideoFileSource(
        file_path=source,
        source_id=source_id if source_id != "auto" else "video_file"
    )
