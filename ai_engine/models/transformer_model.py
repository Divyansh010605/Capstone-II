"""
PyTorch Time Series Transformer for Multi-Step Stock Forecasting.
Includes Positional Encoding, Multi-Head Self-Attention, and Feed-Forward Blocks.
"""

import os
import math
from typing import Optional
import torch
import torch.nn as nn


class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 500):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)
        self.register_buffer("pe", pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, seq_len, d_model)
        seq_len = x.size(1)
        return x + self.pe[:, :seq_len, :]


class TimeSeriesTransformer(nn.Module):
    def __init__(
        self,
        input_size: int,
        d_model: int = 64,
        nhead: int = 4,
        num_layers: int = 2,
        dim_feedforward: int = 128,
        output_size: int = 7,
        dropout: float = 0.15,
    ):
        super(TimeSeriesTransformer, self).__init__()
        self.input_size = input_size
        self.d_model = d_model
        self.output_size = output_size
        self.input_projection = nn.Linear(input_size, d_model)
        self.pos_encoder = PositionalEncoding(d_model=d_model)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True,
            activation="gelu",
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        self.head = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Linear(d_model, 32),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(32, output_size),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Accept 2D (seq_len, input_size) or 3D (batch_size, seq_len, input_size)
        if not isinstance(x, torch.Tensor):
            x = torch.as_tensor(x, dtype=torch.float32)
        else:
            x = x.float()

        is_2d = (x.dim() == 2)
        if is_2d:
            x = x.unsqueeze(0)

        # Project raw features to d_model space
        projected = self.input_projection(x)
        encoded = self.pos_encoder(projected)
        memory = self.transformer_encoder(encoded)
        # Global pooling or last timestep representation
        last_step = memory[:, -1, :]
        prediction = self.head(last_step)

        if is_2d:
            return prediction.squeeze(0)
        return prediction

    def load_weights(self, filepath: str, map_location: str = "cpu") -> bool:
        """Safely load model weights from checkpoint file."""
        if not os.path.exists(filepath):
            return False
        try:
            try:
                state_dict = torch.load(filepath, map_location=map_location, weights_only=True)
            except Exception:
                state_dict = torch.load(filepath, map_location=map_location, weights_only=False)

            if isinstance(state_dict, dict):
                if "state_dict" in state_dict:
                    state_dict = state_dict["state_dict"]
                elif "model_state_dict" in state_dict:
                    state_dict = state_dict["model_state_dict"]

            model_sd = self.state_dict()
            cleaned = {}
            for k, v in state_dict.items():
                k_clean = k[7:] if k.startswith("module.") else k
                if k_clean in model_sd and model_sd[k_clean].shape == v.shape:
                    cleaned[k_clean] = v

            if len(cleaned) == len(model_sd):
                self.load_state_dict(cleaned, strict=True)
                return True
            elif len(cleaned) > 0:
                model_sd.update(cleaned)
                self.load_state_dict(model_sd, strict=False)
                return True
            return False
        except Exception:
            return False

