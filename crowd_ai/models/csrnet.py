"""
CSRNet Architecture Implementation
==================================
Implements the CSRNet model for crowd density estimation.

Architecture:
- Frontend: VGG-16 first 10 convolutional layers (pretrained on ImageNet)
- Backend: Dilated convolutions for density map generation
- Output: Single-channel density map (sum = crowd count)

Reference:
Li, Y., Zhang, X., & Chen, D. (2018). CSRNet: Dilated convolutional 
neural networks for understanding the highly congested scenes. CVPR.
"""

import torch
import torch.nn as nn
import torchvision


class CSRNet(nn.Module):
    """
    CSRNet: Congested Scene Recognition Network
    
    The network produces a density map from an input image.
    The sum of all values in the density map gives the crowd count.
    
    Args:
        load_pretrained_vgg: If True, loads pretrained VGG-16 weights for frontend
    """
    
    def __init__(self, load_pretrained_vgg: bool = True):
        super(CSRNet, self).__init__()
        
        # Frontend: VGG-16 first 10 conv layers
        self.frontend = self._make_frontend(load_pretrained_vgg)
        
        # Backend: Dilated convolutions for density estimation
        self.backend = self._make_backend()
        
        # Output layer: 1x1 conv to produce single-channel density map
        self.output_layer = nn.Conv2d(64, 1, kernel_size=1)
        
        # Initialize backend and output weights
        self._initialize_weights()
    
    def _make_frontend(self, load_pretrained: bool) -> nn.Sequential:
        """
        Create VGG-16 frontend (first 10 conv layers).
        
        Feature extraction layers:
        - Conv1: 64 channels
        - Conv2: 128 channels  
        - Conv3: 256 channels
        - Conv4: 512 channels (partial)
        """
        # VGG-16 configuration for first 10 conv layers
        # [64, 64, 'M', 128, 128, 'M', 256, 256, 256, 'M', 512, 512, 512]
        # We use layers up to conv4_3 (10 conv layers)
        
        if load_pretrained:
            vgg = torchvision.models.vgg16(weights=torchvision.models.VGG16_Weights.DEFAULT)
            # Extract features up to conv4_3 (index 22 in VGG features)
            frontend_layers = list(vgg.features.children())[:23]
        else:
            # Build from scratch
            frontend_layers = [
                # Block 1
                nn.Conv2d(3, 64, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(64, 64, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                
                # Block 2
                nn.Conv2d(64, 128, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(128, 128, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                
                # Block 3
                nn.Conv2d(128, 256, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(256, 256, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(256, 256, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                
                # Block 4 (partial)
                nn.Conv2d(256, 512, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(512, 512, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(512, 512, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
            ]
        
        return nn.Sequential(*frontend_layers)
    
    def _make_backend(self) -> nn.Sequential:
        """
        Create dilated convolution backend.
        
        Uses dilated convolutions to increase receptive field
        without reducing spatial resolution.
        
        Configuration: 512 -> 512 -> 512 -> 256 -> 128 -> 64
        Dilation rate: 2 for all layers
        """
        backend_config = [512, 512, 512, 256, 128, 64]
        
        layers = []
        in_channels = 512  # Output channels from frontend
        
        for out_channels in backend_config:
            layers.extend([
                nn.Conv2d(
                    in_channels, 
                    out_channels, 
                    kernel_size=3, 
                    padding=2,  # padding=dilation for same spatial size
                    dilation=2
                ),
                nn.ReLU(inplace=True)
            ])
            in_channels = out_channels
        
        return nn.Sequential(*layers)
    
    def _initialize_weights(self):
        """Initialize backend and output layer weights using Gaussian distribution."""
        for module in self.backend.modules():
            if isinstance(module, nn.Conv2d):
                nn.init.normal_(module.weight, std=0.01)
                if module.bias is not None:
                    nn.init.constant_(module.bias, 0)
        
        nn.init.normal_(self.output_layer.weight, std=0.01)
        if self.output_layer.bias is not None:
            nn.init.constant_(self.output_layer.bias, 0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through CSRNet.
        
        Args:
            x: Input tensor of shape [B, 3, H, W] (RGB image)
            
        Returns:
            Density map tensor of shape [B, 1, H/8, W/8]
            The sum of the density map approximates the crowd count.
        """
        # Frontend: VGG feature extraction (downsamples by 8x)
        features = self.frontend(x)
        
        # Backend: Dilated convolutions (maintains spatial size)
        density_features = self.backend(features)
        
        # Output: Generate density map (ReLU ensures non-negative values)
        density_map = self.output_layer(density_features)
        density_map = torch.relu(density_map)
        
        return density_map
    
    def count(self, density_map: torch.Tensor) -> torch.Tensor:
        """
        Get crowd count from density map.
        
        Args:
            density_map: Output from forward pass [B, 1, H', W']
            
        Returns:
            Tensor of shape [B] containing crowd counts
        """
        return density_map.sum(dim=(1, 2, 3))


class CSRNetLite(nn.Module):
    """
    Lightweight version of CSRNet for faster inference.
    
    Reduces channel counts in backend for ~2x speedup
    with minor accuracy trade-off.
    """
    
    def __init__(self, load_pretrained_vgg: bool = True):
        super(CSRNetLite, self).__init__()
        
        # Use same frontend
        if load_pretrained_vgg:
            vgg = torchvision.models.vgg16(weights=torchvision.models.VGG16_Weights.DEFAULT)
            frontend_layers = list(vgg.features.children())[:23]
        else:
            # Simplified frontend definition
            frontend_layers = self._build_frontend_layers()
        
        self.frontend = nn.Sequential(*frontend_layers)
        
        # Lighter backend: fewer channels
        backend_config = [256, 256, 128, 64, 32]
        
        layers = []
        in_channels = 512
        
        for out_channels in backend_config:
            layers.extend([
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=2, dilation=2),
                nn.ReLU(inplace=True)
            ])
            in_channels = out_channels
        
        self.backend = nn.Sequential(*layers)
        self.output_layer = nn.Conv2d(32, 1, kernel_size=1)
        
        self._initialize_weights()
    
    def _build_frontend_layers(self):
        """Build frontend layers from scratch."""
        return [
            nn.Conv2d(3, 64, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(128, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(256, 512, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(inplace=True),
        ]
    
    def _initialize_weights(self):
        for module in self.backend.modules():
            if isinstance(module, nn.Conv2d):
                nn.init.normal_(module.weight, std=0.01)
                if module.bias is not None:
                    nn.init.constant_(module.bias, 0)
        
        nn.init.normal_(self.output_layer.weight, std=0.01)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.frontend(x)
        density_features = self.backend(features)
        density_map = self.output_layer(density_features)
        return torch.relu(density_map)
    
    def count(self, density_map: torch.Tensor) -> torch.Tensor:
        return density_map.sum(dim=(1, 2, 3))


def get_model_info(model: nn.Module) -> dict:
    """
    Get model information including parameter count.
    
    Args:
        model: PyTorch model
        
    Returns:
        Dictionary with model statistics
    """
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    return {
        "total_parameters": total_params,
        "trainable_parameters": trainable_params,
        "total_params_mb": total_params * 4 / (1024 * 1024),  # Assuming float32
        "model_class": model.__class__.__name__
    }
