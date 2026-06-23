import os
from fastapi import APIRouter, HTTPException
from groq import Groq
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ✅ Current model — NOT the decommissioned llama3-8b-8192
MODEL_NAME = "llama-3.3-70b-versatile"

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------- Schemas ----------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: List[ChatMessage] = []
    resumeText: Optional[str] = None


# ---------- Routes ----------

@router.get("/")
def health():
    return {"status": "Chat route working"}


@router.post("/")
async def chat(req: ChatRequest):
    try:
        resume_section = (
            f"\nUser's resume:\n{req.resumeText}"
            if req.resumeText
            else "\nNo resume provided."
        )

        system_prompt = f"""You are PathFinder, an expert AI career coach.
You help users with resume improvement, interview preparation, skill gap analysis, and mock interviews.
Be specific, actionable, and encouraging.
{resume_section}"""

        messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": m.role, "content": m.content} for m in req.history],
            {"role": "user", "content": req.message},
        ]

        completion = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))