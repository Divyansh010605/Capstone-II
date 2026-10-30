"""
PyTorch Model Trainer with Early Stopping, Checkpointing, and Walk-Forward Validation.
"""

import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np


class ModelTrainer:
    def __init__(
        self,
        model: nn.Module,
        learning_rate: float = 1e-3,
        weight_decay: float = 1e-4,
        device: str = "cpu",
    ):
        self.device = torch.device(device if torch.cuda.is_available() and device == "cuda" else "cpu")
        self.model = model.to(self.device)
        self.criterion = nn.MSELoss()
        self.optimizer = torch.optim.Adam(
            self.model.parameters(), lr=learning_rate, weight_decay=weight_decay
        )

    def train_epoch(self, dataloader: DataLoader) -> float:
        self.model.train()
        total_loss = 0.0

        for X_batch, y_batch in dataloader:
            X_batch = X_batch.to(self.device)
            y_batch = y_batch.to(self.device)

            self.optimizer.zero_grad()
            preds = self.model(X_batch)
            loss = self.criterion(preds, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()

            total_loss += loss.item() * len(X_batch)

        return total_loss / len(dataloader.dataset)

    def evaluate(self, dataloader: DataLoader) -> float:
        self.model.eval()
        total_loss = 0.0

        with torch.no_grad():
            for X_batch, y_batch in dataloader:
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)

                preds = self.model(X_batch)
                loss = self.criterion(preds, y_batch)
                total_loss += loss.item() * len(X_batch)

        return total_loss / len(dataloader.dataset)

    def fit(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        epochs: int = 50,
        batch_size: int = 32,
        patience: int = 7,
        save_path: str = None,
    ) -> dict:
        train_dataset = TensorDataset(torch.tensor(X_train), torch.tensor(y_train))
        val_dataset = TensorDataset(torch.tensor(X_val), torch.tensor(y_val))

        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=False)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

        best_val_loss = float("inf")
        patience_counter = 0
        history = {"train_loss": [], "val_loss": []}

        for epoch in range(1, epochs + 1):
            train_loss = self.train_epoch(train_loader)
            val_loss = self.evaluate(val_loader)

            history["train_loss"].append(train_loss)
            history["val_loss"].append(val_loss)

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                if save_path:
                    os.makedirs(os.path.dirname(save_path), exist_ok=True)
                    torch.save(self.model.state_dict(), save_path)
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    break

        if save_path and os.path.exists(save_path):
            self.model.load_state_dict(torch.load(save_path, map_location=self.device))

        return history

    def predict(self, X: np.ndarray) -> np.ndarray:
        self.model.eval()
        with torch.no_grad():
            tensor_X = torch.tensor(X, dtype=torch.float32).to(self.device)
            preds = self.model(tensor_X)
            return preds.cpu().numpy()
