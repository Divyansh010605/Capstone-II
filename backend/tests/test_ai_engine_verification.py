"""
Verification suite for PyTorch AI models, checkpoint loading, any-symbol predictions, and ensemble combinations.
"""

import time
import os
import unittest
import numpy as np
import pandas as pd
import torch

from ai_engine.models.lstm_model import LSTMForecaster
from ai_engine.models.gru_model import GRUForecaster
from ai_engine.models.transformer_model import TimeSeriesTransformer
from ai_engine.models.ensemble import EnsemblePredictor
from ai_engine.training.trainer import ModelTrainer
from ai_engine.inference.predictor import StockPredictorEngine
from ai_engine.evaluation.metrics import evaluate_forecast


class TestAIEngineComponents(unittest.TestCase):
    def setUp(self):
        np.random.seed(42)
        torch.manual_seed(42)
        dates = pd.date_range("2023-01-01", periods=250, freq="D")
        self.df_market = pd.DataFrame(
            {
                "Open": np.linspace(150, 180, 250) + np.random.randn(250),
                "High": np.linspace(152, 182, 250) + np.random.randn(250),
                "Low": np.linspace(148, 178, 250) + np.random.randn(250),
                "Close": np.linspace(150, 180, 250) + np.random.randn(250),
                "Volume": np.random.randint(1000000, 5000000, 250),
            },
            index=dates,
        )
        self.engine = StockPredictorEngine()

    def test_model_architectures_2d_and_3d(self):
        """Verify LSTM, GRU, and Transformer handle both 2D and 3D inputs without error."""
        for name, cls in [
            ("LSTM", LSTMForecaster),
            ("GRU", GRUForecaster),
            ("Transformer", TimeSeriesTransformer),
        ]:
            model = cls(input_size=18, output_size=7)

            # 3D input: (batch_size, seq_len, num_features)
            x3d = torch.randn(2, 60, 18)
            out3d = model(x3d)
            self.assertEqual(out3d.shape, (2, 7))
            self.assertFalse(torch.isnan(out3d).any())

            # 2D input: (seq_len, num_features)
            x2d = torch.randn(60, 18)
            out2d = model(x2d)
            self.assertEqual(out2d.shape, (7,))
            self.assertFalse(torch.isnan(out2d).any())

    def test_checkpoint_loading(self):
        """Verify saved checkpoints for AAPL, GOOGL, TEST load properly."""
        for symbol in ["AAPL", "GOOGL", "TEST"]:
            for name, cls in [
                ("lstm", LSTMForecaster),
                ("gru", GRUForecaster),
                ("transformer", TimeSeriesTransformer),
            ]:
                ckpt = os.path.join(self.engine.models_dir, f"{symbol}_{name}_h7.pt")
                if os.path.exists(ckpt):
                    model = cls(input_size=18, output_size=7)
                    loaded = model.load_weights(ckpt)
                    self.assertTrue(loaded, f"Failed to load weights for {ckpt}")

                    trainer = ModelTrainer(model)
                    trainer_loaded = trainer.load_checkpoint(ckpt)
                    self.assertTrue(trainer_loaded, f"Trainer failed to load {ckpt}")

    def test_ensemble_combination_and_error_handling(self):
        """Verify ensemble robustly combines models, filters NaNs, and normalizes weights."""
        ens = EnsemblePredictor()

        # Update weights with corrupted MSEs (NaN, Inf, negative, or 'ensemble' key)
        val_errors = {
            "lstm": 0.002,
            "gru": float("nan"),
            "transformer": float("inf"),
            "ensemble": 0.001,
        }
        ens.update_weights_from_val_errors(val_errors)

        self.assertIn("lstm", ens.weights)
        self.assertNotIn("gru", ens.weights)
        self.assertNotIn("ensemble", ens.weights)
        self.assertAlmostEqual(sum(ens.weights.values()), 1.0, places=4)

        # Predict when one model produces NaNs
        predictions = {
            "lstm": np.array([150.0, 151.0, 152.0, 153.0, 154.0, 155.0, 156.0]),
            "gru": np.array([float("nan")] * 7),
            "transformer": np.array([152.0, 153.0, 154.0, 155.0, 156.0, 157.0, 158.0]),
            "ensemble": np.array([999.0] * 7),  # Should be filtered out
        }
        comb, low, up, conf = ens.predict(predictions)
        self.assertFalse(np.isnan(comb).any())
        self.assertTrue(np.all(low <= comb))
        self.assertTrue(np.all(comb <= up))
        self.assertTrue(np.all(low > 0.0))

    def test_ensemble_checkpoint_save_and_load(self):
        """Verify saving and restoring ensemble weights and calibration residuals."""
        ens = EnsemblePredictor(weights={"lstm": 0.5, "gru": 0.3, "transformer": 0.2})
        test_ckpt = os.path.join(self.engine.models_dir, "TEST_ensemble_unit.pt")
        ens.save(test_ckpt)

        loaded_ens = EnsemblePredictor()
        loaded = loaded_ens.load(test_ckpt)
        self.assertTrue(loaded)
        self.assertAlmostEqual(loaded_ens.weights["lstm"], 0.5, places=4)
        if os.path.exists(test_ckpt):
            os.remove(test_ckpt)

    def test_aapl_fast_loading_and_prediction(self):
        """Verify AAPL loads pre-trained models and executes quickly with valid bounds."""
        t0 = time.time()
        res = self.engine.generate_predictions("AAPL", self.df_market, horizon=7, selected_model="ensemble")
        duration = time.time() - t0

        self.assertEqual(res["symbol"], "AAPL")
        self.assertEqual(res["horizon_days"], 7)
        self.assertIn(res["trend"], ["Bullish", "Bearish", "Sideways"])
        self.assertGreater(res["current_price"], 0)
        self.assertGreater(res["predicted_final_price"], 0)
        self.assertEqual(len(res["forecast"]), 7)

        # Verify all forecast points have strict bound conformance
        for pt in res["forecast"]:
            self.assertLessEqual(pt["lower_bound"], pt["predicted_price"])
            self.assertLessEqual(pt["predicted_price"], pt["upper_bound"])
            self.assertGreater(pt["lower_bound"], 0.0)

        # Pre-trained models should infer quickly (< 5 seconds)
        self.assertLess(duration, 5.0)

    def test_short_history_no_zero_division(self):
        """Verify engine succeeds without ZeroDivisionError on short history (80 bars)."""
        df_short = self.df_market.iloc[-80:].copy()
        res = self.engine.generate_predictions("TEST_SHORT", df_short, horizon=7, selected_model="transformer")
        self.assertEqual(len(res["forecast"]), 7)
        self.assertFalse(np.isnan(res["predicted_final_price"]))

    def test_any_stock_symbol_and_custom_horizon(self):
        """Verify engine works for any arbitrary stock symbol and custom horizons (e.g. TSLA, 14 days)."""
        res = self.engine.generate_predictions("TSLA", self.df_market, horizon=14, selected_model="lstm")
        self.assertEqual(res["symbol"], "TSLA")
        self.assertEqual(res["horizon_days"], 14)
        self.assertEqual(len(res["forecast"]), 14)
        for pt in res["forecast"]:
            self.assertLessEqual(pt["lower_bound"], pt["predicted_price"])
            self.assertLessEqual(pt["predicted_price"], pt["upper_bound"])

    def test_all_model_selections(self):
        """Verify selected_model parameter works for lstm, gru, transformer, and ensemble."""
        for model_name in ["lstm", "gru", "transformer", "ensemble"]:
            res = self.engine.generate_predictions("AAPL", self.df_market, horizon=7, selected_model=model_name)
            self.assertEqual(res["selected_model"], model_name)
            self.assertGreaterEqual(res["evaluation_metrics"]["mae"], 0.0)
            self.assertFalse(np.isnan(res["predicted_final_price"]))
            for pt in res["forecast"]:
                self.assertLessEqual(pt["lower_bound"], pt["predicted_price"])
                self.assertLessEqual(pt["predicted_price"], pt["upper_bound"])


if __name__ == "__main__":
    unittest.main()

