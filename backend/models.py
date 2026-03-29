from pydantic import BaseModel

class PatientIn(BaseModel):
    name: str
    age: int
    gender: str

class MessageIn(BaseModel):
    session_id: str
    content: str