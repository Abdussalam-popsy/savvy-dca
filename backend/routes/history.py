"""
Transaction History endpoint
GET /api/history
"""
import os
import logging
from flask import Blueprint, jsonify, request
from agent.dca_agent import DCAAgent

logger = logging.getLogger(__name__)

history_bp = Blueprint('history', __name__)

# Agent will be initialized lazily
_agent = None

def get_agent():
    """Get or create agent instance"""
    global _agent
    if _agent is None:
        state_file = os.getenv('STATE_FILE', 'data/agent_state.json')
        _agent = DCAAgent(state_file=state_file)
    return _agent


@history_bp.route('/history', methods=['GET'])
def get_history():
    """
    Get transaction history
    
    Query parameters (optional):
    - limit: Maximum number of transactions to return (default: all)
    
    Response:
    [
        {
            "week": 5,
            "date": "2024-01-01T09:00:00",
            "purchased": {"BTC": 0.002, "ETH": 0.08, "USDC": 20},
            "gasSpent": 100,
            "txHash": "0x1234..."
        },
        ...
    ]
    """
    try:
        agent = get_agent()
        transactions = agent.get_history()
        
        # Apply limit if provided
        limit = request.args.get('limit', type=int)
        if limit and limit > 0:
            transactions = transactions[:limit]
        
        return jsonify(transactions), 200
        
    except Exception as e:
        logger.error(f'Error in history: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

