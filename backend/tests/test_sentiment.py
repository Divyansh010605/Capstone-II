"""
Market Sentiment Analysis Tests.
"""

from fastapi import status
from backend.app.services.sentiment_service import SentimentAnalysisService


def test_sentiment_service_unit():
    service = SentimentAnalysisService()

    pos_res = service.analyze_text("Company reports blowout quarterly earnings and record surge in revenues.")
    assert pos_res["classification"] == "Positive"
    assert pos_res["compound"] > 0

    neg_res = service.analyze_text("Severe losses and executive departure trigger market crash and default fears.")
    assert neg_res["classification"] == "Negative"
    assert neg_res["compound"] < 0


def test_sentiment_api_endpoint(client):
    response = client.get("/api/v1/sentiment/AAPL")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["overall_sentiment"] in ["Positive", "Negative", "Neutral"]
    assert "sentiment_score" in data
    assert "sentiment_index_100" in data
    assert "breakdown" in data
    assert "articles" in data
    assert len(data["articles"]) > 0
