from fastapi import APIRouter
import ollama
from ..Validation.charbot import ChatBot as ChatbotValidation
from pathlib import Path

router = APIRouter()


@router.post("/chatbot")
def chatbot(data: ChatbotValidation):
    try:
        PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "chatbot.txt"

        with open(PROMPT_PATH, "r", encoding="utf-8") as file:
            prompt = file.read()
        moderation = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content": prompt,
                },
                {"role": "user", "content": data.name},
            ],
            options={"temperature": 0},
        )
        result = moderation["message"]["content"]

        return {"Status": True, "Response": result}
    except Exception as e:
        return {"Status": False, "Error": str(e)}
