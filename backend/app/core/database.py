"""
MongoDB Connection Manager & Index Initializer.
Async motor-based client with graceful connection pooling, index creation,
and resilient fallbacks.
"""

import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger("stock_market_ai.database")


class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False

    async def connect(self):
        """Initialize connection to MongoDB and ensure indexes."""
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]

            # Ping server
            await self.client.admin.command("ping")
            self.is_connected = True
            logger.info("Successfully connected to MongoDB!")

            # Create standard collections and indexes
            await self.create_indexes()
        except Exception as e:
            self.is_connected = False
            if self.client:
                self.client.close()
                self.client = None
            self.db = None
            logger.warning(
                f"MongoDB connection failed ({e}). Operating in memory/hybrid fallback mode."
            )

    async def create_indexes(self):
        """Create indexes for performance and uniqueness constraints."""
        if not self.is_connected or self.db is None:
            return

        try:
            # 1. users: unique email and username
            await self.db.users.create_index("email", unique=True)
            await self.db.users.create_index("username", unique=True)

            # 2. stocks: unique symbol
            await self.db.stocks.create_index("symbol", unique=True)

            # 3. historical_prices: compound symbol + date index
            await self.db.historical_prices.create_index(
                [("symbol", 1), ("date", 1)], unique=True
            )

            # 4. predictions: symbol + created_at
            await self.db.predictions.create_index([("symbol", 1), ("created_at", -1)])

            # 5. risk_metrics: symbol + calculated_at
            await self.db.risk_metrics.create_index(
                [("symbol", 1), ("calculated_at", -1)]
            )

            # 6. portfolios: user_id + id
            await self.db.portfolios.create_index([("user_id", 1), ("id", 1)], unique=True)

            # 7. watchlists: user_id
            await self.db.watchlists.create_index("user_id", unique=True)

            # 8. sentiment: symbol + analyzed_at
            await self.db.sentiment.create_index([("symbol", 1), ("analyzed_at", -1)])

            logger.info("MongoDB collections and indexes successfully initialized.")
        except Exception as e:
            logger.warning(f"Error creating MongoDB indexes: {e}")

    async def close(self):
        """Close MongoDB connection client."""
        if self.client:
            self.client.close()
            self.client = None
            self.is_connected = False
            logger.info("MongoDB connection closed.")


db_manager = DatabaseManager()


async def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Dependency provider for database instance."""
    if db_manager.is_connected:
        return db_manager.db
    return None
