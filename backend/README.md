# Savvy DCA Agent - Backend

Flask backend for the Savvy Autonomous DCA Agent with SpoonOS agent framework and Neo blockchain integration.

## Setup

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Install SpoonOS and spoon-toolkit:**

   ```bash
   # Follow SpoonOS installation instructions
   pip install spoonos
   pip install spoon-toolkit
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory:

   ```env
   FLASK_ENV=development
   PORT=5000
   SECRET_KEY=your-secret-key-here
   NEO_RPC_URL=https://testnet.neox.network:443
   NEO_NETWORK=testnet
   NEO_WALLET_ADDRESS=your-wallet-address
   NEO_PRIVATE_KEY=your-private-key
   STATE_FILE=data/agent_state.json
   ```

4. **Run the server:**

   ```bash
   python app.py
   ```

   Or using Flask CLI:

   ```bash
   flask run
   ```

## API Endpoints

### POST /api/setup-goal

Setup a new DCA strategy goal.

**Request:**

```json
{
  "strategyId": "safestack",
  "strategyName": "SafeStack",
  "creator": "CryptoSara",
  "allocation": { "BTC": 50, "ETH": 30, "USDC": 20 },
  "weeklyAmount": 100,
  "duration": 52,
  "strictMode": true
}
```

### GET /api/status

Get current portfolio and strategy status.

**Response:**

```json
{
  "hasStrategy": true,
  "strategy": {...},
  "portfolio": {...},
  "nextDCA": "2024-01-08T09:00:00",
  "dcaPoolBalance": 500
}
```

### POST /api/simulate-week

Trigger weekly DCA execution.

**Request (optional):**

```json
{
  "cryptoPrices": {
    "BTC": 97000,
    "ETH": 3600
  }
}
```

### POST /api/add-funds

Add money to DCA pool.

**Request:**

```json
{
  "amount": 500
}
```

### POST /api/withdraw

Withdraw from portfolio.

**Request:**

```json
{
  "amount": 1000
}
```

### GET /api/history

Get transaction history.

**Query parameters:**

- `limit` (optional): Maximum number of transactions to return

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── agent/
│   ├── __init__.py
│   ├── dca_agent.py       # SpoonOS DCA agent class
│   └── neo_integration.py # Neo blockchain integration
├── routes/
│   ├── __init__.py
│   ├── goal.py            # Setup goal endpoint
│   ├── status.py          # Status endpoint
│   ├── simulate.py        # Simulate week endpoint
│   ├── funds.py           # Add funds & withdraw endpoints
│   └── history.py         # History endpoint
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## State Management

The agent state is persisted to a JSON file (default: `data/agent_state.json`). The state includes:

- Strategy configuration
- Portfolio holdings and metrics
- Transaction history
- DCA pool balance
- Next DCA execution time

## Neo Blockchain Integration

The `neo_integration.py` module provides a wrapper for Neo blockchain operations using spoon-toolkit:

- Balance checks
- GAS transfers
- Transaction history
- Transaction confirmation

**Note:** The Neo integration is currently a placeholder structure. Implement actual blockchain operations using spoon-toolkit API.

## Error Handling

All endpoints include proper error handling:

- 400: Bad request (validation errors)
- 500: Internal server error

Errors are logged and returned as JSON:

```json
{
  "error": "Error message"
}
```

## Development

The backend runs on `http://localhost:5000` by default. CORS is configured to allow requests from `http://localhost:5173` (frontend).

## Logging

Logging is configured to output to console with INFO level. Logs include:

- Request processing
- State changes
- Errors and exceptions
- Neo blockchain operations
