"""
PyTorch Deep Multi-layer LSTM for Time Series Forecasting.
"""

import torch
import torch.nn as nn


class LSTMForecaster(nn.Module):
    def __init__(
        self,
        input_size: int,
        hidden_size: int = 64,
        num_layers: int = 2,
        output_size: int = 7,
        dropout: float = 0.2,
    ):
        super(LSTMForecaster, self).__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.output_size = output_size

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        self.layer_norm = nn.LayerNorm(hidden_size)
        self.fc1 = nn.Linear(hidden_size, 32)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(32, output_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, seq_len, input_size)
        out, (hn, cn) = self.lstm(x)
        # Take the last time step representation
        last_step = out[:, -1, :]
        normed = self.layer_norm(last_step)
        fc1_out = self.dropout(self.relu(self.fc1(normed)))
        prediction = self.fc2(fc1_out)
        return prediction
