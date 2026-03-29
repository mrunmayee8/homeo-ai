import os
from groq import Groq
from dotenv import load_dotenv
from rag import get_relevant_questions

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

QUESTION_BANK = get_relevant_questions()

SYSTEM_PROMPT = f"""You are a trained homeopathic case-taker working under a licensed homeopathic physician.

RULES:
- Ask ONE question per message. Never combine two questions.
- Follow this order: chief complaint fully explored → modalities → mental/emotional → physical generals (sleep, appetite, thirst, thermals, sweat, digestion) → past history → family history.
- Use simple, warm, conversational language. No medical jargon.
- NEVER suggest a remedy. NEVER diagnose. NEVER give medical advice.
- If the patient goes off-topic, gently redirect.
- When ALL sections are fully covered, output exactly: CASE_COMPLETE

Use this question bank as guidance — pick the most relevant question based on the conversation:
{QUESTION_BANK}
"""

def chat(messages: list, patient_message: str, patient: dict) -> str:
    system = (
        SYSTEM_PROMPT
        + f"\n\nPatient: {patient['name']}, {patient['age']} years old, {patient['gender']}"
    )

    history = [{"role": m["role"], "content": m["content"]} for m in messages]
    history.append({"role": "user", "content": patient_message})

    res = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=500,
        messages=[{"role": "system", "content": system}] + history
    )
    return res.choices[0].message.content

def is_complete(messages: list) -> bool:
    for m in reversed(messages):
        if m["role"] == "assistant":
            return "CASE_COMPLETE" in m["content"]
    return False

def generate_summary(messages: list, patient: dict) -> str:
    transcript = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
    res = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1000,
        messages=[
            {"role": "system", "content": "You are a medical summarizer. Always respond with structured case summaries."},
            {"role": "user", "content": f"""Summarize this homeopathic case into a structured format.

Patient: {patient['name']}, {patient['age']} years old, {patient['gender']}

Transcript:
{transcript}

Format exactly as:
CHIEF COMPLAINT:
ONSET & DURATION:
MODALITIES (Better/Worse):
MENTAL/EMOTIONAL:
PHYSICAL GENERALS:
PAST HISTORY:
FAMILY HISTORY:
"""}
        ]
    )
    return res.choices[0].message.content