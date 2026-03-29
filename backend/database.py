import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def create_patient(name: str, age: int, gender: str) -> str:
    res = supabase.table("patients").select("unique_code").execute()
    count = len(res.data)
    unique_code = f"HOM-{str(count + 1).zfill(4)}"
    supabase.table("patients").insert({
        "unique_code": unique_code,
        "name": name,
        "age": age,
        "gender": gender
    }).execute()
    return unique_code

def get_patient(unique_code: str) -> dict:
    res = supabase.table("patients").select("*").eq("unique_code", unique_code).execute()
    return res.data[0] if res.data else None

def create_session(patient_id: str) -> str:
    res = supabase.table("sessions").insert({"patient_id": patient_id}).execute()
    return res.data[0]["id"]

def append_message(session_id: str, role: str, content: str):
    supabase.table("messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content
    }).execute()

def get_messages(session_id: str) -> list:
    res = (supabase.table("messages")
           .select("role, content")
           .eq("session_id", session_id)
           .order("created_at")
           .execute())
    return res.data

def get_session(session_id: str) -> dict:
    res = supabase.table("sessions").select("*").eq("id", session_id).execute()
    return res.data[0] if res.data else None

def save_summary(session_id: str, patient_id: str, summary: str):
    supabase.table("sessions").update({"status": "complete"}).eq("id", session_id).execute()
    supabase.table("summaries").insert({
        "session_id": session_id,
        "patient_id": patient_id,
        "summary": summary
    }).execute()

def get_all_summaries() -> list:
    res = supabase.table("summaries").select("*, patients(name, age, gender)").execute()
    return res.data