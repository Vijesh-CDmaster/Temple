"""
Model Loader Module
===================
Utilities for loading CSRNet models and pretrained weights.
"""

import os
import urllib.request
from pathlib import Path
from typing import Optional, Union

import torch

from .csrnet import CSRNet, CSRNetLite


# Pretrained model URLs (SHA-B from ShanghaiTech dataset)
# These are commonly shared open-source weights
PRETRAINED_WEIGHTS_URLS = {
    "csrnet_sha": "https://github.com/leeyeehoo/CSRNet-pytorch/releases/download/v1.0/CSRNet_ShanghaiA.pth",
    "csrnet_shb": "https://github.com/leeyeehoo/CSRNet-pytorch/releases/download/v1.0/CSRNet_ShanghaiB.pth",
}

# Default weights directory
DEFAULT_WEIGHTS_DIR = Path(__file__).parent.parent / "weights"


def download_pretrained_weights(
    model_name: str = "csrnet_sha",
    save_dir: Optional[Union[str, Path]] = None,
    force_download: bool = False
) -> Path:
    """
    Download pretrained CSRNet weights.
    
    Args:
        model_name: Name of pretrained model ('csrnet_sha' or 'csrnet_shb')
        save_dir: Directory to save weights (default: crowd_ai/weights/)
        force_download: If True, re-download even if file exists
        
    Returns:
        Path to downloaded weights file
        
    Note:
        SHA = ShanghaiTech Part A (dense crowds)
        SHB = ShanghaiTech Part B (sparse crowds)
    """
    if model_name not in PRETRAINED_WEIGHTS_URLS:
        raise ValueError(f"Unknown model: {model_name}. Available: {list(PRETRAINED_WEIGHTS_URLS.keys())}")
    
    save_dir = Path(save_dir) if save_dir else DEFAULT_WEIGHTS_DIR
    save_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{model_name}.pth"
    weights_path = save_dir / filename
    
    if weights_path.exists() and not force_download:
        print(f"Weights already exist at {weights_path}")
        return weights_path
    
    url = PRETRAINED_WEIGHTS_URLS[model_name]
    print(f"Downloading {model_name} weights from {url}...")
    
    try:
        urllib.request.urlretrieve(url, weights_path)
        print(f"Successfully downloaded to {weights_path}")
    except Exception as e:
        print(f"Warning: Could not download weights: {e}")
        print("You may need to download manually or train from scratch.")
        raise
    
    return weights_path


def load_csrnet_model(
    weights_path: Optional[Union[str, Path]] = None,
    model_type: str = "standard",
    device: Optional[torch.device] = None,
    pretrained_vgg: bool = True
) -> Union[CSRNet, CSRNetLite]:
    """
    Load a CSRNet model with optional pretrained weights.
    
    Args:
        weights_path: Path to model weights file. If None, loads with only VGG pretrained.
        model_type: 'standard' for CSRNet or 'lite' for CSRNetLite
        device: Device to load model on (default: auto-detect)
        pretrained_vgg: Whether to use pretrained VGG-16 frontend
        
    Returns:
        Loaded CSRNet model ready for inference
        
    Example:
        ```python
        # Load with pretrained VGG only (for training)
        model = load_csrnet_model()
        
        # Load with full pretrained weights (for inference)
        model = load_csrnet_model(weights_path="path/to/weights.pth")
        
        # Load lightweight version
        model = load_csrnet_model(model_type="lite")
        ```
    """
    # Auto-detect device
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Create model
    if model_type == "lite":
        model = CSRNetLite(load_pretrained_vgg=pretrained_vgg)
    else:
        model = CSRNet(load_pretrained_vgg=pretrained_vgg)
    
    # Load weights if provided
    if weights_path is not None:
        weights_path = Path(weights_path)
        if not weights_path.exists():
            raise FileNotFoundError(f"Weights file not found: {weights_path}")
        
        print(f"Loading weights from {weights_path}...")
        state_dict = torch.load(weights_path, map_location=device, weights_only=True)
        
        # Handle different state dict formats
        if "state_dict" in state_dict:
            state_dict = state_dict["state_dict"]
        
        # Try to load weights (may need key remapping)
        try:
            model.load_state_dict(state_dict, strict=True)
        except RuntimeError as e:
            print(f"Warning: Strict loading failed, trying non-strict: {e}")
            model.load_state_dict(state_dict, strict=False)
    
    # Move to device and set to eval mode
    model = model.to(device)
    model.eval()
    
    print(f"Model loaded on {device}")
    return model


def create_mock_model(device: Optional[torch.device] = None) -> CSRNet:
    """
    Create a CSRNet model with random weights for testing.
    
    Useful for testing the pipeline without downloading weights.
    
    Args:
        device: Device to load model on
        
    Returns:
        CSRNet model with random (untrained) weights
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    model = CSRNet(load_pretrained_vgg=True)
    model = model.to(device)
    model.eval()
    
    print(f"Created mock model on {device} (not trained - for testing only!)")
    return model


def save_model(model: torch.nn.Module, save_path: Union[str, Path], metadata: dict = None):
    """
    Save model weights with optional metadata.
    
    Args:
        model: Model to save
        save_path: Path to save weights
        metadata: Optional metadata dict (training info, etc.)
    """
    save_path = Path(save_path)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    
    save_dict = {
        "state_dict": model.state_dict(),
        "model_class": model.__class__.__name__,
    }
    
    if metadata:
        save_dict["metadata"] = metadata
    
    torch.save(save_dict, save_path)
    print(f"Model saved to {save_path}")
