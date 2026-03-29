from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import PatientIn, MessageIn
from database import (create_patient, get_patient, create_session,
                      append_message, get_messages, get_session,
                      save_summary, get_all_summaries)
from agent import chat, is_complete, generate_summary

app = FastAPI(title="Homeo AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(data: PatientIn):
    patient_id = create_patient(data.name, data.age, data.gender)
    session_id = create_session(patient_id)
    return {"patient_id": patient_id, "session_id": session_id}

@app.post("/chat")
def send_message(msg: MessageIn):
    session = get_session(msg.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    patient = get_patient(session["patient_id"])
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    messages = get_messages(msg.session_id)
    append_message(msg.session_id, "user", msg.content)

    reply = chat(messages, msg.content, patient)
    append_message(msg.session_id, "assistant", reply)

    updated = get_messages(msg.session_id)
    complete = is_complete(updated)

    if complete:
        summary = generate_summary(updated, patient)
        save_summary(msg.session_id, patient["unique_code"], summary)

    return {"reply": reply, "is_complete": complete}

@app.get("/dashboard")
def dashboard():
    return get_all_summaries()