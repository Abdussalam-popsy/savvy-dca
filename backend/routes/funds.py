"""
Funds management endpoints
POST /api/add-funds
POST /api/withdraw
"""
import os
import logging
from flask import Blueprint, request, jsonify
from agent.dca_agent import DCAAgent

logger = logging.getLogger(__name__)

funds_bp = Blueprint('funds', __name__)

# Agent will be initialized lazily
_agent = None

def get_agent():
    """Get or create agent instance"""
    global _agent
    if _agent is None:
        state_file = os.getenv('STATE_FILE', 'data/agent_state.json')
        _agent = DCAAgent(state_file=state_file)
    return _agent


@funds_bp.route('/add-funds', methods=['POST'])
def add_funds():
    """
    Add money to DCA pool
    
    Request body:
    {
        "amount": 500
    }
    
    Response:
    {
        "hasStrategy": true,
        "strategy": {...},
        "portfolio": {...},
        "nextDCA": "2024-01-08T09:00:00",
        "dcaPoolBalance": 600
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'amount' not in data:
            return jsonify({'error': 'Missing required field: amount'}), 400
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        agent = get_agent()
        result = agent.add_funds(amount)
        
        logger.info(f'Added {amount} GAS to DCA pool')
        return jsonify(result), 200
        
    except ValueError as e:
        logger.warning(f'Validation error in add-funds: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error in add-funds: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@funds_bp.route('/withdraw', methods=['POST'])
def withdraw():
    """
    Withdraw from portfolio
    
    Request body:
    {
        "amount": 1000
    }
    
    Response:
    {
        "hasStrategy": true,
        "strategy": {...},
        "portfolio": {
            "totalValue": 1770,
            ...
        },
        "nextDCA": "2024-01-08T09:00:00",
        "dcaPoolBalance": 200
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'amount' not in data:
            return jsonify({'error': 'Missing required field: amount'}), 400
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        agent = get_agent()
        result = agent.withdraw(amount)
        
        logger.info(f'Withdrew {amount} GAS from portfolio')
        return jsonify(result), 200
        
    except ValueError as e:
        logger.warning(f'Validation error in withdraw: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error in withdraw: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

