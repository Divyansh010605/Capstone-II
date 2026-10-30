"""
PyTorch Time Series Transformer for Multi-Step Stock Forecasting.
Includes Positional Encoding, Multi-Head Self-Attention, and Feed-Forward Blocks.
"""

import math
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
        return x + self.pe[:, : x.size(1), :]


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
        # Project raw features to d_model space
        projected = self.input_projection(x)
        encoded = self.pos_encoder(projected)
        memory = self.transformer_encoder(encoded)
        # Global pooling or last timestep representation
        last_step = memory[:, -1, :]
        return self.head(last_step)
