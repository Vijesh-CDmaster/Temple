"""
Multi-Camera Manager
====================
Manages multiple video sources for area-wise crowd monitoring.
"""

import threading
import time
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable, Tuple
import numpy as np

from .video_source import VideoSource, FrameMetadata, create_video_source
from .frame_buffer import FrameBuffer


@dataclass
class CameraConfig:
    """Configuration for a single camera."""
    source: str  # Device ID, RTSP URL, or file path
    source_id: str  # Unique identifier
    area_name: str  # Human-readable area name (e.g., "Main Gate")
    area_sqm: float  # Area covered by camera in square meters
    enabled: bool = True


@dataclass
class CameraStatus:
    """Current status of a camera."""
    source_id: str
    area_name: str
    is_connected: bool
    fps: float
    last_frame_time: Optional[float]
    frames_captured: int
    errors: int


class CameraWorker:
    """Worker thread for a single camera."""
    
    def __init__(
        self,
        config: CameraConfig,
        buffer: FrameBuffer,
        on_error: Optional[Callable[[str, Exception], None]] = None
    ):
        self.config = config
        self.buffer = buffer
        self.on_error = on_error
        
        self._source: Optional[VideoSource] = None
        self._thread: Optional[threading.Thread] = None
        self._running = False
        self._frames_captured = 0
        self._errors = 0
        self._last_frame_time: Optional[float] = None
    
    def start(self):
        """Start the camera worker thread."""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()
    
    def stop(self):
        """Stop the camera worker thread."""
        self._running = False
        if self._thread is not None:
            self._thread.join(timeout=2.0)
            self._thread = None
        
        if self._source is not None:
            self._source.close()
            self._source = None
    
    def _capture_loop(self):
        """Main capture loop running in separate thread."""
        self._source = create_video_source(
            self.config.source,
            self.config.source_id
        )
        
        if not self._source.open():
            self._errors += 1
            if self.on_error:
                self.on_error(self.config.source_id, Exception("Failed to open source"))
            return
        
        while self._running:
            try:
                frame, metadata = self._source.read()
                
                if frame is not None:
                    self.buffer.put(frame, metadata)
                    self._frames_captured += 1
                    self._last_frame_time = time.time()
                else:
                    # Small delay on failed read to avoid busy loop
                    time.sleep(0.01)
                    
            except Exception as e:
                self._errors += 1
                if self.on_error:
                    self.on_error(self.config.source_id, e)
                time.sleep(0.1)
        
        self._source.close()
    
    @property
    def status(self) -> CameraStatus:
        """Get current camera status."""
        return CameraStatus(
            source_id=self.config.source_id,
            area_name=self.config.area_name,
            is_connected=self._source is not None and self._source.is_open,
            fps=self._source.fps if self._source else 0.0,
            last_frame_time=self._last_frame_time,
            frames_captured=self._frames_captured,
            errors=self._errors
        )


class MultiCameraManager:
    """
    Manages multiple camera sources for area-wise monitoring.
    
    Example:
        ```python
        configs = [
            CameraConfig("0", "cam_gate", "Main Gate", area_sqm=50),
            CameraConfig("rtsp://...", "cam_hall", "Main Hall", area_sqm=200),
        ]
        
        manager = MultiCameraManager(configs)
        manager.start()
        
        while True:
            frames = manager.get_latest_frames()
            for source_id, (frame, meta) in frames.items():
                process(frame)
        ```
    """
    
    def __init__(
        self,
        camera_configs: List[CameraConfig],
        buffer_size: int = 5
    ):
        self.camera_configs = {c.source_id: c for c in camera_configs}
        self.buffer_size = buffer_size
        
        self._workers: Dict[str, CameraWorker] = {}
        self._buffers: Dict[str, FrameBuffer] = {}
        self._error_log: List[Tuple[str, str, float]] = []
        
        self._setup_workers()
    
    def _setup_workers(self):
        """Initialize workers for all cameras."""
        for config in self.camera_configs.values():
            if not config.enabled:
                continue
            
            buffer = FrameBuffer(max_size=self.buffer_size, drop_old=True)
            worker = CameraWorker(
                config=config,
                buffer=buffer,
                on_error=self._handle_error
            )
            
            self._buffers[config.source_id] = buffer
            self._workers[config.source_id] = worker
    
    def _handle_error(self, source_id: str, error: Exception):
        """Handle camera errors."""
        self._error_log.append((source_id, str(error), time.time()))
        # Keep only last 100 errors
        if len(self._error_log) > 100:
            self._error_log = self._error_log[-100:]
    
    def start(self):
        """Start all camera workers."""
        for worker in self._workers.values():
            worker.start()
        print(f"Started {len(self._workers)} camera workers")
    
    def stop(self):
        """Stop all camera workers."""
        for worker in self._workers.values():
            worker.stop()
        print("All camera workers stopped")
    
    def get_frame(
        self, 
        source_id: str,
        timeout: float = 1.0
    ) -> Optional[Tuple[np.ndarray, FrameMetadata]]:
        """Get next frame from a specific camera."""
        if source_id not in self._buffers:
            return None
        return self._buffers[source_id].get(timeout=timeout)
    
    def get_latest_frame(
        self, 
        source_id: str
    ) -> Optional[Tuple[np.ndarray, FrameMetadata]]:
        """Get the most recent frame from a specific camera."""
        if source_id not in self._buffers:
            return None
        return self._buffers[source_id].get_latest()
    
    def get_latest_frames(
        self
    ) -> Dict[str, Tuple[np.ndarray, FrameMetadata]]:
        """Get the most recent frame from all cameras."""
        frames = {}
        for source_id, buffer in self._buffers.items():
            result = buffer.get_latest()
            if result is not None:
                frames[source_id] = result
        return frames
    
    def get_status(self) -> Dict[str, CameraStatus]:
        """Get status of all cameras."""
        return {
            source_id: worker.status
            for source_id, worker in self._workers.items()
        }
    
    def get_area_config(self, source_id: str) -> Optional[CameraConfig]:
        """Get configuration for a specific camera."""
        return self.camera_configs.get(source_id)
    
    @property
    def active_cameras(self) -> List[str]:
        """List of currently connected camera IDs."""
        return [
            source_id 
            for source_id, worker in self._workers.items()
            if worker.status.is_connected
        ]
    
    def __enter__(self):
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
        return False
