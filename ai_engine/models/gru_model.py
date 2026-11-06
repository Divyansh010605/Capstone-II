"""
PyTorch Gated Recurrent Unit (GRU) for Time Series Forecasting.
"""

import os
from typing import Optional
import torch
import torch.nn as nn


class GRUForecaster(nn.Module):
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 64,
        num_layers: int = 2,
        output_size: int = 7,
        dropout: float = 0.2,
    ):
        super(GRUForecaster, self).__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.output_size = output_size

        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        self.layer_norm = nn.LayerNorm(hidden_size)
        self.fc1 = nn.Linear(hidden_size, 32)
        self.gelu = nn.GELU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(32, output_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Accept 2D (seq_len, input_size) or 3D (batch_size, seq_len, input_size)
        if not isinstance(x, torch.Tensor):
            x = torch.as_tensor(x, dtype=torch.float32)
        else:
            x = x.float()

        is_2d = (x.dim() == 2)
        if is_2d:
            x = x.unsqueeze(0)

        out, hn = self.gru(x)
        last_step = out[:, -1, :]
        normed = self.layer_norm(last_step)
        fc1_out = self.dropout(self.gelu(self.fc1(normed)))
        prediction = self.fc2(fc1_out)

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

