"""
Status endpoint
GET /api/status
"""
import os
import logging
from flask import Blueprint, jsonify
from agent.dca_agent import DCAAgent

logger = logging.getLogger(__name__)

status_bp = Blueprint('status', __name__)

# Agent will be initialized lazily
_agent = None

def get_agent():
    """Get or create agent instance"""
    global _agent
    if _agent is None:
        state_file = os.getenv('STATE_FILE', 'data/agent_state.json')
        _agent = DCAAgent(state_file=state_file)
    return _agent


@status_bp.route('/status', methods=['GET'])
def get_status():
    """
    Get current portfolio and strategy status
    
    Response:
    {
        "hasStrategy": true,
        "strategy": {
            "id": "safestack",
            "name": "SafeStack",
            "creator": "CryptoSara",
            "allocation": {"BTC": 50, "ETH": 30, "USDC": 20},
            "weeklyAmount": 100,
            "weeksCompleted": 5,
            "totalWeeks": 52,
            "strictMode": true
        },
        "portfolio": {
            "holdings": {"BTC": 0.01, "ETH": 0.5},
            "holdingsValue": {"BTC": 970, "ETH": 1800},
            "holdingsChange": {"BTC": 2.5, "ETH": -1.2},
            "totalValue": 2770,
            "costBasis": 500,
            "profitLoss": 2270,
            "profitLossPercent": 454
        },
        "nextDCA": "2024-01-08T09:00:00",
        "dcaPoolBalance": 200
    }
    """
    try:
        agent = get_agent()
        result = agent.get_status()
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f'Error in status: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

