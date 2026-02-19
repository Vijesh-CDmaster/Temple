"""
Image Transforms for CSRNet
===========================
Preprocessing functions to prepare camera frames for model inference.

CSRNet expects:
- RGB images (OpenCV captures BGR)
- Normalized with ImageNet mean/std
- Divisible dimensions (for downsampling)
"""

from typing import Tuple, Optional, List, Union
import cv2
import numpy as np
import torch


# ImageNet normalization constants (used by pretrained VGG)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    """
    Convert BGR (OpenCV format) to RGB.
    
    Args:
        image: BGR image array [H, W, 3]
        
    Returns:
        RGB image array [H, W, 3]
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def resize_image(
    image: np.ndarray,
    target_size: Optional[Tuple[int, int]] = None,
    scale_factor: Optional[float] = None,
    min_size: int = 256,
    max_size: int = 2048,
    divisor: int = 8
) -> np.ndarray:
    """
    Resize image for CSRNet inference.
    
    Ensures dimensions are divisible by 8 (for 8x downsampling).
    
    Args:
        image: Input image [H, W, C]
        target_size: Target (width, height) - overrides scale_factor
        scale_factor: Scale factor (e.g., 0.5 for half size)
        min_size: Minimum dimension size
        max_size: Maximum dimension size
        divisor: Dimensions must be divisible by this (default: 8 for CSRNet)
        
    Returns:
        Resized image with dimensions divisible by divisor
    """
    h, w = image.shape[:2]
    
    if target_size is not None:
        new_w, new_h = target_size
    elif scale_factor is not None:
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
    else:
        new_w, new_h = w, h
    
    # Clamp to min/max
    new_w = max(min_size, min(max_size, new_w))
    new_h = max(min_size, min(max_size, new_h))
    
    # Make divisible by divisor
    new_w = (new_w // divisor) * divisor
    new_h = (new_h // divisor) * divisor
    
    if new_w != w or new_h != h:
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    
    return image


def normalize_image(
    image: np.ndarray,
    mean: np.ndarray = IMAGENET_MEAN,
    std: np.ndarray = IMAGENET_STD
) -> np.ndarray:
    """
    Normalize image with ImageNet statistics.
    
    Args:
        image: RGB image [H, W, 3] with values in [0, 255]
        mean: Mean values for each channel
        std: Std values for each channel
        
    Returns:
        Normalized image [H, W, 3] with float32 values
    """
    # Convert to float and scale to [0, 1]
    image = image.astype(np.float32) / 255.0
    
    # Normalize
    image = (image - mean) / std
    
    return image


def denormalize_image(
    image: np.ndarray,
    mean: np.ndarray = IMAGENET_MEAN,
    std: np.ndarray = IMAGENET_STD
) -> np.ndarray:
    """
    Denormalize image back to [0, 255] range.
    
    Args:
        image: Normalized image [H, W, 3]
        mean: Mean values used for normalization
        std: Std values used for normalization
        
    Returns:
        Denormalized image [H, W, 3] with uint8 values
    """
    image = image * std + mean
    image = np.clip(image * 255, 0, 255).astype(np.uint8)
    return image


def image_to_tensor(image: np.ndarray) -> torch.Tensor:
    """
    Convert numpy image to PyTorch tensor.
    
    Args:
        image: Normalized image [H, W, C]
        
    Returns:
        Tensor [1, C, H, W] ready for model input
    """
    # HWC -> CHW
    tensor = torch.from_numpy(image.transpose(2, 0, 1))
    
    # Add batch dimension
    tensor = tensor.unsqueeze(0)
    
    return tensor


def tensor_to_image(tensor: torch.Tensor) -> np.ndarray:
    """
    Convert PyTorch tensor back to numpy image.
    
    Args:
        tensor: Tensor [B, C, H, W] or [C, H, W]
        
    Returns:
        Numpy array [H, W, C]
    """
    if tensor.dim() == 4:
        tensor = tensor[0]  # Remove batch dimension
    
    # CHW -> HWC
    image = tensor.cpu().numpy().transpose(1, 2, 0)
    
    return image


def preprocess_frame(
    frame: np.ndarray,
    target_size: Optional[Tuple[int, int]] = None,
    scale_factor: Optional[float] = None,
    device: torch.device = None
) -> Tuple[torch.Tensor, dict]:
    """
    Full preprocessing pipeline for a single frame.
    
    Steps:
    1. BGR to RGB conversion
    2. Resize (if specified)
    3. Normalize with ImageNet stats
    4. Convert to tensor
    
    Args:
        frame: BGR image from OpenCV [H, W, 3]
        target_size: Optional target (width, height)
        scale_factor: Optional scale factor
        device: Target device for tensor
        
    Returns:
        Tuple of (tensor, preprocessing info dict)
        
    Example:
        ```python
        frame = cv2.imread("image.jpg")
        tensor, info = preprocess_frame(frame)
        
        # Model inference
        density_map = model(tensor)
        
        # Use info to scale density map back to original size
        ```
    """
    original_shape = frame.shape[:2]  # (H, W)
    
    # BGR to RGB
    rgb = bgr_to_rgb(frame)
    
    # Resize if needed
    resized = resize_image(
        rgb,
        target_size=target_size,
        scale_factor=scale_factor
    )
    processed_shape = resized.shape[:2]
    
    # Normalize
    normalized = normalize_image(resized)
    
    # To tensor
    tensor = image_to_tensor(normalized)
    
    # Move to device
    if device is not None:
        tensor = tensor.to(device)
    
    # Preprocessing info for postprocessing
    info = {
        "original_shape": original_shape,  # (H, W)
        "processed_shape": processed_shape,  # (H, W)
        "scale_h": original_shape[0] / processed_shape[0],
        "scale_w": original_shape[1] / processed_shape[1],
    }
    
    return tensor, info


def preprocess_batch(
    frames: List[np.ndarray],
    target_size: Optional[Tuple[int, int]] = None,
    scale_factor: Optional[float] = None,
    device: torch.device = None
) -> Tuple[torch.Tensor, List[dict]]:
    """
    Preprocess a batch of frames.
    
    All frames will be resized to the same dimensions.
    
    Args:
        frames: List of BGR frames from OpenCV
        target_size: Optional target (width, height)
        scale_factor: Optional scale factor
        device: Target device for tensor
        
    Returns:
        Tuple of (batched tensor [B, C, H, W], list of info dicts)
    """
    tensors = []
    infos = []
    
    for frame in frames:
        tensor, info = preprocess_frame(
            frame,
            target_size=target_size,
            scale_factor=scale_factor,
            device=None  # Move batch together at the end
        )
        tensors.append(tensor)
        infos.append(info)
    
    # Stack into batch
    batch = torch.cat(tensors, dim=0)
    
    if device is not None:
        batch = batch.to(device)
    
    return batch, infos


class CSRNetTransform:
    """
    Reusable transform pipeline for CSRNet preprocessing.
    
    Example:
        ```python
        transform = CSRNetTransform(scale_factor=0.5, device=device)
        
        for frame in video_frames:
            tensor, info = transform(frame)
            density_map = model(tensor)
        ```
    """
    
    def __init__(
        self,
        target_size: Optional[Tuple[int, int]] = None,
        scale_factor: Optional[float] = None,
        device: Optional[torch.device] = None
    ):
        """
        Initialize transform.
        
        Args:
            target_size: Fixed target size (width, height)
            scale_factor: Scale factor relative to input
            device: Target device for output tensor
        """
        self.target_size = target_size
        self.scale_factor = scale_factor
        self.device = device
    
    def __call__(
        self, 
        frame: np.ndarray
    ) -> Tuple[torch.Tensor, dict]:
        """Transform a frame."""
        return preprocess_frame(
            frame,
            target_size=self.target_size,
            scale_factor=self.scale_factor,
            device=self.device
        )
    
    def batch(
        self, 
        frames: List[np.ndarray]
    ) -> Tuple[torch.Tensor, List[dict]]:
        """Transform a batch of frames."""
        return preprocess_batch(
            frames,
            target_size=self.target_size,
            scale_factor=self.scale_factor,
            device=self.device
        )


def create_gaussian_kernel(sigma: float = 4.0, size: int = 15) -> np.ndarray:
    """
    Create Gaussian kernel for density map generation (training).
    
    Args:
        sigma: Standard deviation of Gaussian
        size: Kernel size (should be odd)
        
    Returns:
        Normalized Gaussian kernel
    """
    x = np.arange(0, size, 1, float)
    y = x[:, np.newaxis]
    x0 = y0 = size // 2
    
    kernel = np.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * sigma ** 2))
    kernel = kernel / kernel.sum()
    
    return kernel
