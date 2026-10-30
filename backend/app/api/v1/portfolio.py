"""
Portfolio Management Endpoints: Virtual Portfolios, Performance & Allocation.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioResponse,
    PositionActionRequest,
)
from backend.app.api.deps import portfolio_service, get_current_user
from backend.app.core.database import get_database

router = APIRouter(prefix="/portfolio", tags=["Portfolio Management"])


@router.post("", response_model=PortfolioResponse)
async def create_user_portfolio(
    port_in: PortfolioCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database),
):
    """Create a new virtual portfolio with initial capital."""
    user_id = str(current_user["id"])
    created = portfolio_service.create_portfolio(
        user_id=user_id,
        name=port_in.name,
        description=port_in.description or "",
        initial_capital=port_in.initial_capital,
    )

    if db is not None:
        await db.portfolios.insert_one(created.copy())

    summary = portfolio_service.get_portfolio_summary(created["id"])
    return PortfolioResponse(**summary)


@router.get("/{id}", response_model=PortfolioResponse)
async def get_portfolio_details(
    id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve portfolio balance, current valuation, P&L, holdings, and asset allocation."""
    try:
        summary = portfolio_service.get_portfolio_summary(id)
        return PortfolioResponse(**summary)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Portfolio '{id}' not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{id}/positions", response_model=PortfolioResponse)
async def add_stock_to_portfolio(
    id: str,
    action: PositionActionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Add or increase a stock position in the portfolio."""
    try:
        updated = portfolio_service.add_position(
            portfolio_id=id,
            symbol=action.symbol,
            quantity=action.quantity,
            buy_price=action.buy_price,
        )
        return PortfolioResponse(**updated)
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}/positions/{symbol}", response_model=PortfolioResponse)
async def remove_stock_from_portfolio(
    id: str,
    symbol: str,
    quantity: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
):
    """Remove or decrease a stock position in the portfolio."""
    try:
        updated = portfolio_service.remove_position(
            portfolio_id=id,
            symbol=symbol,
            quantity=quantity,
        )
        return PortfolioResponse(**updated)
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
