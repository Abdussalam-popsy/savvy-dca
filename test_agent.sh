#!/bin/bash
curl -X POST http://localhost:5001/api/simulate/agent/action \
  -H "Content-Type: application/json" \
  -d '{
    "user_prompt": "Check the balance of wallet 0x1234567890123456789012345678901234567890",
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }'
echo "" # Add a new line at the end