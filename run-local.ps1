Write-Host "Starting Jogo Services Locally (without Docker)..." -ForegroundColor Cyan

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'Frontend'; npm run dev"

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'BE\Jogo\src\Jogo.Api'; dotnet run"

# Start AI Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'football_performance_analysis'; .\venv\Scripts\python -m uvicorn api:app --reload --port 8000"

Write-Host "All services have been started in separate windows!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "- Backend:  http://localhost:5001" -ForegroundColor Yellow
Write-Host "- AI API:   http://localhost:8000" -ForegroundColor Yellow
