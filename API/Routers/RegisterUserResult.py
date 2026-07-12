import requests
from ..Database.Config.connectDatabaseUser import connect_database
from fastapi import APIRouter, Response, Cookie
from ..Validation.RegisterUser import Store
import uuid

router = APIRouter()


@router.post("/api/registerUser")
def register_user(data: Store, response: Response):
    conn = None
    cursor = None
    try:

        command_sql = """ INSERT INTO users_Dailyfoods(name_user,CNPJ,CEP,email, password, session_token)
                        VALUES (%s, %s, %s, %s, %s, %s)"""
        verification_response = requests.post(
            "http://localhost:8000/api/registerUserVerification", json=data.model_dump()
        )
        dataResponse = verification_response.json()

        cnpj_exist = dataResponse["CNPJExist"]
        email_exist = dataResponse["emailExists"]

        if not cnpj_exist and not email_exist:
            conn, cursor = connect_database()
            session_token = str(uuid.uuid4())
            cursor.execute(
                command_sql,
                (
                    data.name,
                    data.CNPJ,
                    data.CEP,
                    data.email,
                    data.password,
                    session_token,
                ),
            )
            conn.commit()
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=False,
                max_age=60 * 60 * 24 * 7,
                samesite="lax",
                path="/",
            )
            return {"Status": True, "token": session_token}
        elif cnpj_exist and not email_exist:
            return {"StatusCnpj": True, "StatusEmail": False}
        elif not cnpj_exist and email_exist:
            return {"StatusCnpj": False, "StatusEmail": True}
        else:
            return {"StatusCnpj": True, "StatusEmail": True}
    except Exception as e:
        if conn:
            conn.rollback()
        return {"Error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/api/user")
def get_user(session_token: str = Cookie(default=None)):
    if session_token is None:
        return {"Status": False}

    try:
        conn, cursor = connect_database()
        cursor.execute(
            "SELECT name_user, email FROM users_Dailyfoods WHERE session_token = %s",
            (session_token,),
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return {"Status": True, "name": user[0], "email": user[1]}
        return {"Status": False}
    except Exception as e:
        return {"Status": False, "Error": str(e)}
