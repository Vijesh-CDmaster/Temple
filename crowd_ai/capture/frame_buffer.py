"""
Frame Buffer Module
===================
Thread-safe frame buffering for async processing.
"""

import threading
import time
from collections import deque
from dataclasses import dataclass
from typing import Optional, Tuple
import numpy as np

from .video_source import FrameMetadata


@dataclass
class BufferedFrame:
    """A frame with its associated metadata in the buffer."""
    frame: np.ndarray
    metadata: FrameMetadata


class FrameBuffer:
    """
    Thread-safe circular buffer for video frames.
    
    Useful for:
    - Decoupling capture from processing
    - Handling variable processing times
    - Dropping old frames under load
    
    Args:
        max_size: Maximum number of frames to buffer
        drop_old: If True, drops oldest frames when full
    """
    
    def __init__(self, max_size: int = 10, drop_old: bool = True):
        self.max_size = max_size
        self.drop_old = drop_old
        
        self._buffer: deque = deque(maxlen=max_size if drop_old else None)
        self._lock = threading.Lock()
        self._not_empty = threading.Condition(self._lock)
        self._not_full = threading.Condition(self._lock)
        
        self._frames_added = 0
        self._frames_dropped = 0
    
    def put(
        self, 
        frame: np.ndarray, 
        metadata: FrameMetadata,
        timeout: Optional[float] = None
    ) -> bool:
        """
        Add a frame to the buffer.
        
        Args:
            frame: The video frame
            metadata: Frame metadata
            timeout: Max time to wait if buffer is full (None = block forever)
            
        Returns:
            True if frame was added, False if timed out
        """
        with self._not_full:
            if not self.drop_old:
                # Wait for space if not dropping old frames
                end_time = None if timeout is None else time.time() + timeout
                
                while len(self._buffer) >= self.max_size:
                    remaining = None if end_time is None else end_time - time.time()
                    if remaining is not None and remaining <= 0:
                        return False
                    self._not_full.wait(remaining)
            
            # Check if we need to drop oldest
            if self.drop_old and len(self._buffer) >= self.max_size:
                self._frames_dropped += 1
            
            self._buffer.append(BufferedFrame(frame=frame, metadata=metadata))
            self._frames_added += 1
            
            self._not_empty.notify()
            return True
    
    def get(
        self, 
        timeout: Optional[float] = None
    ) -> Optional[Tuple[np.ndarray, FrameMetadata]]:
        """
        Get a frame from the buffer.
        
        Args:
            timeout: Max time to wait for a frame (None = block forever)
            
        Returns:
            Tuple of (frame, metadata) or None if timed out
        """
        with self._not_empty:
            end_time = None if timeout is None else time.time() + timeout
            
            while len(self._buffer) == 0:
                remaining = None if end_time is None else end_time - time.time()
                if remaining is not None and remaining <= 0:
                    return None
                if not self._not_empty.wait(remaining):
                    return None
            
            buffered = self._buffer.popleft()
            self._not_full.notify()
            
            return buffered.frame, buffered.metadata
    
    def get_latest(self) -> Optional[Tuple[np.ndarray, FrameMetadata]]:
        """
        Get the most recent frame, dropping older ones.
        
        Returns:
            Tuple of (frame, metadata) or None if buffer is empty
        """
        with self._lock:
            if len(self._buffer) == 0:
                return None
            
            # Get latest and clear older frames
            buffered = self._buffer[-1]
            dropped = len(self._buffer) - 1
            self._buffer.clear()
            self._frames_dropped += dropped
            
            return buffered.frame, buffered.metadata
    
    def clear(self):
        """Clear all frames from the buffer."""
        with self._lock:
            self._buffer.clear()
    
    @property
    def size(self) -> int:
        """Current number of frames in buffer."""
        with self._lock:
            return len(self._buffer)
    
    @property
    def is_empty(self) -> bool:
        """Check if buffer is empty."""
        return self.size == 0
    
    @property
    def is_full(self) -> bool:
        """Check if buffer is full."""
        return self.size >= self.max_size
    
    @property
    def stats(self) -> dict:
        """Get buffer statistics."""
        with self._lock:
            return {
                "current_size": len(self._buffer),
                "max_size": self.max_size,
                "frames_added": self._frames_added,
                "frames_dropped": self._frames_dropped,
                "drop_rate": self._frames_dropped / max(1, self._frames_added)
            }
