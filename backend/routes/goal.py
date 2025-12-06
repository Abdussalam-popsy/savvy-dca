"""
Setup Goal endpoint
POST /api/setup-goal
"""
import os
import logging
from flask import Blueprint, request, jsonify
from agent.dca_agent import DCAAgent

logger = logging.getLogger(__name__)

goal_bp = Blueprint('goal', __name__)

# Agent will be initialized lazily
_agent = None

def get_agent():
    """Get or create agent instance"""
    global _agent
    if _agent is None:
        state_file = os.getenv('STATE_FILE', 'data/agent_state.json')
        _agent = DCAAgent(state_file=state_file)
    return _agent


@goal_bp.route('/setup-goal', methods=['POST'])
def setup_goal():
    """
    Setup a new DCA strategy goal
    
    Request body:
    {
        "strategyId": "safestack",
        "strategyName": "SafeStack",
        "creator": "CryptoSara",
        "allocation": {"BTC": 50, "ETH": 30, "USDC": 20},
        "weeklyAmount": 100,
        "duration": 52,  // optional, null for indefinite
        "strictMode": true
    }
    
    Response:
    {
        "hasStrategy": true,
        "strategy": {...},
        "portfolio": {...},
        "nextDCA": "2024-01-08T09:00:00",
        "dcaPoolBalance": 500
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['strategyId', 'strategyName', 'creator', 'allocation', 'weeklyAmount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        strategy_id = data['strategyId']
        strategy_name = data['strategyName']
        creator = data['creator']
        allocation = data['allocation']
        weekly_amount = float(data['weeklyAmount'])
        duration = data.get('duration')
        strict_mode = data.get('strictMode', True)
        
        # Validate allocation percentages sum to 100
        total_percent = sum(allocation.values())
        if abs(total_percent - 100) > 0.01:  # Allow small floating point errors
            return jsonify({'error': f'Allocation percentages must sum to 100, got {total_percent}'}), 400
        
        # Validate weekly amount
        if weekly_amount <= 0:
            return jsonify({'error': 'Weekly amount must be positive'}), 400
        
        # Setup goal
        agent = get_agent()
        result = agent.setup_goal(
            strategy_id=strategy_id,
            strategy_name=strategy_name,
            creator=creator,
            allocation=allocation,
            weekly_amount=weekly_amount,
            duration=duration,
            strict_mode=strict_mode
        )
        
        logger.info(f'DCA goal setup: {strategy_name} by {creator}')
        return jsonify(result), 200
        
    except ValueError as e:
        logger.warning(f'Validation error in setup-goal: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error in setup-goal: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

