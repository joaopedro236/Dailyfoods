import requests

from ...Database.Config.connectDatabaseUser import connect_database_user
from fastapi import APIRouter, Response
import uuid
import ollama
from pathlib import Path
from argon2 import PasswordHasher

router = APIRouter()
ph = PasswordHasher()

@router.post("/api/registerUser")
def register_user(data: User, response: Response):
    conn = None
    cursor = None
    try:

        command_sql = """ INSERT INTO users_Dailyfoods(name_user,CNPJ,CEP,email, password, session_token)
                        VALUES (%s, %s, %s, %s, %s, %s)"""
        verification_response = requests.post(
            "http://localhost:8000/api/registerUserVerification",
            json=data.model_dump(),
            timeout=5,
        )

        verification_response.raise_for_status()
        dataResponse = verification_response.json()
        try:
            PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "nameUser.txt"
            
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

            result = moderation["message"]["content"].strip().upper()

            if result.startswith("BLOCK"):
                return {"Status": False, "Error": "Invalid name."}
        except Exception :
            return {
                "Status": False,
                "Error": "Unable to validate  name.",
            }
        cnpj_exist = dataResponse["CNPJExist"]
        email_exist = dataResponse["emailExists"]
        if not cnpj_exist and not email_exist:
            conn, cursor = connect_database_user()
            hashPassword = ph.hash(data.password)
            session_token = str(uuid.uuid4())
            cursor.execute(
                command_sql,
                (
                    data.name,
                    data.CNPJ,
                    data.CEP,
                    data.email,
                    hashPassword,
                    session_token,
                ),
            )
            conn.commit()
            response.set_cookie(
                key="user_session_token",
                value=session_token,
                httponly=True,
                max_age=60 * 60 * 24 * 7,
                samesite="lax",
                path="/",
            )
            return {"Status": True, "token": session_token}
        return {"Status": False, "StatusCnpj": cnpj_exist, "StatusEmail": email_exist}
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

