"""
Market Sentiment Analysis Endpoints: Financial News NLP & Sentiment Index.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.sentiment import SentimentResponse
from backend.app.api.deps import sentiment_service
from backend.app.core.database import get_database

router = APIRouter(prefix="/sentiment", tags=["Market Sentiment"])


@router.get("", tags=["Market Sentiment"])
@router.get("/", tags=["Market Sentiment"])
async def get_sentiment_service_info():
    """Overview of NLP financial news sentiment analysis capabilities."""
    return {
        "status": "operational",
        "analyzer": "NLTK VADER with Financial Lexicon Augmentation",
        "sentiment_classes": ["Positive", "Neutral", "Negative"],
        "sentiment_index_range": "0 to 100",
        "lexicon_domain": "Equities & Financial Markets",
    }


@router.get("/{symbol}", response_model=SentimentResponse)
@router.get("/{symbol}/", response_model=SentimentResponse)
async def get_market_sentiment(symbol: str, db=Depends(get_database)):
    """
    Fetch and analyze real-time financial news sentiment for a stock symbol.
    Returns composite sentiment score (-1 to +1), 0-100 index,
    positive/neutral/negative breakdown, and analyzed news articles.
    """
    sym = symbol.upper().strip()
    try:
        sentiment_data = sentiment_service.fetch_and_analyze_news(sym)

        # Store in MongoDB sentiment collection
        if db is not None:
            await db.sentiment.insert_one(
                {
                    "symbol": sym,
                    "overall_sentiment": sentiment_data["overall_sentiment"],
                    "sentiment_score": sentiment_data["sentiment_score"],
                    "sentiment_index_100": sentiment_data["sentiment_index_100"],
                    "analyzed_at": datetime.now(timezone.utc).isoformat(),
                }
            )

        return SentimentResponse(**sentiment_data)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Sentiment analysis error for {sym}: {str(e)}"
        )
