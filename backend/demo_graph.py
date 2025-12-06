"""
SpoonOS Graph Demonstration for Savvy DCA Agent

This demonstrates:
- StateGraph construction with nodes and edges
- State management between nodes
- Graph execution flow
"""

from spoon_ai.graph import StateGraph, BaseNode, START, END
from typing import TypedDict
import asyncio

# Define state structure
class DCAState(TypedDict):
    market_condition: str
    dca_recommendation: dict
    user_sentiment: str
    volatility: str

# Define node functions
def analyze_market(state: DCAState) -> DCAState:
    """Analyze market volatility"""
    print("📊 Analyzing market conditions...")
    
    # Simulate market analysis
    volatility = "high"  # Can be 'high', 'moderate', or 'low'
    
    # Update state
    state['volatility'] = volatility
    state['market_condition'] = volatility
    
    print(f"   Market volatility: {volatility}")
    return state

def generate_recommendation(state: DCAState) -> DCAState:
    """Generate DCA strategy recommendation based on volatility"""
    print("💡 Generating recommendation...")
    
    volatility = state.get('volatility', 'moderate')
    user_balance = 1000  # Default balance
    
    # Generate recommendation based on volatility
    if volatility == 'high':
        recommendation = {
            'strategy': 'aggressive_dca',
            'frequency': 'daily',
            'amount': user_balance * 0.1,
            'message': 'High volatility detected - increase DCA frequency to capitalize on dips'
        }
    elif volatility == 'low':
        recommendation = {
            'strategy': 'conservative_dca',
            'frequency': 'weekly',
            'amount': user_balance * 0.05,
            'message': 'Low volatility - maintain steady weekly DCA'
        }
    else:
        recommendation = {
            'strategy': 'balanced_dca',
            'frequency': 'bi-weekly',
            'amount': user_balance * 0.075,
            'message': 'Moderate volatility - balanced DCA approach recommended'
        }
    
    state['dca_recommendation'] = recommendation
    
    print(f"   Strategy: {recommendation['strategy']}")
    print(f"   Frequency: {recommendation['frequency']}")
    print(f"   Amount: ${recommendation['amount']:.2f}")
    return state

def provide_coaching(state: DCAState) -> DCAState:
    """Provide emotional coaching based on sentiment"""
    print("💚 Providing emotional support...")
    
    user_sentiment = state.get('user_sentiment', 'calm')
    volatility = state.get('volatility', 'moderate')
    
    # Check if coaching needed
    if user_sentiment == 'panicked' or volatility == 'high':
        coaching_message = "Remember: DCA is your best friend during volatility. Stay disciplined, stay calm. Market dips are opportunities, not threats. You've got this! 💚"
    else:
        coaching_message = "Great job staying disciplined! Keep up the consistent investing."
    
    state['user_sentiment'] = 'calm'  # Update sentiment after coaching
    
    print(f"   Message: {coaching_message}")
    return state

async def main():
    print("🔄 Building DCA Analysis Graph...")
    
    # Build the graph
    workflow = StateGraph(DCAState)
    
    # Add nodes
    workflow.add_node("analyze_market", analyze_market)
    workflow.add_node("generate_recommendation", generate_recommendation)
    workflow.add_node("provide_coaching", provide_coaching)
    
    # Add edges
    workflow.add_edge(START, "analyze_market")
    workflow.add_edge("analyze_market", "generate_recommendation")
    workflow.add_edge("generate_recommendation", "provide_coaching")
    workflow.add_edge("provide_coaching", END)
    
    # Set entry point
    workflow.set_entry_point("analyze_market")
    
    # Compile the graph
    app = workflow.compile()
    
    print("✅ Graph structure created and compiled")
    print("\n" + "="*50)
    print("Executing DCA Analysis Graph...")
    print("="*50 + "\n")
    
    # Initialize state
    initial_state: DCAState = {
        'market_condition': '',
        'dca_recommendation': {},
        'user_sentiment': 'panicked',
        'volatility': ''
    }
    
    # Execute graph
    try:
        # AWAIT the invoke call
        final_state = await app.invoke(initial_state)
        
        print("\n" + "="*50)
        print("📋 Final State Summary:")
        print("="*50)
        print(f"Market Condition: {final_state.get('market_condition', 'unknown')}")
        print(f"Volatility: {final_state.get('volatility', 'unknown')}")
        print(f"Recommendation: {final_state.get('dca_recommendation', {}).get('message', 'N/A')}")
        print(f"User Sentiment: {final_state.get('user_sentiment', 'unknown')}")
        print("="*50)
        
        print("\n✅ Graph execution complete")
        
    except Exception as e:
        print(f"\n❌ Error during graph execution: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
