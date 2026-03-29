import json

def get_relevant_questions() -> str:
    with open("data/questions.json") as f:
        questions = json.load(f)
    grouped = {}
    for q in questions:
        grouped.setdefault(q["category"], []).append(q["question"])
    result = ""
    for category, qs in grouped.items():
        result += f"\n{category.upper()}:\n"
        result += "\n".join(f"- {q}" for q in qs)
    return result