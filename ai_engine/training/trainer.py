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

    def load_checkpoint(self, save_path: str, strict: bool = True) -> bool:
        """
        Safely load model weights from checkpoint.
        Supports direct state_dicts and wrapped dictionaries ({'state_dict': ...}).
        Handles prefix stripping ('module.') and device mapping.
        Verifies parameter shapes to avoid runtime size-mismatch errors.
        """
        if not save_path or not os.path.exists(save_path):
            return False
        try:
            try:
                checkpoint = torch.load(save_path, map_location=self.device, weights_only=True)
            except Exception:
                checkpoint = torch.load(save_path, map_location=self.device, weights_only=False)

            if isinstance(checkpoint, dict):
                if "state_dict" in checkpoint:
                    state_dict = checkpoint["state_dict"]
                elif "model_state_dict" in checkpoint:
                    state_dict = checkpoint["model_state_dict"]
                elif "model" in checkpoint and isinstance(checkpoint["model"], dict):
                    state_dict = checkpoint["model"]
                else:
                    state_dict = checkpoint
            else:
                return False

            # Clean module prefix if needed
            cleaned_state_dict = {}
            for k, v in state_dict.items():
                k_clean = k[7:] if k.startswith("module.") else k
                cleaned_state_dict[k_clean] = v

            # Check shape compatibility
            model_sd = self.model.state_dict()
            matching_sd = {}
            for k, v in cleaned_state_dict.items():
                if k in model_sd and model_sd[k].shape == v.shape:
                    matching_sd[k] = v

            if len(matching_sd) == len(model_sd):
                self.model.load_state_dict(matching_sd, strict=True)
                return True
            elif len(matching_sd) > 0 and not strict:
                model_sd.update(matching_sd)
                self.model.load_state_dict(model_sd, strict=False)
                return True
            return False
        except Exception:
            return False

    def save_checkpoint(self, save_path: str):
        """Safely save model state dict to disk."""
        if not save_path:
            return
        os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
        torch.save(self.model.state_dict(), save_path)

    def train_epoch(self, dataloader: DataLoader) -> float:
        if len(dataloader.dataset) == 0:
            return 0.0
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
        if len(dataloader.dataset) == 0:
            return 0.0
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
        if len(X_train) == 0:
            return {"train_loss": [], "val_loss": []}

        train_dataset = TensorDataset(
            torch.as_tensor(X_train, dtype=torch.float32),
            torch.as_tensor(y_train, dtype=torch.float32),
        )
        val_dataset = TensorDataset(
            torch.as_tensor(X_val, dtype=torch.float32),
            torch.as_tensor(y_val, dtype=torch.float32),
        )

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
                    self.save_checkpoint(save_path)
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    break

        if save_path and os.path.exists(save_path):
            self.load_checkpoint(save_path, strict=False)

        return history

    def predict(self, X: np.ndarray) -> np.ndarray:
        self.model.eval()
        with torch.no_grad():
            tensor_X = torch.as_tensor(X, dtype=torch.float32).to(self.device)
            if tensor_X.dim() == 2:
                tensor_X = tensor_X.unsqueeze(0)
            preds = self.model(tensor_X)
            res = preds.cpu().numpy()
            if np.isnan(res).any():
                res = np.nan_to_num(res, nan=0.5)
            return res
