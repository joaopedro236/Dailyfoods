import requests
from ..Database.Config.connectDatabaseUser import connect_database_user
from fastapi import APIRouter, Response, Cookie
from ..Validation.RegisterUser import User
from ..Validation.LoginUser import LoginUser
import uuid
import ollama
from pathlib import Path
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

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
        except Exception as e:
            return {
                "Status": False,
                "Error": "Unable to validate  name.",
                "ErrorGross": str(e),
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


@router.get("/api/user")
def get_user(
    user_session_token: str = Cookie(default=None),
    session_token: str = Cookie(default=None),
):
    token = user_session_token or session_token
    if token is None:
        return {"Status": False}

    try:
        conn, cursor = connect_database_user()
        cursor.execute(
            "SELECT name_user, email FROM users_Dailyfoods WHERE session_token = %s",
            (token,),
        )
        userData = cursor.fetchone()

        if userData:
            return {"Status": True, "name": userData[0], "email": userData[1]}
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/api/loginUser")
def login_user(data: LoginUser, response: Response):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_database_user()
        cursor.execute(
            "SELECT password, session_token FROM users_Dailyfoods WHERE CNPJ = %s",
            (data.CNPJ,),
        )
        User = cursor.fetchone()
        if not User:
            return {"Status": False}
        try:
            ph.verify(User[0], data.password)
        except VerifyMismatchError:
            return {"Status": False}
        response.set_cookie(
            key="user_session_token",
            value=User[1],
            httponly=True,
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            secure=False,
            path="/",
        )
        return {"Status": True, "token": User[1]}

    except Exception as e:
        return {"Error": e, "Status": False}
