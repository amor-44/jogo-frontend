# Jogo AI Football Player Assistant Chatbot (MVP)

AI chatbot backend for Jogo. A player chats with an assistant that knows their real performance
data and gives grounded, personalized answers — not generic ChatGPT responses.

Standalone MVP, no dependency on the real Jogo backend yet. Built to plug in later with minimal
changes.

<img width="982" height="356" alt="image" src="https://github.com/user-attachments/assets/83d6b41a-a007-4e87-9064-742e053e45cb" />

## What it does

- `POST /api/chat` endpoint that answers questions about a player's performance, progress over
  time, weaknesses, and recommendations — using that player's actual (mocked) data.
- Answers general football questions too, personalized with player data when relevant.
- Basic in-memory conversation history.
- LLM: Google Gemini, behind a swappable interface.

## Architecture

```
Player → Chat API (FastAPI) → Chatbot Service → Player Data Provider (mock → future Jogo API)
                                     │
                                     ├─→ Conversation Store (in-memory)
                                     ↓
                          Player Context (built from real data only)
                                     ↓
                             Gemini Service → AI Response
```

Gemini never touches data directly — the Chatbot Service fetches player data first and builds a
"Player Context" text block that gets injected into the system prompt. Everything is behind
interfaces (`PlayerDataProvider`, `LLMService`, `ConversationStore`) so each piece can be swapped
without touching the rest. The system prompt itself lives in its own file
(`app/chatbot/system_prompt.py`) for easy tuning.

## Repo structure

```
app/
├── api/          # routes.py (endpoints), dependencies.py (wiring)
├── chatbot/       # service.py (orchestration), context_builder.py, system_prompt.py
├── llm/           # base.py (interface), gemini_service.py (only file calling Gemini)
├── data/          # provider.py (interface), mock_provider.py
├── models/        # Pydantic schemas
├── core/          # config, exceptions, conversation_store
└── main.py
tests/
```

## Setup

```bash
cd jogo-ai-chatbot
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then add your GEMINI_API_KEY
```

| Variable | Required | Default |
|---|---|---|
| `GEMINI_API_KEY` | Yes | — |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` |
| `APP_ENV` | No | `development` |
| `LOG_LEVEL` | No | `INFO` |

## Run & test

```bash
uvicorn app.main:app --reload   # → http://localhost:8000/docs
pytest -v                        # no real Gemini key needed, LLM is mocked
```

## API

**GET /health** → `{"status": "ok"}`

**POST /api/chat**
```json
// request
{ "player_id": "player_001", "message": "How is my performance?", "conversation_id": null }

// response
{ "conversation_id": "uuid...", "response": "Your overall score is 82, up from 76..." }
```

| Error case | Status |
|---|---|
| Invalid/missing fields, empty message | 422 |
| Player not found | 404 |
| Conversation not found | 404 |
| Gemini not configured | 500 |
| Gemini API failure | 502 |

## Mock data

One sample player (`player_001`, Karim Youssef) with a full profile, a current report, and 2
historical reports with mixed results (some metrics up, some down) so development tracking is
meaningful. Send any other `player_id` to test the "not found" path. Add more players in
`app/data/mock_provider.py`.

## Auth note

`player_id` is trusted as-is from the request body in this MVP — there's no auth yet. In the real
integration, it must come from the authenticated Jogo session/token, not the request body directly
(`app/api/routes.py` is where that change goes).

## Future integration

1. Add `JogoBackendPlayerDataProvider(PlayerDataProvider)` calling the real Jogo API.
2. Swap it in `app/api/dependencies.py::get_player_data_provider()` — nothing else changes.
3. Add real player authentication.
4. Swap `InMemoryConversationStore` for Redis/DB if history needs to persist.

## Not in this MVP (by design)

Video/computer vision, RAG/vector DB, fine-tuning, Postgres/Redis/Kafka, full auth system,
payments, scout/club/academy dashboards, frontend UI.

## Assumptions

- Default model: `gemini-2.5-flash`, overridable via env var.
- One mock player is enough to demo all use cases.
- New `conversation_id` per new conversation; client passes it back to continue.
- In-memory storage only — not durable across restarts, documented as a known MVP limitation.
