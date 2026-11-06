"""
Pydantic Schemas for Market Sentiment Analysis.
"""

from typing import List, Dict, Optional, Union
from pydantic import BaseModel


class NewsArticle(BaseModel):
    title: str
    publisher: Optional[str] = "Market Wire"
    published_at: Optional[str] = ""
    url: Optional[str] = ""
    sentiment: str  # Positive, Negative, Neutral
    score: float
    confidence: float


class SentimentBreakdown(BaseModel):
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    total_articles: int


class SentimentResponse(BaseModel):
    symbol: str
    overall_sentiment: str  # Positive, Negative, Neutral
    sentiment_score: float  # -1.0 to 1.0
    sentiment_index_100: Union[float, int]  # 0 to 100
    sentiment_summary: str
    breakdown: SentimentBreakdown
    articles: List[NewsArticle]
    analyzed_at: str
