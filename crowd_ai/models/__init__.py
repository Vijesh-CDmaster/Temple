"""
CSRNet Model Module
===================
Congested Scene Recognition Network for crowd counting.
Based on the paper: "CSRNet: Dilated Convolutional Neural Networks 
for Understanding the Highly Congested Scenes" (CVPR 2018)
"""

from .csrnet import CSRNet, CSRNetLite, get_model_info
from .model_loader import load_csrnet_model, download_pretrained_weights, create_mock_model

__all__ = [
    "CSRNet", 
    "CSRNetLite",
    "get_model_info",
    "load_csrnet_model", 
    "download_pretrained_weights",
    "create_mock_model"
]
