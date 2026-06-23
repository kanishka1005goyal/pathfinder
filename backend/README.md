# PathFinder Chat (FastAPI) — Minimal

Just the chatbot. No auth, no resume routes, no extras.

## Folder Structure
```
backend/
├── main.py
├── routes/
│   ├── __init__.py
│   └── chat.py
├── .env
├── .env.example
├── requirements.txt
└── .gitignore
```

## Setup (5 steps)

```powershell
# 1. Create venv
cd D:\internship\pathfinder\backend
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install
pip install -r requirements.txt

# 3. Env
copy .env.example .env
notepad .env     # paste your GROQ_API_KEY

# 4. Run
python main.py

# 5. Test
#    Browser:  http://localhost:8000/docs
#    Browser:  http://localhost:8000/api/chat/   → "Chat route working"
#    Terminal: 
curl -X POST http://localhost:8000/api/chat/ -H "Content-Type: application/json" -d '{\"message\":\"hi\"}'
```

## Frontend
In your React `.env`:
```
VITE_API_URL=http://localhost:8000/api/chat
```
That's it — port changed from 5000 → 8000, nothing else.

## Troubleshooting
- `ModuleNotFoundError` → activate venv: `.\venv\Scripts\Activate.ps1`
- `GROQ_API_KEY missing` → check `.env` is in same folder as `main.py`
- `groq.AuthenticationError` → bad key, regenerate at https://console.groq.com/keys
- PowerShell blocks venv → `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`