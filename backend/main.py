from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import chat
from routes import parse_resume


# ✅ Fail fast if key is missing — no more silent 500s
if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError(
        "❌ GROQ_API_KEY missing from .env\n"
        "   Add it: GROQ_API_KEY=gsk_...\n"
        "   Get one: https://console.groq.com/keys"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    key = os.getenv("GROQ_API_KEY", "")
    print(f"✅ GROQ_API_KEY loaded: {key[:7]}...")
    print(f"✅ Groq model: {chat.MODEL_NAME}")
    yield


app = FastAPI(title="PathFinder Chat API", lifespan=lifespan)

# ✅ CORS — open in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# main.py
app.include_router(chat.router)  # remove prefix="/api/chat"

# Algorithmic resume parser — no AI required
app.include_router(parse_resume.router)


@app.get("/")
def root():
    return {"status": "PathFinder Chat API is running", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)