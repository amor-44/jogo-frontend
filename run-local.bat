@echo off
echo Starting Jogo Services Locally (without Docker)...

:: Start Frontend
start "Jogo Frontend" cmd /c "cd /d "%~dp0Frontend" && npm run dev"

:: Start Backend
start "Jogo Backend" cmd /c "cd /d "%~dp0BE\Jogo\src\Jogo.Api" && dotnet run"

:: Start Football Video AI Analysis Service (port 8000)
start "Jogo Video AI" cmd /c "cd /d "%~dp0football_performance_analysis" && python -m uvicorn api:app --reload --port 8000"

:: Start Player Assistant Chatbot (port 8001)
start "Jogo AI Chatbot" cmd /c "cd /d "%~dp0jogo-ai-chatbot" && python -m uvicorn app.main:app --reload --port 8001"

echo All services have been started in separate windows!
echo - Frontend:   http://localhost:5173
echo - Backend:    http://localhost:5001
echo - Video AI:   http://localhost:8000
echo - AI Chatbot: http://localhost:8001

