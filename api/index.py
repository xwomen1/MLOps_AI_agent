import os
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi_clerk_auth import (
    ClerkConfig,
    ClerkHTTPBearer,
    HTTPAuthorizationCredentials,
)

# -------- LLM SDKs --------
import google.generativeai as genai
from openai import OpenAI

# ---------- App ----------
app = FastAPI()

# ---------- Clerk ----------
clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)

# ---------- ENV ----------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")

# ---------- Gemini ----------
if LLM_PROVIDER == "gemini":
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# ---------- OpenAI ----------
if LLM_PROVIDER == "openai":
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------- Schema ----------
class Visit(BaseModel):
    patient_name: str
    date_of_visit: str
    notes: str

# ---------- Prompt ----------
SYSTEM_PROMPT = """
You are provided with notes written by a doctor from a patient's visit.
Your job is to summarize the visit for the doctor and provide an email.
Reply with exactly three sections with the headings:
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
"""

def build_prompt(visit: Visit) -> str:
    return f"""
{SYSTEM_PROMPT}

Patient Name: {visit.patient_name}
Date of Visit: {visit.date_of_visit}
Notes:
{visit.notes}
"""

# ---------- LLM STREAM SWITCH ----------
def stream_llm(prompt: str):
    if LLM_PROVIDER == "gemini":
        response = gemini_model.generate_content(prompt, stream=True)
        for chunk in response:
            if chunk.text:
                for line in chunk.text.split("\n"):
                    yield f"data: {line}\n\n"

    elif LLM_PROVIDER == "openai":
        stream = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            stream=True,
        )

        for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                for line in text.split("\n"):
                    yield f"data: {line}\n\n"

    else:
        yield "data: ❌ Invalid LLM_PROVIDER\n\n"

# ---------- API ----------
@app.post("/api")
def consultation_summary(
    visit: Visit,
    creds: HTTPAuthorizationCredentials = Depends(clerk_guard),
):
    user_id = creds.decoded["sub"]

    prompt = build_prompt(visit)

    return StreamingResponse(
        stream_llm(prompt),
        media_type="text/event-stream",
    )

# ---------- Health ----------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "provider": LLM_PROVIDER,
    }
