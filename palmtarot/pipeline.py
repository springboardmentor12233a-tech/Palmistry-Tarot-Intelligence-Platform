import logging
from typing import Any

import numpy as np

from .clustering import PalmClusterPipeline
from .features import LandmarkExtractor
from .llm import LLMInterpreter
from .palm_engine import PalmSegmenter, generate_palm_rule_report
from .report import generate_pdf_report
from .tarot_engine import TarotDeck

logger = logging.getLogger(__name__)


class PalmTarotPipeline:
    """End-to-End Orchestrator for Palmistry & Tarot Intelligence Platform."""

    def __init__(self):
        logger.info("Initializing PalmTarotPipeline components...")
        self.landmark_extractor = LandmarkExtractor()
        self.cluster_pipeline = PalmClusterPipeline().fit()
        self.segmenter = PalmSegmenter()
        self.tarot_deck = TarotDeck()
        self.llm_interpreter = LLMInterpreter()

    def run_palm_analysis(self, image_np: np.ndarray) -> dict[str, Any]:
        """Run landmark extraction, geometric rules, PCA/KMeans clustering, and UNet segmentation."""
        # 1. Landmark & Feature Extraction
        lm_res = self.landmark_extractor.extract_from_image_array(image_np)
        landmarks = lm_res["landmarks"]
        features = lm_res["features"]

        # 2. PCA + KMeans Cluster Assignment
        cluster_id, pca_coords = self.cluster_pipeline.transform_and_predict(features)

        # 3. Geometric Rule-Based Report
        rule_report = generate_palm_rule_report(features)

        # 4. UNet Palm Line Segmentation & Contour Extraction
        _img_512, roi = self.segmenter.preprocess_roi(image_np)
        mask = self.segmenter.predict_mask(roi)
        seg_res = self.segmenter.extract_palm_line_features(roi, mask)

        return {
            "landmarks": landmarks,
            "engineered_features": features,
            "cluster": {
                "cluster_id": cluster_id,
                "pca_coords": pca_coords
            },
            "rule_report": rule_report,
            "palm_lines": seg_res["line_features"],
            "segmented_mask": seg_res["mask"],
            "overlay_image": seg_res["overlay_image"]
        }

    def run_tarot_reading(self, num_cards: int = 3, seed: int | None = None) -> dict[str, Any]:
        """Run tarot deck draw."""
        cards = self.tarot_deck.draw_cards(num_cards=num_cards, seed=seed)
        return {
            "num_cards": num_cards,
            "cards": cards
        }

    def run_full_pipeline(
        self,
        image_np: np.ndarray,
        user_question: str | None = None,
        num_cards: int = 3,
        seed: int | None = None
    ) -> dict[str, Any]:
        """Run integrated Palm + Tarot + LLM + PDF generation pipeline."""
        palm_res = self.run_palm_analysis(image_np)
        tarot_res = self.run_tarot_reading(num_cards=num_cards, seed=seed)

        # Generate LLM Narrative
        llm_narrative = self.llm_interpreter.generate_reading(
            palm_features=palm_res["engineered_features"],
            palm_report=palm_res["rule_report"],
            tarot_reading=tarot_res,
            user_question=user_question
        )

        reading_summary = {
            "user_question": user_question or "General Self-Reflection",
            "palm_features": palm_res["engineered_features"],
            "palm_report": palm_res["rule_report"],
            "palm_lines": palm_res["palm_lines"],
            "cluster": palm_res["cluster"],
            "tarot_reading": tarot_res,
            "interpretation": llm_narrative
        }

        # Generate PDF Report
        pdf_path = generate_pdf_report(reading_summary)
        reading_summary["pdf_path"] = str(pdf_path)

        return reading_summary
