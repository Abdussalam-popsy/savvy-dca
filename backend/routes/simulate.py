"""
Simulate Week endpoint
POST /api/simulate-week

Agent action endpoint
POST /api/agent/action
"""
import os
import logging
import asyncio
from flask import Blueprint, request, jsonify
from agent.dca_agent import DCAAgent, SavvyDCAAgent

logger = logging.getLogger(__name__)

simulate_bp = Blueprint('simulate', __name__)

# Agent will be initialized lazily
_agent = None

def get_agent():
    """Get or create agent instance"""
    global _agent
    if _agent is None:
        state_file = os.getenv('STATE_FILE', 'data/agent_state.json')
        _agent = DCAAgent(state_file=state_file)
    return _agent

# Default crypto prices (in GAS/USD equivalent)
DEFAULT_CRYPTO_PRICES = {
    'BTC': 97000,
    'ETH': 3600,
    'USDC': 1,
    'SOL': 230,
    'AVAX': 45,
    'MATIC': 0.55
}


@simulate_bp.route('/simulate-week', methods=['POST'])
def simulate_week():
    """
    Trigger weekly DCA execution
    
    Request body (optional):
    {
        "cryptoPrices": {
            "BTC": 97000,
            "ETH": 3600,
            ...
        }
    }
    
    If cryptoPrices not provided, uses default prices.
    
    Response:
    {
        "hasStrategy": true,
        "strategy": {...},
        "portfolio": {...},
        "nextDCA": "2024-01-15T09:00:00",
        "dcaPoolBalance": 100,
        "transaction": {
            "week": 6,
            "date": "2024-01-08T10:30:00",
            "purchased": {"BTC": 0.002, "ETH": 0.08},
            "gasSpent": 100,
            "txHash": "0x..."
        }
    }
    """
    try:
        data = request.get_json() or {}
        crypto_prices = data.get('cryptoPrices', DEFAULT_CRYPTO_PRICES)
        
        # Execute weekly DCA
        agent = get_agent()
        result = agent.simulate_week(crypto_prices)
        
        # Get the latest transaction
        transactions = agent.get_history()
        if transactions:
            result['transaction'] = transactions[0]
        
        logger.info(f'Week {agent.state.strategy.weeksCompleted if agent.state.strategy else 0} DCA simulated')
        return jsonify(result), 200
        
    except ValueError as e:
        logger.warning(f'Validation error in simulate-week: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error in simulate-week: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@simulate_bp.route('/agent/action', methods=['POST'])
def agent_action():
    """
    Run the Savvy DCA Agent with a user prompt.

    Request body:
    {
        "user_prompt": "Check my balance and swap 1 GAS to NEO",
        "wallet_address": "0x..."
    }
    """
    try:
        data = request.get_json() or {}
        user_prompt = data.get('user_prompt')
        wallet_address = data.get('wallet_address')  # reserved for future tool usage

        if not user_prompt:
            return jsonify({'error': 'user_prompt is required'}), 400

        agent = SavvyDCAAgent()
        # Flask is sync; run the async agent using asyncio.run
        agent_response = asyncio.run(agent.run_analysis(user_prompt))

        return jsonify({'response': agent_response}), 200

    except Exception as e:
        logger.error(f'Error in agent/action: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

