"""
SpoonOS DCA Agent
Autonomous agent for managing Dollar Cost Averaging strategies
"""
import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Any
from dataclasses import dataclass, asdict
from pathlib import Path

from pydantic import Field

from spoon_ai.agents.toolcall import ToolCallAgent
from spoon_ai.chat import ChatBot
from spoon_ai.tools import ToolManager

from .tools import NeoBalanceTool, NeoSwapTool

logger = logging.getLogger(__name__)


@dataclass
class StrategyConfig:
    """DCA Strategy configuration"""
    id: str
    name: str
    creator: str
    allocation: Dict[str, float]  # e.g., {"BTC": 50, "ETH": 30, "USDC": 20}
    weeklyAmount: float
    weeksCompleted: int = 0
    totalWeeks: Optional[int] = None
    strictMode: bool = True


@dataclass
class Portfolio:
    """Portfolio holdings and metrics"""
    holdings: Dict[str, float]  # Coin amounts
    holdingsValue: Dict[str, float]  # Current USD value
    holdingsChange: Dict[str, float]  # Percentage change
    totalValue: float
    costBasis: float
    profitLoss: float
    profitLossPercent: float


@dataclass
class Transaction:
    """DCA transaction record"""
    week: int
    date: str
    purchased: Dict[str, float]
    gasSpent: float
    txHash: str


@dataclass
class AgentState:
    """Complete agent state"""
    hasStrategy: bool
    strategy: Optional[StrategyConfig]
    portfolio: Portfolio
    nextDCA: str  # ISO format datetime
    dcaPoolBalance: float
    transactions: List[Transaction]
    createdAt: str
    updatedAt: str


class DCAAgent:
    """
    SpoonOS agent for managing DCA strategies
    Handles state persistence, strategy execution, and portfolio management
    """
    
    def __init__(self, state_file: str = 'data/agent_state.json'):
        self.state_file = state_file
        self.state: Optional[AgentState] = None
        self._load_state()
    
    def _load_state(self) -> None:
        """Load agent state from JSON file"""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    self.state = self._deserialize_state(data)
                logger.info(f'Loaded state from {self.state_file}')
            else:
                self.state = self._create_initial_state()
                self._save_state()
                logger.info('Created initial state')
        except Exception as e:
            logger.error(f'Error loading state: {e}')
            self.state = self._create_initial_state()
            self._save_state()
    
    def _create_initial_state(self) -> AgentState:
        """Create initial empty state"""
        return AgentState(
            hasStrategy=False,
            strategy=None,
            portfolio=Portfolio(
                holdings={},
                holdingsValue={},
                holdingsChange={},
                totalValue=0.0,
                costBasis=0.0,
                profitLoss=0.0,
                profitLossPercent=0.0
            ),
            nextDCA=self._get_next_monday().isoformat(),
            dcaPoolBalance=0.0,
            transactions=[],
            createdAt=datetime.utcnow().isoformat(),
            updatedAt=datetime.utcnow().isoformat()
        )
    
    def _deserialize_state(self, data: Dict) -> AgentState:
        """Deserialize JSON data to AgentState"""
        strategy = None
        if data.get('strategy'):
            strategy = StrategyConfig(**data['strategy'])
        
        portfolio = Portfolio(**data['portfolio'])
        
        transactions = [
            Transaction(**tx) for tx in data.get('transactions', [])
        ]
        
        return AgentState(
            hasStrategy=data.get('hasStrategy', False),
            strategy=strategy,
            portfolio=portfolio,
            nextDCA=data.get('nextDCA', self._get_next_monday().isoformat()),
            dcaPoolBalance=data.get('dcaPoolBalance', 0.0),
            transactions=transactions,
            createdAt=data.get('createdAt', datetime.utcnow().isoformat()),
            updatedAt=data.get('updatedAt', datetime.utcnow().isoformat())
        )
    
    def _save_state(self) -> None:
        """Save agent state to JSON file"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
            
            # Update timestamp
            self.state.updatedAt = datetime.utcnow().isoformat()
            
            # Serialize state
            data = {
                'hasStrategy': self.state.hasStrategy,
                'strategy': asdict(self.state.strategy) if self.state.strategy else None,
                'portfolio': asdict(self.state.portfolio),
                'nextDCA': self.state.nextDCA,
                'dcaPoolBalance': self.state.dcaPoolBalance,
                'transactions': [asdict(tx) for tx in self.state.transactions],
                'createdAt': self.state.createdAt,
                'updatedAt': self.state.updatedAt
            }
            
            with open(self.state_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.debug(f'State saved to {self.state_file}')
        except Exception as e:
            logger.error(f'Error saving state: {e}')
            raise
    
    def _get_next_monday(self) -> datetime:
        """Calculate next Monday at 9 AM"""
        now = datetime.utcnow()
        day_of_week = now.weekday()  # 0 = Monday, 6 = Sunday
        days_until_monday = (7 - day_of_week) % 7
        if days_until_monday == 0:
            days_until_monday = 7  # If today is Monday, get next Monday
        
        next_monday = now + timedelta(days=days_until_monday)
        next_monday = next_monday.replace(hour=9, minute=0, second=0, microsecond=0)
        return next_monday
    
    def setup_goal(self, strategy_id: str, strategy_name: str, creator: str,
                   allocation: Dict[str, float], weekly_amount: float,
                   duration: Optional[int] = None, strict_mode: bool = True) -> Dict[str, Any]:
        """
        Setup a new DCA strategy goal
        
        Args:
            strategy_id: Unique strategy identifier
            strategy_name: Name of the strategy
            creator: Strategy creator name
            allocation: Asset allocation percentages (e.g., {"BTC": 50, "ETH": 30})
            weekly_amount: Amount to invest per week in GAS
            duration: Total weeks (None for indefinite)
            strict_mode: Whether to enforce strict DCA schedule
        
        Returns:
            Updated state dictionary
        """
        strategy = StrategyConfig(
            id=strategy_id,
            name=strategy_name,
            creator=creator,
            allocation=allocation,
            weeklyAmount=weekly_amount,
            weeksCompleted=0,
            totalWeeks=duration,
            strictMode=strict_mode
        )
        
        # Initialize portfolio
        portfolio = Portfolio(
            holdings={},
            holdingsValue={},
            holdingsChange={},
            totalValue=0.0,
            costBasis=0.0,
            profitLoss=0.0,
            profitLossPercent=0.0
        )
        
        # Set initial pool balance (5 weeks of runway)
        initial_balance = weekly_amount * 5
        
        self.state = AgentState(
            hasStrategy=True,
            strategy=strategy,
            portfolio=portfolio,
            nextDCA=self._get_next_monday().isoformat(),
            dcaPoolBalance=initial_balance,
            transactions=[],
            createdAt=datetime.utcnow().isoformat(),
            updatedAt=datetime.utcnow().isoformat()
        )
        
        self._save_state()
        logger.info(f'DCA goal setup: {strategy_name} - {weekly_amount} GAS/week')
        
        return self.get_state_dict()
    
    def get_status(self) -> Dict[str, Any]:
        """Get current portfolio and strategy status"""
        return self.get_state_dict()
    
    def simulate_week(self, crypto_prices: Dict[str, float]) -> Dict[str, Any]:
        """
        Simulate weekly DCA execution
        
        Args:
            crypto_prices: Current crypto prices in GAS (e.g., {"BTC": 97000, "ETH": 3600})
        
        Returns:
            Updated state dictionary with transaction details
        """
        if not self.state.hasStrategy or not self.state.strategy:
            raise ValueError("No strategy configured")
        
        strategy = self.state.strategy
        weekly_amount = strategy.weeklyAmount
        
        # Check sufficient balance
        if self.state.dcaPoolBalance < weekly_amount:
            raise ValueError(f"Insufficient funds. Need {weekly_amount} GAS, have {self.state.dcaPoolBalance} GAS")
        
        # Calculate purchases for each asset
        new_holdings = dict(self.state.portfolio.holdings)
        purchased: Dict[str, float] = {}
        
        for coin, percent in strategy.allocation.items():
            gas_for_coin = weekly_amount * (percent / 100)
            price = crypto_prices.get(coin, 1.0)
            
            # Add slight randomness to simulate price volatility
            import random
            adjusted_price = price * (1 + (random.random() - 0.5) * 0.1)
            coin_amount = gas_for_coin / adjusted_price
            
            new_holdings[coin] = new_holdings.get(coin, 0) + coin_amount
            purchased[coin] = coin_amount
        
        # Update portfolio values
        new_holdings_value: Dict[str, float] = {}
        new_holdings_change: Dict[str, float] = {}
        
        for coin, amount in new_holdings.items():
            price = crypto_prices.get(coin, 1.0)
            import random
            price_change = (random.random() - 0.3) * 0.1  # Slight positive bias
            new_holdings_value[coin] = amount * price * (1 + price_change)
            new_holdings_change[coin] = price_change * 100
        
        # Calculate portfolio metrics
        new_cost_basis = self.state.portfolio.costBasis + weekly_amount
        new_total_value = sum(new_holdings_value.values())
        new_profit_loss = new_total_value - new_cost_basis
        new_profit_loss_percent = (new_profit_loss / new_cost_basis * 100) if new_cost_basis > 0 else 0
        
        # Create transaction record
        new_weeks_completed = strategy.weeksCompleted + 1
        transaction = Transaction(
            week=new_weeks_completed,
            date=datetime.utcnow().isoformat(),
            purchased=purchased,
            gasSpent=weekly_amount,
            txHash=f"0x{os.urandom(8).hex()}"  # Simulated transaction hash
        )
        
        # Update state
        self.state.strategy.weeksCompleted = new_weeks_completed
        self.state.portfolio = Portfolio(
            holdings=new_holdings,
            holdingsValue=new_holdings_value,
            holdingsChange=new_holdings_change,
            totalValue=round(new_total_value, 2),
            costBasis=new_cost_basis,
            profitLoss=round(new_profit_loss, 2),
            profitLossPercent=round(new_profit_loss_percent, 2)
        )
        self.state.dcaPoolBalance -= weekly_amount
        self.state.nextDCA = self._get_next_monday().isoformat()
        self.state.transactions.insert(0, transaction)  # Add to beginning
        
        self._save_state()
        logger.info(f'Week {new_weeks_completed} DCA executed: {weekly_amount} GAS')
        
        return self.get_state_dict()
    
    def add_funds(self, amount: float) -> Dict[str, Any]:
        """
        Add funds to DCA pool
        
        Args:
            amount: Amount to add in GAS
        
        Returns:
            Updated state dictionary
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        self.state.dcaPoolBalance += amount
        self._save_state()
        logger.info(f'Added {amount} GAS to DCA pool')
        
        return self.get_state_dict()
    
    def withdraw(self, amount: float) -> Dict[str, Any]:
        """
        Withdraw from portfolio
        
        Args:
            amount: Amount to withdraw in GAS
        
        Returns:
            Updated state dictionary
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")
        
        if self.state.portfolio.totalValue < amount:
            raise ValueError(f"Insufficient portfolio value. Have {self.state.portfolio.totalValue} GAS, need {amount} GAS")
        
        # Simple withdrawal: reduce total value proportionally
        # In production, this would execute actual blockchain transactions
        withdrawal_ratio = amount / self.state.portfolio.totalValue
        
        new_holdings = {}
        new_holdings_value = {}
        
        for coin, amount_held in self.state.portfolio.holdings.items():
            new_amount = amount_held * (1 - withdrawal_ratio)
            new_holdings[coin] = new_amount
            price = self.state.portfolio.holdingsValue.get(coin, 0) / (amount_held if amount_held > 0 else 1)
            new_holdings_value[coin] = new_amount * price
        
        new_total_value = sum(new_holdings_value.values())
        new_profit_loss = new_total_value - self.state.portfolio.costBasis
        new_profit_loss_percent = (new_profit_loss / self.state.portfolio.costBasis * 100) if self.state.portfolio.costBasis > 0 else 0
        
        self.state.portfolio = Portfolio(
            holdings=new_holdings,
            holdingsValue=new_holdings_value,
            holdingsChange=self.state.portfolio.holdingsChange,
            totalValue=round(new_total_value, 2),
            costBasis=self.state.portfolio.costBasis,
            profitLoss=round(new_profit_loss, 2),
            profitLossPercent=round(new_profit_loss_percent, 2)
        )
        
        self._save_state()
        logger.info(f'Withdrew {amount} GAS from portfolio')
        
        return self.get_state_dict()
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Get transaction history"""
        return [asdict(tx) for tx in self.state.transactions]
    
    def get_state_dict(self) -> Dict[str, Any]:
        """Get current state as dictionary for API responses"""
        return {
            'hasStrategy': self.state.hasStrategy,
            'strategy': asdict(self.state.strategy) if self.state.strategy else None,
            'portfolio': asdict(self.state.portfolio),
            'nextDCA': self.state.nextDCA,
            'dcaPoolBalance': self.state.dcaPoolBalance
        }


class SavvyDCAAgent(ToolCallAgent):
    """Autonomous agent that manages DCA strategies and Neo X trades."""

    name: str = Field(default="savvy_dca_agent")
    description: str = Field(default="An autonomous agent that manages DCA strategies and executes trades on Neo X.")

    system_prompt: str = (
        "You are a Savvy DCA Agent on the Neo X blockchain. Your goal is to help users invest wisely. "
        "Always check the wallet balance using NeoBalanceTool before attempting any trades. "
        "If a user asks to swap, use NeoSwapTool. Be concise and professional."
    )

    available_tools: ToolManager = Field(
        default_factory=lambda: ToolManager([NeoBalanceTool(), NeoSwapTool()])
    )

    def __init__(self, **kwargs):
        chatbot = ChatBot(llm_provider="gemini", model_name="gemini-2.0-flash")
        super().__init__(llm=chatbot, **kwargs)
    
    async def run_analysis(self, user_query: str) -> str:
        """Run the agent analysis with a fresh state."""
        self.clear()
        return await self.run(user_query)
