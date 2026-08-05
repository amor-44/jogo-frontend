# Jogo AI Football Player Assistant Chatbot (MVP)

An AI chatbot backend for **Jogo**, a football platform for players, academies, clubs, and scouts.
This service lets a player have a conversation with an AI assistant that understands their
football profile and performance data, and gives personalized, grounded insights — not generic
ChatGPT-style answers.

This is a **standalone MVP service**. It does not depend on the real Jogo backend and is designed
to be integrated with it later with minimal changes.

---

## 1. What this MVP does

- Exposes a simple `POST /api/chat` REST endpoint.
- Answers questions about a player's performance, development over time, weaknesses, and
  recommendations — grounded in that player's actual (currently mocked) data.
- Answers general football-development questions using the LLM's own knowledge, personalizing
  the answer with the player's data when relevant.
- Keeps basic in-memory conversation history per conversation.
- Uses Google Gemini as the LLM, isolated behind a swappable interface.

## 2. Architecture

```
Player (Jogo frontend)
        │
        ▼
   Chat API (FastAPI)              -- HTTP validation, error translation
        │
        ▼
  Chatbot Service                  -- orchestration: fetch data, build context,
        │                             manage history, call LLM
        ├──────────────► Player Data Provider ──► Mock data (MVP) / Jogo API (future)
        │
        ├──────────────► Conversation Store (in-memory, swappable)
        │
        ▼
  Player Context (text block, built from real data only)
        │
        ▼
   Gemini Service                  -- ONLY place that talks to Gemini
        │
        ▼
   AI Response
```

Key design decisions:

- **The LLM never touches the database.** The Chatbot Service retrieves player data first and
  builds a controlled "Player Context" text block that is injected into the system prompt. Gemini
  only ever sees what we deliberately give it.
- **Everything is behind interfaces**, so pieces can be swapped independently:
  - `PlayerDataProvider` (abstract) → `MockPlayerDataProvider` (MVP) → future
    `JogoBackendPlayerDataProvider`.
  - `LLMService` (abstract) → `GeminiService` (current) → could become `OpenAIService`, etc.
  - `ConversationStore` (abstract) → `InMemoryConversationStore` (MVP) → future Redis/DB-backed
    store.
- **The system prompt is a dedicated, standalone template** (`app/chatbot/system_prompt.py`), not
  buried in application code, so the assistant's behavior and anti-hallucination rules are easy to
  review and tune.

## 3. Repository structure

```
jogo-ai-chatbot/
│
├── app/
│   ├── api/                # HTTP layer
│   │   ├── routes.py       # /health and /api/chat endpoints
│   │   └── dependencies.py # wiring: which concrete providers/services are used
│   │
│   ├── chatbot/            # Orchestration
│   │   ├── service.py          # ChatbotService — the main flow
│   │   ├── context_builder.py  # Turns PlayerData into a text context block
│   │   └── system_prompt.py    # The assistant's system prompt template
│   │
│   ├── llm/                # LLM integration
│   │   ├── base.py             # Abstract LLMService interface
│   │   └── gemini_service.py   # Gemini implementation (only file that calls Gemini)
│   │
│   ├── data/                # Player data
│   │   ├── provider.py         # Abstract PlayerDataProvider interface
│   │   └── mock_provider.py    # Mock data provider with sample player(s)
│   │
│   ├── models/               # Pydantic schemas
│   │   ├── player.py           # PlayerProfile, PerformanceReport, etc.
│   │   └── chat.py             # ChatRequest / ChatResponse / ErrorResponse
│   │
│   ├── core/                 # Cross-cutting concerns
│   │   ├── config.py           # Environment-based settings
│   │   ├── exceptions.py       # Domain-specific exceptions
│   │   └── conversation_store.py  # Abstract + in-memory conversation history
│   │
│   └── main.py              # FastAPI app entrypoint
│
├── tests/                   # Pytest suite (no real Gemini key needed)
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## 4. Requirements

- Python 3.11+
- A Google Gemini API key (only needed to actually chat — not needed to run tests or `/health`)

## 5. Installation

```bash
cd jogo-ai-chatbot
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 6. Environment variables

Copy `.env.example` to `.env` and fill in your key:

```bash
cp .env.example .env
```

| Variable         | Required | Description                                       |
|------------------|----------|----------------------------------------------------|
| `GEMINI_API_KEY` | Yes      | Your Google Gemini API key. Never hardcode this.   |
| `GEMINI_MODEL`   | No       | Defaults to `gemini-2.0-flash`.                    |
| `APP_ENV`        | No       | Defaults to `development`.                         |
| `LOG_LEVEL`      | No       | Defaults to `INFO`.                                 |

## 7. Running locally

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`.

## 8. Running tests

```bash
pytest -v
```

Tests **never** call the real Gemini API — a fake `LLMService` implementation is injected via
dependency overrides, so the full suite runs offline and deterministically.

## 9. API endpoints

### `GET /health`
Simple liveness check.

```json
{"status": "ok"}
```

### `POST /api/chat`

**Request:**
```json
{
  "player_id": "player_001",
  "message": "How is my performance?",
  "conversation_id": null
}
```

- `player_id` — required. See the Authentication note below.
- `message` — required, non-empty.
- `conversation_id` — optional. Omit or set to `null` to start a new conversation; pass an
  existing one to continue it.

**Response:**
```json
{
  "conversation_id": "3f6a9e2e-1e2a-4b8f-9b34-1a2b3c4d5e6f",
  "response": "Your overall score is 82, up from 76 last time..."
}
```

**Error responses** use standard HTTP status codes with a JSON body:
```json
{"detail": "Player 'unknown_player' was not found."}
```

| Situation                     | Status |
|--------------------------------|--------|
| Missing/invalid request fields | 422    |
| Empty message                  | 422 (caught by request validation) |
| Player not found               | 404    |
| Conversation not found          | 404    |
| Gemini not configured           | 500    |
| Gemini API failure              | 502    |
| Unexpected server error         | 500    |

No internal stack traces or secrets are ever returned to the client.

## 10. Mock player data

Since the real Jogo backend isn't available yet, `MockPlayerDataProvider` returns hand-crafted
sample data for one player: `player_001` (Karim Youssef). It includes:

- A full profile (age, position, team, experience).
- A current performance report with realistic, mixed metrics (some strong, some weak).
- Two historical reports with different values, so the chatbot can demonstrate honest
  development tracking (some metrics improved, some got worse — not everything trends upward).

To test with a "missing player," send any `player_id` other than `player_001`.

## 11. Example conversations

**"How am I doing?"**
→ The assistant summarizes the current overall score, notable strengths (Passing, Positioning)
and weaknesses (Decision Making, Movement Efficiency), using the real numbers from the context.

**"Am I improving?"**
→ The assistant compares the current report to the two historical reports and calls out specific
metrics that moved up or down (e.g. Decision Making rose from 61 → 65 → 71).

**"What should I work on?"**
→ Uses the player's actual weaknesses and existing recommendations to suggest a focus area.

**"How can I improve my decision making?"**
→ Combines the player's real Decision Making score (71) with general football development advice
(e.g. scanning before receiving the ball).

**"What is my strongest skill?"**
→ Answers from the real `strengths` list rather than guessing.

**"What does my movement efficiency score mean?"**
→ Explains the metric conceptually in plain language, and references the player's actual score.

**Ask about something not tracked (e.g. "How was my last match's xG?")**
→ The assistant explicitly says that data is not currently available, rather than inventing a
number.

## 12. Authentication note (important)

For this MVP, `player_id` is accepted directly in the request body and **not verified**. This is
intentional and documented — the MVP has no auth system.

**In the real Jogo integration, `player_id` must be derived from the authenticated session/token
issued by the Jogo backend, never trusted as-is from the frontend.** The Chat API route
(`app/api/routes.py`) is the layer where that change would be made (e.g. extracting `player_id`
from a verified JWT instead of the request body).

## 13. Future integration path

To connect this service to the real Jogo backend:

1. Implement `JogoBackendPlayerDataProvider(PlayerDataProvider)` in `app/data/`, calling the real
   Jogo API instead of returning mock data.
2. Swap it in inside `app/api/dependencies.py::get_player_data_provider()` — nothing else in the
   codebase needs to change, because `ChatbotService` only depends on the abstract
   `PlayerDataProvider` interface.
3. Add authenticated player identity (see section 12) instead of trusting `player_id` from the
   request body.
4. Replace `InMemoryConversationStore` with a persistent implementation (e.g. Redis or a database
   table) if conversation history needs to survive restarts or be shared across multiple server
   instances — again, only a new class implementing `ConversationStore` is needed.

Target future architecture:

```
Jogo Frontend
     ↓
Jogo ASP.NET Core Backend
     ↓
Jogo AI Chatbot Service (this repo)
     ↓
Player Data Provider → real Jogo API
     ↓
Gemini API
```

## 14. What is intentionally NOT included in this MVP

Per the MVP scope, none of the following are implemented, and none should be added without a
deliberate scope decision:

- Video upload, computer vision, player/action detection or tracking
- RAG or a vector database
- Fine-tuning
- PostgreSQL, Redis, Kafka, or other infrastructure
- A full authentication/authorization system
- Payments, subscriptions, or notifications
- Scout marketplace, club dashboard, academy dashboard
- Mobile app or frontend UI

The goal of this repository is a clean, testable, integration-ready chatbot backend — not the full
Jogo platform.

## 15. Assumptions made

- **Gemini model**: Defaults to `gemini-2.0-flash` (fast, cost-effective, good enough for
  conversational MVP use); overridable via `GEMINI_MODEL`.
- **Single mock player**: One realistic player (`player_001`) is enough to demonstrate all core
  use cases (current performance, comparison, recommendations, explanations). More can be added
  to `app/data/mock_provider.py` easily.
- **Conversation identity**: A new `conversation_id` (UUID) is generated per new conversation;
  the client is responsible for passing it back on subsequent turns.
- **In-memory storage only**: Acceptable for MVP; explicitly not durable across restarts or
  multiple processes — documented as a known limitation, not hidden.
