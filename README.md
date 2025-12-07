# Savvy - Autonomous DCA Agent

An intelligent Dollar Cost Averaging (DCA) agent that helps users invest consistently and build wealth through automated, disciplined investing strategies on the Neo blockchain.


## The Problem
Crypto investors lose money from emotional decisions: panic selling during dips, inconsistent DCA schedules.

## The Solution  
Savvy is an AI agent that enforces weekly Dollar Cost Averaging with strict mode - removing emotional decisions entirely.

## Key Features
- 🎙️ Voice Commands - Natural language investment setup
- 🤖 Autonomous Weekly DCA - SpoonOS agent handles investments  
- 🔒 Strict Mode - Locks funds to prevent panic withdrawals
- ⛓️ Neo Blockchain - Secure, automated transactions
- 📊 Portfolio Tracking - Real-time balance updates

## Tech Stack
- Frontend: React + TypeScript + Tailwind
- Backend: Flask + SpoonOS Agent Framework  
- Blockchain: Neo N3 + Turnkey Wallets
- Voice: Google Speech Recognition


## Features

- 🤖 **AI-Powered Agent**: SpoonOS-powered agent that provides investment coaching and strategy recommendations
- 📊 **DCA Strategies**: Pre-built and customizable DCA strategies for various risk profiles
- 🔗 **Neo Blockchain Integration**: Direct integration with Neo X Testnet for real-time balance checks and swaps
- 🎤 **Voice Interface**: Voice-to-text and text-to-speech capabilities for hands-free interaction
- 📈 **Portfolio Management**: Track your investments, view transaction history, and monitor performance


## Live Demo
🌐 [https://savvy-dca.vercel.app]([url](https://savvy-dca.vercel.app))

## Video Demo
[Insert YouTube/Loom link]

Built for Encode Club x Neo x SpoonOS Hackathon (Dec 2024)


------------------
## SpoonOS Integration - Testing Guide

This project demonstrates three levels of SpoonOS integration:

### ✅ Baseline Requirement #1: LLM Flow

Test the Agent → SpoonOS → LLM integration:

```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is DCA investing?"}'
```

**Expected:** AI response about DCA strategy with `"demo_mode": true`

### ✅ Baseline Requirement #2: Tool Invocation

Test SpoonOS tool execution:

```bash
curl http://localhost:5001/api/accounts
```

**Expected:** Mock Turnkey account data with `"demo_mode": true`

### ✅ Bonus: Graph + Agent Integration

Test advanced StateGraph execution:

```bash
cd backend
source venv/bin/activate
python demo_graph.py
```

**Expected:** Multi-node graph execution showing market analysis, DCA recommendations, and emotional coaching flow.

### Quick Status Check

```bash
curl http://localhost:5001/api/spoon-status
```

Shows all integration points and demo_mode status.

---

**Note:** This project currently uses demo mode due to hackathon time constraints, but the architecture is production-ready and just needs real API keys. All endpoints return mock data when API keys are missing, allowing full testing of the integration flow without external dependencies.

## Project Structure

```
savvy-dca-agent/
├── backend/          # Flask backend with SpoonOS integration
│   ├── app.py       # Main Flask application
│   ├── agent/       # SpoonOS agent implementations
│   ├── routes/      # API endpoints
│   └── demo_graph.py # SpoonOS graph demonstration
├── frontend/        # React frontend with voice interface
└── README.md        # This file
```

## Getting Started

### Backend Setup

See [backend/README.md](backend/README.md) for detailed setup instructions.

### Frontend Setup

See [frontend/README.md](frontend/README.md) for detailed setup instructions.

## Tech Stack

- **Backend**: Flask, SpoonOS, Neo blockchain (web3.py)
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Voice**: react-media-recorder, ElevenLabs TTS, Google Speech Recognition
- **Agent Framework**: SpoonOS (ChatBot, ToolCallAgent, StateGraph)

## License

MIT

