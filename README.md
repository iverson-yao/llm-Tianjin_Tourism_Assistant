# Tianjin Travel Assistant

Team software engineering training project guided by Chinasoft International instructors. The project implements an LLM-based travel assistant for Tianjin travel queries, with a FastAPI backend, conversational state, train/flight information retrieval, and a browser-based user interface.

## Overview

The assistant accepts natural-language travel questions, extracts travel entities such as departure city, destination city, and travel date, and queries train and flight information modules when the requested route changes. The backend returns both the conversational response and structured travel information for frontend display.

This repository is a cleaned public version for portfolio and resume review. Secrets are loaded from environment variables and local `.env` files are ignored by Git.

## Architecture

- `langserve-demo/server.py`: FastAPI application, static file serving, CORS setup, request model, session-state cache, and response route.
- `langserve-demo/llm.py`: LLM integration, conversation history, travel entity extraction, train/flight module orchestration, and optional retrieval augmentation.
- `langserve-demo/flight.py` and `langserve-demo/TrainTickets.py`: Travel information retrieval modules.
- `langserve-demo/embedText.py`: Optional retrieval-augmentation prototype using LangChain, Chroma, and Baichuan embeddings.
- `node-server/` and frontend static files: Browser UI and request handling for the assistant interface.

## Optional Retrieval Augmentation

The repository includes an optional retrieval-augmentation prototype that loads local Tianjin travel content, splits it into chunks, embeds it with Baichuan embeddings, stores it in Chroma, and retrieves relevant context for LLM prompting.

This feature is disabled by default because it depends on external embedding API access. To enable it, configure the following variables in a local `.env` file:

```env
ENABLE_RAG=true
BAICHUAN_API_KEY=your_baichuan_api_key_here
RAG_SOURCE_FILE=./langserve-demo/res/天津市10大景点.html
```

If retrieval augmentation fails because the external embedding API or local source file is unavailable, the backend falls back to the normal LLM response path.

## Environment

Create a local `.env` file based on `.env.example`:

```env
ZHIPUAI_API_KEY=your_zhipuai_api_key_here
BAICHUAN_API_KEY=your_baichuan_api_key_here
ENABLE_RAG=false
RAG_SOURCE_FILE=./langserve-demo/res/天津市10大景点.html
```

Do not commit real API keys.

## Running

Install backend dependencies:

```bash
cd langserve-demo
pip install -r requirements.txt
python server.py
```

The backend starts on port `8000` by default.

## My Contributions

- Developed the frontend of the LLM-based travel assistant and connected it with backend services for conversational travel queries and structured train/flight information.
- Implemented an optional retrieval-augmentation prototype using LangChain, Chroma, and Baichuan embeddings to retrieve local Tianjin travel context for LLM prompting.
- Integrated frontend, LLM, retrieval, and travel information modules during team delivery, resolving interface mismatches and runtime issues across independently developed components.
- Collaborated on system testing and debugging for LLM response generation, retrieval augmentation, travel information retrieval, and final project demonstration.

## Team

Wei Zefan, Wang Anlan, Zhang Kehan, Yang Zhiyao
